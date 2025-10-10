import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { hasEnoughCredits, deductCredits } from '@/lib/credits'
import { createServerClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/client'
import { nanoBananaService } from '@/lib/image-gen/nano-banana'
import { getSupabaseStorageUrl } from '@/lib/utils'
import sharp from 'sharp'

// 强制动态渲染，因为使用了 cookies
export const dynamic = 'force-dynamic'

// 图片压缩函数
async function compressImage(buffer: Buffer): Promise<Buffer> {
  try {
    const compressed = await sharp(buffer)
      .resize(1024, 1024, { 
        fit: 'inside', 
        withoutEnlargement: true 
      })
      .jpeg({ 
        quality: 85,
        progressive: true 
      })
      .toBuffer()
    
    console.log(`📦 图片压缩: ${Math.round(buffer.length / 1024)}KB -> ${Math.round(compressed.length / 1024)}KB`)
    return compressed
  } catch (error) {
    console.warn('📦 图片压缩失败，使用原图:', error)
    return buffer
  }
}

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(2, 15)
  console.log(`🚀 [${requestId}] 收到图片生成请求`)
  
  try {
    const user = await getCurrentUser()
    console.log(`👤 [${requestId}] 用户认证: ${user ? user.user_id : '未认证'}`)
    
    if (!user) {
      console.log(`❌ [${requestId}] 用户未认证，返回401`)
      return NextResponse.json(
        { error: 'Not logged in' },
        { status: 401 }
      )
    }

    // 解析表单数据，直接接收图片文件
    const formData = await request.formData()
    const imageFile = formData.get('image') as File
    const style = formData.get('style') as string

    console.log(`📝 [${requestId}] 请求参数 - 图片文件: ${imageFile?.name}, 样式: ${style}`)

    if (!imageFile || !style) {
      console.log(`❌ [${requestId}] 缺少必要参数`)
      return NextResponse.json(
        { error: 'Image file and style are required' },
        { status: 400 }
      )
    }

    // 检查积分是否足够
    console.log(`💰 [${requestId}] 检查用户积分...`)
    const hasCredits = await hasEnoughCredits(user.user_id, 1)
    console.log(`💰 [${requestId}] 积分检查结果: ${hasCredits ? '足够' : '不足'}`)
    if (!hasCredits) {
      console.log(`❌ [${requestId}] 积分不足，返回402`)
      return NextResponse.json(
        { error: 'Insufficient credits, please get more credits first' },
        { status: 402 }
      )
    }

    // 处理上传的图片文件
    console.log(`📸 [${requestId}] 开始处理上传的图片文件...`)
    const arrayBuffer = await imageFile.arrayBuffer()
    const imageBuffer = Buffer.from(arrayBuffer)
    console.log(`📊 [${requestId}] 图片大小: ${Math.round(imageBuffer.length / 1024)}KB`)
    
    // 压缩图片（如果需要）
    let processedImageBuffer: Buffer = imageBuffer
    if (imageBuffer.length > 3 * 1024 * 1024) { // 如果大于3MB
      console.log(`📦 [${requestId}] 图片过大，进行压缩处理...`)
      processedImageBuffer = await compressImage(imageBuffer)
      console.log(`📦 [${requestId}] 压缩后大小: ${Math.round(processedImageBuffer.length / 1024)}KB`)
    }

    // 上传压缩后的图片到 Supabase Storage
    const supabase = createServiceClient()
    const fileName = `source_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`
    const filePath = `uploads/${fileName}`
    
    console.log(`📤 [${requestId}] 上传压缩图片到 Supabase Storage: ${filePath}`)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('mochiface-bucket')
      .upload(filePath, processedImageBuffer, {
        contentType: 'image/jpeg'
      })

    if (uploadError) {
      console.log(`❌ [${requestId}] 图片上传失败:`, uploadError)
      return NextResponse.json(
        { error: 'Failed to upload image' },
        { status: 500 }
      )
    }

    const sourceImageUrl = getSupabaseStorageUrl('mochiface-bucket', uploadData.path)
    console.log(`✅ [${requestId}] 图片上传成功: ${sourceImageUrl}`)

    // 创建生成记录
    console.log(`🗄️ [${requestId}] 创建数据库记录...`)
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
      console.log(`❌ [${requestId}] 数据库记录创建失败:`, generationError)
      return NextResponse.json(
        { error: 'Failed to create generation task' },
        { status: 500 }
      )
    }

    // 扣减积分
    console.log(`💸 [${requestId}] 扣减用户积分...`)
    const deductSuccess = await deductCredits(user.user_id, 1, 'image_generation', generation.id)
    console.log(`💸 [${requestId}] 积分扣减结果: ${deductSuccess ? '成功' : '失败'}`)
    if (!deductSuccess) {
      console.log(`❌ [${requestId}] 积分扣减失败，返回500`)
      return NextResponse.json(
        { error: 'Failed to deduct credits' },
        { status: 500 }
      )
    }

    // 同步处理图片生成（直接使用已处理的图片）
    console.log(`🚀 [${requestId}] 开始同步图片生成任务，生成ID: ${generation.id}`)
    
    try {
      // 直接调用图片生成函数，传入已处理的图片Buffer
      await processImageGenerationWithBuffer(generation.id, processedImageBuffer, style, user.user_id)
      
      console.log(`✅ [${requestId}] 图片生成任务完成`)
      return NextResponse.json({
        id: generation.id,
        status: 'success',
        message: 'Image generation completed successfully'
      })
      
    } catch (error) {
      console.error(`❌ [${requestId}] 图片生成任务失败:`, error)
      
      // 更新数据库状态为失败
      try {
        await supabase
          .from('generated_images')
          .update({
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error'
          })
          .eq('id', generation.id)
        console.log(`✅ [${requestId}] 失败状态更新成功`)
      } catch (dbError) {
        console.error(`❌ [${requestId}] 更新失败状态时出错:`, dbError)
      }
      
      return NextResponse.json({
        id: generation.id,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Image generation failed'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Generate image error:', error)
    return NextResponse.json(
      { error: 'Image generation failed' },
      { status: 500 }
    )
  }
}

// 新的处理函数，直接使用图片Buffer
async function processImageGenerationWithBuffer(
  generationId: string, 
  sourceImageBuffer: Buffer, 
  style: string, 
  userId: string
) {
  console.log(`🔄 [${generationId}] 开始处理图片生成任务（使用Buffer）`)
  console.log(`📝 [${generationId}] 参数 - 图片大小: ${Math.round(sourceImageBuffer.length / 1024)}KB, 样式: ${style}, 用户: ${userId}`)
  
  const supabase = createServiceClient()
  
  try {
    // 更新状态为运行中
    console.log(`🔄 [${generationId}] 更新数据库状态为运行中...`)
    const { error: updateError } = await supabase
      .from('generated_images')
      .update({ status: 'running' })
      .eq('id', generationId)
    
    if (updateError) {
      console.error(`❌ [${generationId}] 更新状态为运行中失败:`, updateError)
      throw new Error(`Failed to update status to running: ${updateError.message}`)
    }
    
    console.log(`✅ [${generationId}] 数据库状态更新完成`)

    // 调用图片生成服务（直接使用Buffer）
    console.log(`🤖 [${generationId}] 开始调用Google Gemini API...`)
    const result = await nanoBananaService.generateWithBuffer({
      sourceImageBuffer,
      style,
      userId
    })
    console.log(`✅ [${generationId}] Google Gemini API调用完成`)

    // 记录数据库操作开始时间
    const dbStartTime = Date.now()
    console.log(`💾 [${userId}] 开始数据库操作，生成ID: ${generationId}`)

    // 上传结果图片到 Supabase Storage
    const fileName = `result_${generationId}_${Date.now()}.jpg`
    const filePath = `results/${fileName}`
    console.log(`📤 [${generationId}] 开始上传图片到Supabase Storage: ${filePath}`)
    console.log(`📊 [${generationId}] 图片大小: ${Math.round(result.resultImageBuffer.length / 1024)}KB`)
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('mochiface-bucket')
      .upload(filePath, result.resultImageBuffer, {
        contentType: 'image/jpeg'
      })

    if (uploadError) {
      console.log(`❌ [${generationId}] 图片上传失败:`, uploadError)
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    console.log(`✅ [${generationId}] 图片上传成功`)
    const resultImageUrl = getSupabaseStorageUrl('mochiface-bucket', uploadData.path)
    console.log(`🔗 [${generationId}] 生成图片URL: ${resultImageUrl}`)

    // 更新生成记录为成功
    console.log(`🔄 [${generationId}] 更新数据库状态为成功...`)
    const { error: successError } = await supabase
      .from('generated_images')
      .update({
        status: 'success',
        result_image_url: resultImageUrl
      })
      .eq('id', generationId)
    
    if (successError) {
      console.error(`❌ [${generationId}] 更新状态为成功失败:`, successError)
      throw new Error(`Failed to update status to success: ${successError.message}`)
    }
    
    console.log(`✅ [${generationId}] 成功状态更新完成`)

    const dbEndTime = Date.now()
    const dbDuration = dbEndTime - dbStartTime
    console.log(`✅ [${userId}] 数据库操作完成，耗时: ${dbDuration}ms`)
    console.log(`✅ [${generationId}] 图片生成任务成功完成`)

  } catch (error) {
    console.error(`❌ [${generationId}] 图片生成处理错误:`, error)
    console.error(`❌ [${generationId}] 错误详情:`, error instanceof Error ? error.message : 'Unknown error')
    
    // 更新生成记录为失败
    console.log(`🔄 [${generationId}] 更新数据库状态为失败...`)
    const { error: failError } = await supabase
      .from('generated_images')
      .update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error'
      })
      .eq('id', generationId)
    
    if (failError) {
      console.error(`❌ [${generationId}] 更新状态为失败时出错:`, failError)
    } else {
      console.log(`✅ [${generationId}] 数据库状态更新为失败完成`)
    }
  }
}

