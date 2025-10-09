import { ImageGenService } from './index'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getPerformanceConfig, PerformanceMonitor } from './performance-config'
import { imageCache } from './cache'

export class NanoBananaService implements ImageGenService {
  private genAI: GoogleGenerativeAI | null = null
  private config = getPerformanceConfig()

  constructor() {
    const apiKey = process.env.GOOGLE_API_KEY
    if (apiKey && apiKey.length > 10) { // Basic validation
      try {
        this.genAI = new GoogleGenerativeAI(apiKey)
      } catch (error) {
        console.warn('⚠️ Google Gemini API initialization failed:', error)
        this.genAI = null
      }
    } else {
      console.warn('⚠️ GOOGLE_API_KEY not set or invalid')
    }
  }

  private validateConfig() {
    if (!this.genAI) {
      console.warn('Google Gemini API configuration is missing, using mock response')
      return false
    }
    return true
  }

  async generate(input: {
    sourceImageUrl: string;
    style: string;
    userId: string;
  }): Promise<{ resultImageBuffer: Buffer }> {
    const monitor = new PerformanceMonitor(this.config)
    monitor.start(`图片生成-${input.style}`)
    
    // 检查缓存
    const cachedResult = imageCache.get(input.sourceImageUrl, input.style)
    if (cachedResult) {
      monitor.checkpoint('缓存命中')
      monitor.end(`图片生成-${input.style}`)
      return { resultImageBuffer: cachedResult }
    }
    
    const isConfigValid = this.validateConfig()
    
    if (!isConfigValid) {
      // Return mock image data (1x1 pixel PNG)
      const mockImageBuffer = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG file header
        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 pixel
        0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, // IHDR data
        0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, 0x54, // IDAT chunk
        0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // IDAT data
        0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82 // IEND chunk
      ])
      
