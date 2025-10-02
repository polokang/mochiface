import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getMyCredits, deductCredits } from '@/lib/credits'
import { createServiceClient } from '@/lib/supabase/client'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

// 强制动态渲染，因为使用了 cookies
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      )
    }

    // 检查积分
    const currentCredits = await getMyCredits(user.user_id)
    if (currentCredits < 1) {
      return NextResponse.json(
        { error: '积分不足' },
        { status: 400 }
      )
    }

    // 解析表单数据
    const formData = await request.formData()
    const image = formData.get('image') as File
    const style = formData.get('style') as string

    if (!image || !style) {
      return NextResponse.json(
        { error: '图片和风格都是必填项' },
        { status: 400 }
      )
    }

    // 保存原始图片
    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const imageDir = join(process.cwd(), 'public/images')
    await mkdir(imageDir, { recursive: true })
    
    const originalImageName = `original_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`
    const originalImagePath = join(imageDir, originalImageName)
    await writeFile(originalImagePath, buffer)

    // 调用 Google Nano Banana API
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY
    if (!GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: 'API 配置错误' },
        { status: 500 }
      )
    }

    try {
      // 这里需要根据实际的 Google Nano Banana API 文档来调整
      // 暂时模拟 API 调用
      const generatedImageName = `generated_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`
      const generatedImagePath = join(imageDir, generatedImageName)
      
      // 模拟生成图片（复制原图作为示例）
      await writeFile(generatedImagePath, buffer)

      // 扣除积分
      await deductCredits(user.user_id, 1, '图片生成', `generation_${Date.now()}`)

      // 保存生成记录到 Supabase
      const supabase = createServiceClient()
      const { error: generationError } = await supabase
        .from('generations')
        .insert({
          user_id: user.user_id,
          original_image: `/images/${originalImageName}`,
          generated_image: `/images/${generatedImageName}`,
          style,
          credits_used: 1,
          status: 'completed',
          created_at: new Date().toISOString()
        })

      if (generationError) {
        console.error('保存生成记录失败:', generationError)
      }

      // 获取更新后的积分
      const updatedCredits = await getMyCredits(user.user_id)

      return NextResponse.json({
        message: '图片生成成功',
        imageUrl: `/images/${generatedImageName}`,
        credits: updatedCredits,
      })

    } catch (apiError) {
      console.error('Google API 错误:', apiError)
      
      // 如果 API 调用失败，删除已保存的原始图片
      try {
        await writeFile(originalImagePath, '') // 清空文件
      } catch (cleanupError) {
        console.error('清理文件错误:', cleanupError)
      }

      return NextResponse.json(
        { error: '图片生成失败，请重试' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('生成图片错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