// 保留原函数以兼容其他调用
async function processImageGeneration(
  generationId: string, 
  sourceImageUrl: string, 
  style: string, 
  userId: string
) {
  console.log(`🔄 [${generationId}] 开始处理图片生成任务`)
  console.log(`📝 [${generationId}] 参数 - 源图片: ${sourceImageUrl}, 样式: ${style}, 用户: ${userId}`)
  
  const supabase = createServiceClient()
  
  try {
    // 更新状态为运行中
    console.log(`🔄 [${generationId}] 更新数据库状态为运行中...`)
    const { error: updateError } = await supabase
      .from('generated_images')
      .update({ status: 'running' })
      .eq('id', generationId)
    
    if (updateError) {
      console.error(`❌ [${generationId}] 更新状态为运行中失败:`, updateError)
      throw new Error(`Failed to update status to running: ${updateError.message}`)
    }
    
    console.log(`✅ [${generationId}] 数据库状态更新完成`)

    // 调用图片生成服务
    console.log(`🤖 [${generationId}] 开始调用Google Gemini API...`)
    const result = await nanoBananaService.generate({
      sourceImageUrl,
      style,
      userId
    })
    console.log(`✅ [${generationId}] Google Gemini API调用完成`)

    // 记录数据库操作开始时间
    const dbStartTime = Date.now()
    console.log(`💾 [${userId}] 开始数据库操作，生成ID: ${generationId}`)

    // 上传结果图片到 Supabase Storage (存储在 mochiface-bucket/results/ 路径下)
    const fileName = `result_${generationId}_${Date.now()}.jpg`
    const filePath = `results/${fileName}`
    console.log(`📤 [${generationId}] 开始上传图片到Supabase Storage: ${filePath}`)
    console.log(`📊 [${generationId}] 图片大小: ${Math.round(result.resultImageBuffer.length / 1024)}KB`)
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('mochiface-bucket')
      .upload(filePath, result.resultImageBuffer, {
        contentType: 'image/jpeg'
      })

    if (uploadError) {
      console.log(`❌ [${generationId}] 图片上传失败:`, uploadError)
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    console.log(`✅ [${generationId}] 图片上传成功`)
    const resultImageUrl = getSupabaseStorageUrl('mochiface-bucket', uploadData.path)
    console.log(`🔗 [${generationId}] 生成图片URL: ${resultImageUrl}`)

    // 更新生成记录为成功
    console.log(`🔄 [${generationId}] 更新数据库状态为成功...`)
    const { error: successError } = await supabase
      .from('generated_images')
      .update({
        status: 'success',
        result_image_url: resultImageUrl
      })
      .eq('id', generationId)
    
    if (successError) {
      console.error(`❌ [${generationId}] 更新状态为成功失败:`, successError)
      throw new Error(`Failed to update status to success: ${successError.message}`)
    }
    
    console.log(`✅ [${generationId}] 成功状态更新完成`)

    const dbEndTime = Date.now()
    const dbDuration = dbEndTime - dbStartTime
    console.log(`✅ [${userId}] 数据库操作完成，耗时: ${dbDuration}ms`)
    console.log(`✅ [${generationId}] 图片生成任务成功完成`)

  } catch (error) {
    console.error(`❌ [${generationId}] 图片生成处理错误:`, error)
    console.error(`❌ [${generationId}] 错误详情:`, error instanceof Error ? error.message : 'Unknown error')
    
    // 更新生成记录为失败
    console.log(`🔄 [${generationId}] 更新数据库状态为失败...`)
    const { error: failError } = await supabase
      .from('generated_images')
      .update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error'
      })
      .eq('id', generationId)
    
    if (failError) {
      console.error(`❌ [${generationId}] 更新状态为失败时出错:`, failError)
    } else {
      console.log(`✅ [${generationId}] 数据库状态更新为失败完成`)
    }
  }
}
