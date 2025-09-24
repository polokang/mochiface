import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Generation from '@/models/Generation'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import axios from 'axios'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    // 验证用户身份
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: '无效的 token' },
        { status: 401 }
      )
    }

    // 获取用户信息
    const user = await User.findById(payload.userId)
    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    // 检查积分
    if (user.credits < 1) {
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
      const response = await axios.post(
        'https://api.google.com/nano-banana/generate', // 示例 URL
        {
          image: buffer.toString('base64'),
          style: style,
          prompt: `Transform this image to ${style} style`
        },
        {
          headers: {
            'Authorization': `Bearer ${GOOGLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 秒超时
        }
      )

      // 保存生成的图片
      const generatedImageName = `generated_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`
      const generatedImagePath = join(imageDir, generatedImageName)
      const generatedImageBuffer = Buffer.from(response.data.image, 'base64')
      await writeFile(generatedImagePath, generatedImageBuffer)

      // 扣除积分
      user.credits -= 1
      await user.save()

      // 保存生成记录
      const generation = new Generation({
        userId: user._id,
        originalImage: `/images/${originalImageName}`,
        generatedImage: `/images/${generatedImageName}`,
        style,
        creditsUsed: 1,
        status: 'completed',
      })
      await generation.save()

      return NextResponse.json({
        message: '图片生成成功',
        imageUrl: `/images/${generatedImageName}`,
        credits: user.credits,
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
