'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Navbar } from '@/components/navbar'
import { Upload, Image as ImageIcon, Sparkles, AlertCircle } from 'lucide-react'
import { isValidImageType, isValidImageSize } from '@/lib/utils'

interface ImageStyle {
  id: string
  name: string
  description: string
}

export default function UploadPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedStyle, setSelectedStyle] = useState<string>('')
  const [styles, setStyles] = useState<ImageStyle[]>([])
  const [uploading, setUploading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchStyles = async () => {
    try {
      const response = await fetch('/api/image/styles')
      if (response.ok) {
        const data = await response.json()
        setStyles(data.styles)
      }
    } catch (error) {
      console.error('Failed to fetch styles:', error)
    }
  }

  // 加载风格列表
  useEffect(() => {
    fetchStyles()
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 验证文件类型
    if (!isValidImageType(file)) {
      setError('只支持 JPG、PNG、WebP 格式的图片')
      return
    }

    // 验证文件大小
    if (!isValidImageSize(file, 10)) {
      setError('图片大小不能超过 10MB')
      return
    }

    setSelectedFile(file)
    setError('')
    
    // 创建预览
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  const handleUpload = async () => {
    if (!selectedFile || !selectedStyle) {
      setError('请选择图片和风格')
      return
    }

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('图片上传成功！')
        // 自动开始生成
        handleGenerate(data.url)
      } else {
        setError(data.error || '上传失败')
      }
    } catch (error) {
      setError('上传失败，请重试')
    } finally {
      setUploading(false)
    }
  }

  const handleGenerate = async (sourceImageUrl: string) => {
    setGenerating(true)
    setError('')

    try {
      const response = await fetch('/api/image/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceImageUrl,
          style: selectedStyle,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('生成任务已创建，请到我的作品页面查看结果')
        // 跳转到仪表板
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        setError(data.error || '生成失败')
      }
    } catch (error) {
      setError('生成失败，请重试')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            <div className="h-64 bg-muted animate-pulse rounded-lg" />
          </div>
        </main>
      </div>
    )
  }

  if (!user) {
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              生成风格化头像
            </h1>
            <p className="text-gray-600">
              上传你的头像，选择喜欢的风格，AI 为你生成独特的风格化头像
            </p>
          </div>

          <div className="space-y-6">
            {/* 上传区域 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="mr-2 h-5 w-5" />
                  上传头像
                </CardTitle>
                <CardDescription>
                  选择一张清晰的人像照片，支持 JPG、PNG、WebP 格式，最大 10MB
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {previewUrl ? (
                      <div className="space-y-4">
                        <img
                          src={previewUrl}
                          alt="预览"
                          className="max-h-48 mx-auto rounded-lg"
                        />
                        <p className="text-sm text-gray-600">
                          {selectedFile?.name}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <ImageIcon className="h-12 w-12 text-gray-400 mx-auto" />
                        <div>
                          <p className="text-lg font-medium">点击上传图片</p>
                          <p className="text-sm text-gray-500">
                            或拖拽图片到此处
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </CardContent>
            </Card>

            {/* 风格选择 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="mr-2 h-5 w-5" />
                  选择风格
                </CardTitle>
                <CardDescription>
                  选择你喜欢的艺术风格
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择风格" />
                  </SelectTrigger>
                  <SelectContent>
                    {styles.map((style) => (
                      <SelectItem key={style.id} value={style.id}>
                        <div>
                          <div className="font-medium">{style.name}</div>
                          <div className="text-sm text-gray-500">
                            {style.description}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* 错误和成功提示 */}
            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-lg">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-4 rounded-lg">
                <Sparkles className="h-5 w-5" />
                <span>{success}</span>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex space-x-4">
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || !selectedStyle || uploading || generating}
                className="flex-1"
              >
                {uploading ? '上传中...' : generating ? '生成中...' : '开始生成'}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard')}
              >
                查看我的作品
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
