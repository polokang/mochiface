import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { hasEnoughCredits, deductCredits } from '@/lib/credits'
import { createServerClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/client'
import { nanoBananaService } from '@/lib/image-gen/nano-banana'
import { getSupabaseStorageUrl } from '@/lib/utils'

// 强制动态渲染，因为使用了 cookies
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not logged in' },
        { status: 401 }
      )
    }

    const { sourceImageUrl, style } = await request.json()

    if (!sourceImageUrl || !style) {
      return NextResponse.json(
        { error: 'Source image URL and style are required' },
        { status: 400 }
      )
    }

    // 检查积分是否足够
    const hasCredits = await hasEnoughCredits(user.user_id, 1)
    if (!hasCredits) {
      return NextResponse.json(
        { error: 'Insufficient credits, please get more credits first' },
        { status: 402 }
      )
    }

    const supabase = createServiceClient()

    // 创建生成记录
    const { data: generation, error: generationError } = await supabase
      .from('generated_images')
      .insert({
        user_id: user.user_id,
        source_image_url: sourceImageUrl,
        style: style,
        status: 'queued'
      })
      .select()
      .single()

    if (generationError || !generation) {
      return NextResponse.json(
        { error: 'Failed to create generation task' },
        { status: 500 }
      )
    }

    // 扣减积分
    const deductSuccess = await deductCredits(user.user_id, 1, 'image_generation', generation.id)
    if (!deductSuccess) {
      return NextResponse.json(
        { error: 'Failed to deduct credits' },
        { status: 500 }
      )
    }

    // 异步处理图片生成
    processImageGeneration(generation.id, sourceImageUrl, style, user.user_id)

    return NextResponse.json({
      id: generation.id,
      status: 'queued',
      message: 'Generation task created, please check results later'
    })

  } catch (error) {
    console.error('Generate image error:', error)
    return NextResponse.json(
      { error: 'Image generation failed' },
      { status: 500 }
    )
  }
}

async function processImageGeneration(
  generationId: string, 
  sourceImageUrl: string, 
  style: string, 
  userId: string
) {
  const supabase = createServiceClient()
  
  try {
    // 更新状态为运行中
    await supabase
      .from('generated_images')
      .update({ status: 'running' })
      .eq('id', generationId)

    // 调用图片生成服务
    const result = await nanoBananaService.generate({
      sourceImageUrl,
      style,
      userId
    })

    // 记录数据库操作开始时间
    const dbStartTime = Date.now()
    console.log(`💾 [${userId}] 开始数据库操作，生成ID: ${generationId}`)

    // 上传结果图片到 Supabase Storage
    const fileName = `result_${generationId}_${Date.now()}.jpg`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('results')
      .upload(fileName, result.resultImageBuffer, {
        contentType: 'image/jpeg'
      })

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    const resultImageUrl = getSupabaseStorageUrl('results', uploadData.path)

    // 更新生成记录为成功
    await supabase
      .from('generated_images')
      .update({
        status: 'success',
        result_image_url: resultImageUrl
      })
      .eq('id', generationId)

    const dbEndTime = Date.now()
    const dbDuration = dbEndTime - dbStartTime
    console.log(`✅ [${userId}] 数据库操作完成，耗时: ${dbDuration}ms`)

  } catch (error) {
    console.error(`❌ [${userId}] 图片生成处理错误:`, error)
    
    // 更新生成记录为失败
    await supabase
      .from('generated_images')
      .update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error'
      })
      .eq('id', generationId)
  }
}
