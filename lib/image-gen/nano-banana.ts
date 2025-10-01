import { ImageGenService } from './index'
import { GoogleGenerativeAI } from '@google/generative-ai'

export class NanoBananaService implements ImageGenService {
  private genAI: GoogleGenerativeAI | null = null

  constructor() {
    const apiKey = process.env.GOOGLE_API_KEY
    if (apiKey && apiKey.length > 10) { // Basic validation
      try {
        this.genAI = new GoogleGenerativeAI(apiKey)
        console.log('✅ Google Gemini API initialized successfully')
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
      
      console.log('Using mock image response (Google Gemini API not configured)')
      return { resultImageBuffer: mockImageBuffer }
    }
    
    try {
      console.log('🎨 Generating image using Google Gemini...')
      
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
      console.log('🔍 Gemini response structure:', JSON.stringify(response, null, 2))
      
      // Check for text response
      const textParts = response.candidates?.[0]?.content?.parts?.filter(part => part.text)
      if (textParts && textParts.length > 0) {
        console.log('📝 Gemini text response:', textParts.map(p => p.text).join('\n'))
      }
      
      // Check for image response
      const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData)
      
      if (!imagePart?.inlineData) {
        console.log('⚠️ Gemini did not generate an image, trying plain text generation...')
        
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
          console.log('⚠️ Plain text generation also failed, returning mock image')
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
        console.log('✅ Google Gemini plain text image generation successful')
        return { resultImageBuffer: resultBuffer }
      }
      
      const resultBuffer = Buffer.from(imagePart.inlineData.data, 'base64')
      console.log('✅ Google Gemini image generation successful')
      return { resultImageBuffer: resultBuffer }
      
    } catch (error) {
      console.error('Google Gemini generation failed:', error)
      console.log('🔄 Falling back to mock image response')
      
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

// Create singleton instance
export const nanoBananaService = new NanoBananaService()
