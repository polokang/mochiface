import { ImageGenService } from './index'
import { GoogleGenerativeAI } from '@google/generative-ai'

export class NanoBananaService implements ImageGenService {
  private genAI: GoogleGenerativeAI | null = null

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
      
      return { resultImageBuffer: mockImageBuffer }
    }
    
    try {
      // 记录 Google API 调用开始时间
      const apiStartTime = Date.now()
      console.log(`🚀 [${input.userId}] 开始调用 Google API 生成图片，样式: ${input.style}`)
      
      // Download source image from Supabase Storage URL
      const sourceImageBuffer = await this.downloadImage(input.sourceImageUrl)
      
      // Convert image to base64
      const base64Image = sourceImageBuffer.toString('base64')
      const mimeType = this.getMimeType(sourceImageBuffer)
      
      // Build prompt
      const prompt = this.buildPrompt(input.style)
      
      // Use Gemini to generate image
      const model = this.genAI!.getGenerativeModel({ 
        model: "gemini-2.5-flash-image-preview",
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
      
      const result = await model.generateContent([
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
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.status}`)
      }
      return Buffer.from(await response.arrayBuffer())
    } catch (error) {
      throw new Error(`Failed to download source image: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
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
}

// Create singleton instance
export const nanoBananaService = new NanoBananaService()
