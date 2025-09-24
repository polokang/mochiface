'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Upload, Wand2, User, Coins, LogOut, Sparkles } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/lib/auth-context'
import Image from 'next/image'

const ART_STYLES = [
  { value: 'anime', label: '动漫风格' },
  { value: 'realistic', label: '写实风格' },
  { value: 'cartoon', label: '卡通风格' },
  { value: 'oil_painting', label: '油画风格' },
  { value: 'watercolor', label: '水彩风格' },
  { value: 'sketch', label: '素描风格' },
]

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedStyle, setSelectedStyle] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const { user, logout, credits } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        toast.error('请选择图片文件')
        return
      }

      // 验证文件大小 (最大 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('图片大小不能超过 10MB')
        return
      }

      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGenerate = async () => {
    if (!selectedFile || !selectedStyle) {
      toast.error('请选择图片和风格')
      return
    }

    if (credits < 1) {
      toast.error('积分不足，请充值')
      return
    }

    setIsGenerating(true)
    const formData = new FormData()
    formData.append('image', selectedFile)
    formData.append('style', selectedStyle)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setGeneratedImage(data.imageUrl)
        toast.success('图片生成成功！')
      } else {
        toast.error(data.error || '生成失败')
      }
    } catch (error) {
      toast.error('网络错误，请重试')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-200/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header className="glass-bg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Image
                  src="/logo.png"
                  alt="MochiFace Logo"
                  width={48}
                  height={48}
                  className="drop-shadow-lg rounded-full"
                />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-400 rounded-full animate-ping"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                  MochiFace
                </h1>
                <p className="text-xs text-gray-600">AI 图片生成平台</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="glass-card px-4 py-2 rounded-xl">
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <User className="h-4 w-4" />
                  <span className="font-medium">{user.username}</span>
                </div>
              </div>
              <div className="glass-card px-4 py-2 rounded-xl">
                <div className="flex items-center space-x-2 text-sm text-pink-600">
                  <Coins className="h-4 w-4" />
                  <span className="font-medium">{credits} 积分</span>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout} className="glass-button">
                <LogOut className="h-4 w-4 mr-2" />
                退出
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3 text-xl">
                <div className="p-2 glass-bg rounded-xl">
                  <Upload className="h-6 w-6 text-pink-500" />
                </div>
                <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                  上传图片
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="image" className="text-gray-700 font-medium">选择图片</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="mt-2 glass-input"
                />
              </div>

              {previewImage && (
                <div className="space-y-3">
                  <Label className="text-gray-700 font-medium">预览</Label>
                  <div className="relative group">
                    <div className="relative overflow-hidden rounded-2xl border border-white/30 shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <img
                        src={previewImage}
                        alt="预览"
                        className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="glass-bg px-2 py-1 rounded-lg text-xs text-white">
                          📷 原始图片
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="style" className="text-gray-700 font-medium">选择风格</Label>
                <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                  <SelectTrigger className="mt-2 glass-input">
                    <SelectValue placeholder="请选择艺术风格" />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/20">
                    {ART_STYLES.map((style) => (
                      <SelectItem key={style.value} value={style.value} className="hover:bg-white/20">
                        {style.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={!selectedFile || !selectedStyle || isGenerating}
                className="w-full btn-primary btn-lg group"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Wand2 className="h-5 w-5 mr-2 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2 group-hover:animate-pulse" />
                    生成图片 (消耗 1 积分)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Result Section */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3 text-xl">
                <div className="p-2 glass-bg rounded-xl">
                  <Wand2 className="h-6 w-6 text-purple-500" />
                </div>
                <span className="bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-text text-transparent">
                  生成结果
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {generatedImage ? (
                <div className="space-y-4">
                  <div className="relative group">
                    <div className="relative overflow-hidden rounded-2xl border border-white/30 shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <img
                        src={generatedImage}
                        alt="生成的图片"
                        className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="glass-bg px-2 py-1 rounded-lg text-xs text-white">
                          ✨ AI 生成
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => {
                        const link = document.createElement('a')
                        link.href = generatedImage
                        link.download = 'generated-image.jpg'
                        link.click()
                      }}
                      className="flex-1 btn-primary"
                    >
                      下载图片
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setGeneratedImage(null)}
                      className="glass-button"
                    >
                      重新生成
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 border-2 border-dashed border-white/30 rounded-2xl glass-bg">
                  <div className="text-center text-gray-500">
                    <div className="p-4 glass-bg rounded-2xl mb-4 inline-block">
                      <Wand2 className="h-12 w-12 mx-auto text-pink-400" />
                    </div>
                    <p className="text-lg font-medium">生成的图片将显示在这里</p>
                    <p className="text-sm mt-2 opacity-75">上传图片并选择风格开始生成</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