      monitor.end(`图片生成-${input.style}`)
      return { resultImageBuffer: mockImageBuffer }
    }
    
    try {
      // 记录 Google API 调用开始时间
      const apiStartTime = Date.now()
      console.log(`🚀 [${input.userId}] 开始调用 Google API 生成图片，样式: ${input.style}`)
      
      // 记录图片下载时间
      const downloadStartTime = Date.now()
      let sourceImageBuffer: Buffer
      
      try {
        sourceImageBuffer = await this.downloadImage(input.sourceImageUrl)
        const downloadEndTime = Date.now()
        console.log(`📥 [${input.userId}] 图片下载完成，耗时: ${downloadEndTime - downloadStartTime}ms，大小: ${Math.round(sourceImageBuffer.length / 1024)}KB`)
      } catch (downloadError) {
        console.error(`❌ [${input.userId}] 图片下载失败:`, downloadError)
        
        // 降级处理：使用默认图片或返回错误
        if (process.env.VERCEL) {
          // 在Vercel环境中，如果下载失败，返回一个简单的错误图片
          const errorImageBuffer = this.createErrorImage(input.style)
          const downloadEndTime = Date.now()
          console.log(`🔄 [${input.userId}] 使用降级图片，耗时: ${downloadEndTime - downloadStartTime}ms`)
          sourceImageBuffer = errorImageBuffer
        } else {
          // 在本地环境中，重新抛出错误
          throw downloadError
        }
      }
      
      // 记录base64转换时间
      const convertStartTime = Date.now()
      const base64Image = sourceImageBuffer.toString('base64')
      const mimeType = this.getMimeType(sourceImageBuffer)
      const convertEndTime = Date.now()
      console.log(`🔄 [${input.userId}] Base64转换完成，耗时: ${convertEndTime - convertStartTime}ms`)
      
      // Build prompt
      const prompt = this.buildPrompt(input.style)
      
      // Use Gemini to generate image - 修复模型名称
      console.log(`🤖 [${input.userId}] 开始初始化Gemini模型: gemini-2.5-flash-image`)
      const model = this.genAI!.getGenerativeModel({ 
        model: "gemini-2.5-flash-image", // 使用可用的pro模型
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
      console.log(`✅ [${input.userId}] Gemini模型初始化完成`)
      
      // 优化API调用，添加超时和重试机制
      const apiCallStartTime = Date.now()
      console.log(`🚀 [${input.userId}] 开始调用Google API生成图片...`)
      console.log(`📝 [${input.userId}] 使用的提示词: ${prompt.substring(0, 100)}...`)
      console.log(`🖼️ [${input.userId}] 图片数据大小: ${base64Image.length} 字符`)
      console.log(`📄 [${input.userId}] 图片MIME类型: ${mimeType}`)
      
      const result = await this.callWithRetry(async () => {
        console.log(`🔄 [${input.userId}] 执行generateContent调用...`)
        const response = await model.generateContent([
          {
            text: prompt
          },
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType
            }
          }
        ])
        console.log(`✅ [${input.userId}] generateContent调用成功`)
        return response
      })
      const apiCallEndTime = Date.now()
      console.log(`🤖 [${input.userId}] Google API调用完成，耗时: ${apiCallEndTime - apiCallStartTime}ms`)
      
      const response = await result.response
      console.log(`📊 [${input.userId}] 收到Google API响应`)
      console.log(`📋 [${input.userId}] 响应候选数量: ${response.candidates?.length || 0}`)
      
      // Check for text response
      const textParts = response.candidates?.[0]?.content?.parts?.filter(part => part.text)
      console.log(`📝 [${input.userId}] 文本响应部分数量: ${textParts?.length || 0}`)
      
      // Check for image response
      const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData)
      console.log(`🖼️ [${input.userId}] 图片响应部分: ${imagePart ? '存在' : '不存在'}`)
      
      if (!imagePart?.inlineData) {
        console.log(`⚠️ [${input.userId}] 未收到图片数据，尝试备用模型...`)
        // Try plain text generation
        const textOnlyModel = this.genAI!.getGenerativeModel({ 
          model: "gemini-1.5-pro",
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
        
        const textOnlyResult = await textOnlyModel.generateContent([
          {
            text: `Create a high-quality ${input.style} style image. ${prompt}`
          }
        ])
        
        const textOnlyResponse = await textOnlyResult.response
        console.log(`📊 [${input.userId}] 备用模型响应接收完成`)
        const textOnlyImagePart = textOnlyResponse.candidates?.[0]?.content?.parts?.find(part => part.inlineData)
        console.log(`🖼️ [${input.userId}] 备用模型图片响应部分: ${textOnlyImagePart ? '存在' : '不存在'}`)
        
        if (!textOnlyImagePart?.inlineData) {
          console.log(`❌ [${input.userId}] 备用模型也未返回图片，使用模拟图片`)
          // Return mock image
          const mockImageBuffer = Buffer.from([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG file header
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 pixel
            0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, // IHDR data
            0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, 0x54, // IDAT chunk
            0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // IDAT data
            0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82 // IEND chunk
          ])
          console.log(`🔄 [${input.userId}] 返回模拟图片，大小: ${mockImageBuffer.length} 字节`)
          return { resultImageBuffer: mockImageBuffer }
        }
        
        const resultBuffer = Buffer.from(textOnlyImagePart.inlineData.data, 'base64')
        console.log(`✅ [${input.userId}] 备用模型成功生成图片，大小: ${resultBuffer.length} 字节`)
        const apiEndTime = Date.now()
        const apiDuration = apiEndTime - apiStartTime
        console.log(`✅ [${input.userId}] Google API 图片生成完成，耗时: ${apiDuration}ms`)
        return { resultImageBuffer: resultBuffer }
      }
      
      const resultBuffer = Buffer.from(imagePart.inlineData.data, 'base64')
      console.log(`✅ [${input.userId}] 主模型成功生成图片，大小: ${resultBuffer.length} 字节`)
      const apiEndTime = Date.now()
      const apiDuration = apiEndTime - apiStartTime
      console.log(`✅ [${input.userId}] Google API 图片生成完成，耗时: ${apiDuration}ms`)
      
      // 存储到缓存
      imageCache.set(input.sourceImageUrl, input.style, resultBuffer)
      monitor.checkpoint('缓存存储')
      monitor.end(`图片生成-${input.style}`)
      
      return { resultImageBuffer: resultBuffer }
      
    } catch (error) {
      console.error(`❌ [${input.userId}] Google API 生成失败:`, error)
      
      // Fall back to mock image
      const mockImageBuffer = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG file header
        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 pixel
        0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, // IHDR data
        0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, 0x54, // IDAT chunk
        0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // IDAT data
        0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82 // IEND chunk
      ])
      
      return { resultImageBuffer: mockImageBuffer }
    }
  }

  private async downloadImage(url: string): Promise<Buffer> {
    const maxRetries = process.env.VERCEL ? 3 : 2
    const baseTimeout = process.env.VERCEL ? 8000 : 15000
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // 使用递增的超时时间
        const timeout = baseTimeout + (attempt * 2000)
        console.log(`📥 [下载尝试 ${attempt + 1}/${maxRetries}] 超时时间: ${timeout}ms`)
        
        const response = await fetch(url, {
          signal: AbortSignal.timeout(timeout),
          headers: {
            'Accept': 'image/*',
            'Cache-Control': 'no-cache',
            'User-Agent': 'MochiFace/1.0',
            'Connection': 'keep-alive'
          }
        })
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const buffer = Buffer.from(await response.arrayBuffer())
        console.log(`✅ [下载成功] 大小: ${Math.round(buffer.length / 1024)}KB`)
        
        // 图片大小优化 - 如果图片太大则压缩
        if (buffer.length > this.config.maxImageSize) {
          console.log(`📦 图片过大 (${Math.round(buffer.length / 1024 / 1024)}MB)，进行压缩处理`)
          return this.compressImage(buffer)
        }
        
        return buffer
        
      } catch (error) {
        const isLastAttempt = attempt === maxRetries - 1
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        
        console.warn(`⚠️ [下载失败 ${attempt + 1}/${maxRetries}] ${errorMessage}`)
        
        if (isLastAttempt) {
          throw new Error(`Failed to download source image after ${maxRetries} attempts: ${errorMessage}`)
        }
        
        // 等待后重试
        const delay = 1000 * (attempt + 1)
        console.log(`⏳ 等待 ${delay}ms 后重试...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    throw new Error('Unexpected error in downloadImage')
  }

  private compressImage(buffer: Buffer): Buffer {
    // 简单的图片压缩 - 这里可以集成sharp等库进行更好的压缩
    // 目前先返回原图，后续可以添加更复杂的压缩逻辑
    console.log('📦 图片压缩功能待实现，建议集成sharp库')
    return buffer
  }

  /**
   * 创建错误图片（当下载失败时使用）
   */
  private createErrorImage(style: string): Buffer {
    // 创建一个简单的错误提示图片
    // 这里返回一个1x1像素的PNG图片，实际应用中可以创建一个更友好的错误图片
    const errorImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG file header
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 pixel
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, // IHDR data
      0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, 0x54, // IDAT chunk
      0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // IDAT data
      0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82 // IEND chunk
    ])
    
    console.log(`🔄 [降级处理] 为样式 ${style} 创建错误图片`)
    return errorImageBuffer
  }

  private getMimeType(buffer: Buffer): string {
    // Check file header to determine MIME type
    if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
      return 'image/jpeg'
    } else if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
      return 'image/png'
    } else if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
      return 'image/gif'
    } else if (buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
      return 'image/webp'
    }
    return 'image/jpeg' // Default
  }

  private buildPrompt(style: string): string {
    // Import IMAGE_STYLES to get the configured prompt
    const { IMAGE_STYLES } = require('./index')
    
    // Find the style configuration
    const styleConfig = IMAGE_STYLES.find((s: any) => s.id === style)
    
    // Use configured prompt or fallback
    const basePrompt = styleConfig?.prompt || `Transform this image with ${style} style`
    
    return `${basePrompt}. Maintain the original composition and subject while applying the new artistic style. The result should be a high-quality, professional-looking image that preserves the essence of the original while showcasing the requested style transformation.`
  }

  /**
   * 带重试机制的API调用
   */
  private async callWithRetry<T>(
    apiCall: () => Promise<T>,
    maxRetries: number = process.env.VERCEL ? 1 : this.config.maxRetries, // Vercel环境减少重试次数
    baseDelay: number = process.env.VERCEL ? 500 : this.config.retryDelay // Vercel环境使用更短延迟
  ): Promise<T> {
    let lastError: Error | null = null
    console.log(`🔄 [重试机制] 最大重试次数: ${maxRetries}, 基础延迟: ${baseDelay}ms`)
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          const delay = baseDelay * Math.pow(2, attempt - 1) // 指数退避
          console.log(`🔄 [重试 ${attempt}/${maxRetries}] 等待 ${delay}ms 后重试...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
        
        console.log(`🚀 [API调用] 第 ${attempt + 1} 次尝试调用...`)
        const result = await apiCall()
        if (attempt > 0) {
          console.log(`✅ [重试成功] 第 ${attempt} 次重试成功`)
        } else {
          console.log(`✅ [首次成功] API调用成功`)
        }
        return result
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error')
        console.warn(`⚠️ [重试 ${attempt}/${maxRetries}] API调用失败:`, lastError.message)
        
        // 如果是最后一次尝试，抛出错误
        if (attempt === maxRetries) {
          throw lastError
        }
      }
    }
    
    throw lastError || new Error('Max retries exceeded')
  }
}

// Create singleton instance
export const nanoBananaService = new NanoBananaService()
