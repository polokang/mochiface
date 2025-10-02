import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generate random string
 */
export function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Format file size in MB
 */
export function formatFileSizeMB(bytes: number): string {
  const mb = bytes / (1024 * 1024)
  return parseFloat(mb.toFixed(2)) + 'M'
}

/**
 * Validate image file type
 */
export function isValidImageType(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  return validTypes.includes(file.type)
}

/**
 * Validate image file size
 */
export function isValidImageSize(file: File, maxSizeMB: number = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxSizeBytes
}

/**
 * Generate Supabase Storage URL
 */
export function getSupabaseStorageUrl(bucket: string, path: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`
}

/**
 * Delay function
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 压缩图片
 */
export function compressImage(
  file: File, 
  options: {
    maxWidth?: number
    maxHeight?: number
    quality?: number
    maxSizeKB?: number
  } = {}
): Promise<File> {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = 1024,
      maxHeight = 1024,
      quality = 0.8,
      maxSizeKB = 500
    } = options

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // 计算压缩后的尺寸
      let { width, height } = img
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }

      // 设置canvas尺寸
      canvas.width = width
      canvas.height = height

      // 绘制压缩后的图片
      ctx?.drawImage(img, 0, 0, width, height)

      // 转换为Blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('图片压缩失败'))
            return
          }

          // 检查文件大小，如果仍然太大则进一步压缩
          if (blob.size > maxSizeKB * 1024) {
            const newQuality = Math.max(0.1, quality * 0.7)
            canvas.toBlob(
              (compressedBlob) => {
                if (!compressedBlob) {
                  reject(new Error('图片压缩失败'))
                  return
                }
                
                const compressedFile = new File([compressedBlob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                })
                resolve(compressedFile)
              },
              'image/jpeg',
              newQuality
            )
          } else {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            })
            resolve(compressedFile)
          }
        },
        'image/jpeg',
        quality
      )
    }

    img.onerror = () => {
      reject(new Error('图片加载失败'))
    }

    img.src = URL.createObjectURL(file)
  })
}

/**
 * 智能压缩图片 - 根据文件大小自动调整压缩参数
 */
export async function smartCompressImage(file: File): Promise<File> {
  const fileSizeMB = file.size / (1024 * 1024)
  
  // 根据文件大小选择压缩策略
  if (fileSizeMB <= 1) {
    // 小于1MB，轻度压缩
    return compressImage(file, {
      maxWidth: 1024,
      maxHeight: 1024,
      quality: 0.9,
      maxSizeKB: 800
    })
  } else if (fileSizeMB <= 3) {
    // 1-3MB，中度压缩
    return compressImage(file, {
      maxWidth: 800,
      maxHeight: 800,
      quality: 0.8,
      maxSizeKB: 500
    })
  } else {
    // 大于3MB，重度压缩
    return compressImage(file, {
      maxWidth: 600,
      maxHeight: 600,
      quality: 0.7,
      maxSizeKB: 300
    })
  }
}