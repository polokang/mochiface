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
      const sourceImageBuffer = await this.downloadImage(input.sourceImageUrl)
      const downloadEndTime = Date.now()
      console.log(`📥 [${input.userId}] 图片下载完成，耗时: ${downloadEndTime - downloadStartTime}ms，大小: ${Math.round(sourceImageBuffer.length / 1024)}KB`)
      
      // 记录base64转换时间
      const convertStartTime = Date.now()
      const base64Image = sourceImageBuffer.toString('base64')
      const mimeType = this.getMimeType(sourceImageBuffer)
      const convertEndTime = Date.now()
      console.log(`🔄 [${input.userId}] Base64转换完成，耗时: ${convertEndTime - convertStartTime}ms`)
      
      // Build prompt
      const prompt = this.buildPrompt(input.style)
      
      // Use Gemini to generate image - 修复模型名称
      const model = this.genAI!.getGenerativeModel({ 
        model: "gemini-2.5-flash-image", // 使用可用的pro模型
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
      
      // 优化API调用，添加超时和重试机制
      const apiCallStartTime = Date.now()
      const result = await this.callWithRetry(async () => {
        return await model.generateContent([
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
      })
      const apiCallEndTime = Date.now()
      console.log(`🤖 [${input.userId}] Google API调用完成，耗时: ${apiCallEndTime - apiCallStartTime}ms`)
      
      const response = await result.response
      
      // Check for text response
      const textParts = response.candidates?.[0]?.content?.parts?.filter(part => part.text)
      
      // Check for image response
      const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData)
      
      if (!imagePart?.inlineData) {
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
        const textOnlyImagePart = textOnlyResponse.candidates?.[0]?.content?.parts?.find(part => part.inlineData)
        
        if (!textOnlyImagePart?.inlineData) {
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
          return { resultImageBuffer: mockImageBuffer }
        }
        
        const resultBuffer = Buffer.from(textOnlyImagePart.inlineData.data, 'base64')
        const apiEndTime = Date.now()
        const apiDuration = apiEndTime - apiStartTime
        console.log(`✅ [${input.userId}] Google API 图片生成完成，耗时: ${apiDuration}ms`)
        return { resultImageBuffer: resultBuffer }
      }
      
      const resultBuffer = Buffer.from(imagePart.inlineData.data, 'base64')
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
    try {
      const response = await fetch(url, {
        // 使用配置的超时时间
        signal: AbortSignal.timeout(this.config.apiTimeout),
        headers: {
          'Accept': 'image/*',
          'Cache-Control': 'no-cache'
        }
      })
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.status}`)
      }
      const buffer = Buffer.from(await response.arrayBuffer())
      
      // 图片大小优化 - 如果图片太大则压缩
      if (buffer.length > this.config.maxImageSize) {
        console.log(`📦 图片过大 (${Math.round(buffer.length / 1024 / 1024)}MB)，进行压缩处理`)
        return this.compressImage(buffer)
      }
      
      return buffer
    } catch (error) {
      throw new Error(`Failed to download source image: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private compressImage(buffer: Buffer): Buffer {
    // 简单的图片压缩 - 这里可以集成sharp等库进行更好的压缩
    // 目前先返回原图，后续可以添加更复杂的压缩逻辑
    console.log('📦 图片压缩功能待实现，建议集成sharp库')
    return buffer
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
    maxRetries: number = this.config.maxRetries,
    baseDelay: number = this.config.retryDelay
  ): Promise<T> {
    let lastError: Error | null = null
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          const delay = baseDelay * Math.pow(2, attempt - 1) // 指数退避
          console.log(`🔄 [重试 ${attempt}/${maxRetries}] 等待 ${delay}ms 后重试...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
        
        const result = await apiCall()
        if (attempt > 0) {
          console.log(`✅ [重试成功] 第 ${attempt} 次重试成功`)
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
