'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Upload, Wand2, User, Coins, LogOut } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/lib/auth-context'

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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-primary-600">🍡 MochiFace</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{user.username}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-primary-600">
                <Coins className="h-4 w-4" />
                <span>{credits} 积分</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>上传图片</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="image">选择图片</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="mt-2"
                />
              </div>

              {previewImage && (
                <div className="space-y-2">
                  <Label>预览</Label>
                  <div className="relative">
                    <img
                      src={previewImage}
                      alt="预览"
                      className="w-full h-64 object-cover rounded-lg border"
                    />
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="style">选择风格</Label>
                <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="请选择艺术风格" />
                  </SelectTrigger>
                  <SelectContent>
                    {ART_STYLES.map((style) => (
                      <SelectItem key={style.value} value={style.value}>
                        {style.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={!selectedFile || !selectedStyle || isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    生成图片 (消耗 1 积分)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Result Section */}
          <Card>
            <CardHeader>
              <CardTitle>生成结果</CardTitle>
            </CardHeader>
            <CardContent>
              {generatedImage ? (
                <div className="space-y-4">
                  <img
                    src={generatedImage}
                    alt="生成的图片"
                    className="w-full h-64 object-cover rounded-lg border"
                  />
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => {
                        const link = document.createElement('a')
                        link.href = generatedImage
                        link.download = 'generated-image.jpg'
                        link.click()
                      }}
                      className="flex-1"
                    >
                      下载图片
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setGeneratedImage(null)}
                    >
                      重新生成
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-center text-gray-500">
                    <Wand2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>生成的图片将显示在这里</p>
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
