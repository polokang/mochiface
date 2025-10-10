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

    const { sourceImageUrl, style } = await request.json()
    console.log(`📝 [${requestId}] 请求参数 - 源图片: ${sourceImageUrl}, 样式: ${style}`)

    if (!sourceImageUrl || !style) {
      console.log(`❌ [${requestId}] 缺少必要参数`)
      return NextResponse.json(
        { error: 'Source image URL and style are required' },
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

    const supabase = createServiceClient()
    console.log(`🗄️ [${requestId}] 创建数据库记录...`)

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

    // 异步处理图片生成
    console.log(`🚀 [${requestId}] 启动异步图片生成任务，生成ID: ${generation.id}`)
    // 使用 setImmediate 确保异步函数在下一个事件循环中执行
    setImmediate(() => {
      processImageGeneration(generation.id, sourceImageUrl, style, user.user_id)
        .catch(async (error) => {
          console.error(`❌ [${generation.id}] 异步图片生成任务失败:`, error)
          // 更新数据库状态为失败
          try {
            const { data: failResult, error: failError } = await supabase
              .rpc('update_generation_status', {
                p_id: generation.id,
                p_status: 'failed',
                p_error_message: error instanceof Error ? error.message : 'Unknown error'
              })
            
            if (failError) {
              console.error(`❌ [${generation.id}] 更新失败状态时出错:`, failError)
            } else if (!failResult) {
              console.error(`❌ [${generation.id}] 更新失败状态失败：记录未找到`)
            } else {
              console.log(`✅ [${generation.id}] 失败状态更新成功`)
            }
          } catch (dbError) {
            console.error(`❌ [${generation.id}] 更新失败状态时异常:`, dbError)
          }
        })
    })

    console.log(`✅ [${requestId}] 图片生成请求处理完成`)
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
  console.log(`🔄 [${generationId}] 开始处理图片生成任务`)
  console.log(`📝 [${generationId}] 参数 - 源图片: ${sourceImageUrl}, 样式: ${style}, 用户: ${userId}`)
  
  const supabase = createServiceClient()
  
  // 添加超时机制
  const timeout = setTimeout(async () => {
    console.error(`⏰ [${generationId}] 图片生成任务超时，强制更新状态为失败`)
    try {
      const { data: timeoutResult, error: timeoutError } = await supabase
        .rpc('update_generation_status', {
          p_id: generationId,
          p_status: 'failed',
          p_error_message: 'Task timeout after 5 minutes'
        })
      
      if (timeoutError) {
        console.error(`❌ [${generationId}] 超时后更新状态失败:`, timeoutError)
      } else if (!timeoutResult) {
        console.error(`❌ [${generationId}] 超时后更新状态失败：记录未找到`)
      } else {
        console.log(`✅ [${generationId}] 超时状态更新成功`)
      }
    } catch (error) {
      console.error(`❌ [${generationId}] 超时后更新状态异常:`, error)
    }
  }, 5 * 60 * 1000) // 5分钟超时
  
  try {
    // 更新状态为运行中
    console.log(`🔄 [${generationId}] 更新数据库状态为运行中...`)
    const { data: updateResult, error: updateError } = await supabase
      .rpc('update_generation_status', {
        p_id: generationId,
        p_status: 'running'
      })
    
    if (updateError) {
      console.error(`❌ [${generationId}] 更新状态为运行中失败:`, updateError)
      throw new Error(`Failed to update status to running: ${updateError.message}`)
    }
    
    if (!updateResult) {
      console.error(`❌ [${generationId}] 更新状态为运行中失败：记录未找到`)
      throw new Error('Generation record not found')
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
    const { data: successResult, error: successError } = await supabase
      .rpc('update_generation_status', {
        p_id: generationId,
        p_status: 'success',
        p_result_image_url: resultImageUrl
      })
    
    if (successError) {
      console.error(`❌ [${generationId}] 更新状态为成功失败:`, successError)
      throw new Error(`Failed to update status to success: ${successError.message}`)
    }
    
    if (!successResult) {
      console.error(`❌ [${generationId}] 更新状态为成功失败：记录未找到`)
      throw new Error('Generation record not found for success update')
    }
    
    console.log(`✅ [${generationId}] 成功状态更新完成`)

    const dbEndTime = Date.now()
    const dbDuration = dbEndTime - dbStartTime
    console.log(`✅ [${userId}] 数据库操作完成，耗时: ${dbDuration}ms`)

    // 清除超时定时器
    clearTimeout(timeout)
    console.log(`✅ [${generationId}] 图片生成任务成功完成`)

  } catch (error) {
    // 清除超时定时器
    clearTimeout(timeout)
    console.error(`❌ [${generationId}] 图片生成处理错误:`, error)
    console.error(`❌ [${generationId}] 错误详情:`, error instanceof Error ? error.message : 'Unknown error')
    
    // 更新生成记录为失败
    console.log(`🔄 [${generationId}] 更新数据库状态为失败...`)
    const { data: failResult, error: failError } = await supabase
      .rpc('update_generation_status', {
        p_id: generationId,
        p_status: 'failed',
        p_error_message: error instanceof Error ? error.message : 'Unknown error'
      })
    
    if (failError) {
      console.error(`❌ [${generationId}] 更新状态为失败时出错:`, failError)
    } else if (!failResult) {
      console.error(`❌ [${generationId}] 更新状态为失败失败：记录未找到`)
    } else {
      console.log(`✅ [${generationId}] 数据库状态更新为失败完成`)
    }
  }
}
