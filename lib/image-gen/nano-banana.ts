import { ImageGenService } from './index'
import { GoogleGenerativeAI } from '@google/generative-ai'

export class NanoBananaService implements ImageGenService {
  private genAI: GoogleGenerativeAI | null = null

  constructor() {
    const apiKey = process.env.GOOGLE_API_KEY
    console.log('apiKey======================>', apiKey)
    if (apiKey && apiKey.length > 10) { // 基本验证
      try {
        this.genAI = new GoogleGenerativeAI(apiKey)
        console.log('✅ Google Gemini API 初始化成功')
      } catch (error) {
        console.warn('⚠️ Google Gemini API 初始化失败:', error)
        this.genAI = null
      }
    } else {
      console.warn('⚠️ GOOGLE_API_KEY 未设置或无效')
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
      // 返回模拟的图片数据（1x1 像素的 PNG）
      const mockImageBuffer = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG 文件头
        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 像素
        0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, // IHDR 数据
        0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, 0x54, // IDAT chunk
        0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // IDAT 数据
        0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82 // IEND chunk
      ])
      
      console.log('使用模拟图片响应（Google Gemini API 未配置）')
      return { resultImageBuffer: mockImageBuffer }
    }
    
    try {
      console.log('🎨 使用 Google Gemini 生成图片...')
      
      // 从 Supabase Storage URL 下载源图片
      const sourceImageBuffer = await this.downloadImage(input.sourceImageUrl)
      
      // 将图片转换为 base64
      const base64Image = sourceImageBuffer.toString('base64')
      const mimeType = this.getMimeType(sourceImageBuffer)
      
      // 构建提示词
      const prompt = this.buildPrompt(input.style)
      
      // 使用 Gemini 生成图片
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
      console.log('🔍 Gemini 响应结构:', JSON.stringify(response, null, 2))
      
      // 检查是否有文本响应
      const textParts = response.candidates?.[0]?.content?.parts?.filter(part => part.text)
      if (textParts && textParts.length > 0) {
        console.log('📝 Gemini 文本响应:', textParts.map(p => p.text).join('\n'))
      }
      
      // 检查是否有图片响应
      const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData)
      
      if (!imagePart?.inlineData) {
        console.log('⚠️ Gemini 没有生成图片，尝试纯文本生成...')
        
        // 尝试纯文本生成
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
          console.log('⚠️ 纯文本生成也失败，返回模拟图片')
          // 返回模拟图片
          const mockImageBuffer = Buffer.from([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG 文件头
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 像素
            0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, // IHDR 数据
            0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, 0x54, // IDAT chunk
            0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // IDAT 数据
            0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82 // IEND chunk
          ])
          return { resultImageBuffer: mockImageBuffer }
        }
        
        const resultBuffer = Buffer.from(textOnlyImagePart.inlineData.data, 'base64')
        console.log('✅ Google Gemini 纯文本图片生成成功')
        return { resultImageBuffer: resultBuffer }
      }
      
      const resultBuffer = Buffer.from(imagePart.inlineData.data, 'base64')
      console.log('✅ Google Gemini 图片生成成功')
      return { resultImageBuffer: resultBuffer }
      
    } catch (error) {
      console.error('Google Gemini generation failed:', error)
      console.log('🔄 回退到模拟图片响应')
      
      // 回退到模拟图片
      const mockImageBuffer = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG 文件头
        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 像素
        0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, // IHDR 数据
        0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, 0x54, // IDAT chunk
        0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // IDAT 数据
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
    // 检查文件头来确定 MIME 类型
    if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
      return 'image/jpeg'
    } else if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
      return 'image/png'
    } else if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
      return 'image/gif'
    } else if (buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
      return 'image/webp'
    }
    return 'image/jpeg' // 默认
  }

  private buildPrompt(style: string): string {
    const stylePrompts: { [key: string]: string } = {
      'anime': 'Transform this image into anime style with vibrant colors, large expressive eyes, and clean line art',
      'cartoon': 'Convert this image to cartoon style with bold outlines, simplified shapes, and bright colors',
      'realistic': 'Make this image more photorealistic with enhanced details, natural lighting, and realistic textures',
      'oil_painting': 'Transform this image into an oil painting style with visible brushstrokes, rich colors, and artistic texture',
      'watercolor': 'Convert this image to watercolor style with soft edges, translucent colors, and flowing paint effects',
      'sketch': 'Transform this image into a pencil sketch with detailed line work, shading, and artistic cross-hatching',
      'cyberpunk': 'Convert this image to cyberpunk style with neon colors, futuristic elements, and high-tech aesthetics',
      'vintage': 'Transform this image into vintage style with retro colors, film grain, and nostalgic atmosphere',
      'fantasy': 'Convert this image to fantasy style with magical elements, ethereal lighting, and mystical atmosphere',
      'minimalist': 'Transform this image into minimalist style with clean lines, simple shapes, and reduced details'
    }

    const basePrompt = stylePrompts[style] || `Transform this image with ${style} style`
    
    return `${basePrompt}. Maintain the original composition and subject while applying the new artistic style. The result should be a high-quality, professional-looking image that preserves the essence of the original while showcasing the requested style transformation.`
  }
}

// 创建单例实例
export const nanoBananaService = new NanoBananaService()
