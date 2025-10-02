'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { smartCompressImage } from '@/lib/utils'

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

interface ImageUploadProps {
  onUploadSuccess: (imageUrl: string, fileSize?: number) => void
  onUploadError: (error: string) => void
  disabled?: boolean
}

export function ImageUpload({ onUploadSuccess, onUploadError, disabled = false }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [compressing, setCompressing] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileSize, setFileSize] = useState<string>('')
  const [compressionInfo, setCompressionInfo] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        onUploadError('Please select an image file')
        return
      }

      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        onUploadError('Image size cannot exceed 10MB')
        return
      }

      setCompressing(true)
      
      try {
        // 智能压缩图片
        const compressedFile = await smartCompressImage(file)
        
        setSelectedFile(compressedFile)
        
        // 设置文件大小
        setFileSize(formatFileSize(compressedFile.size))
        
        // 设置压缩信息
        const originalSize = formatFileSize(file.size)
        const compressedSize = formatFileSize(compressedFile.size)
        const compressionRatio = ((file.size - compressedFile.size) / file.size * 100).toFixed(1)
        setCompressionInfo(`原始: ${originalSize} → 压缩后: ${compressedSize} (减少 ${compressionRatio}%)`)
        
        // Create preview
        const reader = new FileReader()
        reader.onload = (e) => {
          setPreview(e.target?.result as string)
        }
        reader.readAsDataURL(compressedFile)
      } catch (error) {
        console.error('图片压缩失败:', error)
        onUploadError('图片压缩失败，请重试')
      } finally {
        setCompressing(false)
      }
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    try {
      // Use server API to upload
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      onUploadSuccess(data.url, selectedFile.size)
      
      // Reset state
      setSelectedFile(null)
      setPreview(null)
      setFileSize('')
      setCompressionInfo('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Upload error:', error)
      onUploadError(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setSelectedFile(null)
    setPreview(null)
    setFileSize('')
    setCompressionInfo('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />
      
      {compressing ? (
        <div className="space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-600 text-center">正在压缩图片...</p>
        </div>
      ) : !preview ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="w-full"
        >
          <Upload className="mr-2 h-4 w-4" />
          Select Image
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg border"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              className="absolute top-2 right-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* 显示文件大小和压缩信息 */}
          {fileSize && (
            <div className="text-sm text-gray-600 text-center space-y-1">
              <div>文件大小: {fileSize}</div>
              {compressionInfo && (
                <div className="text-xs text-green-600">
                  {compressionInfo}
                </div>
              )}
            </div>
          )}
          
          <div className="flex space-x-2">
            <Button
              onClick={handleUpload}
              disabled={uploading || disabled || compressing}
              className="flex-1"
            >
              {compressing ? 'Compressing...' : uploading ? 'Uploading...' : 'Upload Image'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleRemove}
              disabled={uploading}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
