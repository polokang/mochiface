'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, X, Image as ImageIcon } from 'lucide-react'

interface ImageUploadProps {
  onUploadSuccess: (imageUrl: string) => void
  onUploadError: (error: string) => void
  disabled?: boolean
}

export function ImageUpload({ onUploadSuccess, onUploadError, disabled = false }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        onUploadError('请选择图片文件')
        return
      }

      // 检查文件大小 (5MB 限制)
      if (file.size > 5 * 1024 * 1024) {
        onUploadError('图片大小不能超过 5MB')
        return
      }

      setSelectedFile(file)
      
      // 创建预览
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    try {
      // 使用服务端 API 上传
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '上传失败')
      }

      onUploadSuccess(data.url)
      
      // 重置状态
      setSelectedFile(null)
      setPreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Upload error:', error)
      onUploadError(error instanceof Error ? error.message : '上传失败')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setSelectedFile(null)
    setPreview(null)
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
      
      {!preview ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="w-full"
        >
          <Upload className="mr-2 h-4 w-4" />
          选择图片
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <img
              src={preview}
              alt="预览"
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
          
          <div className="flex space-x-2">
            <Button
              onClick={handleUpload}
              disabled={uploading || disabled}
              className="flex-1"
            >
              {uploading ? '上传中...' : '上传图片'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleRemove}
              disabled={uploading}
            >
              取消
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
