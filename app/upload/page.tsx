'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Navbar } from '@/components/navbar'
import { Upload, Image as ImageIcon, Sparkles, AlertCircle } from 'lucide-react'
import { isValidImageType, isValidImageSize, formatFileSizeMB, smartCompressImage } from '@/lib/utils'
import { getThumbnailUrl } from '@/lib/image-gen'

interface ImageStyle {
  id: string
  name: string
  description: string
  prompt: string
  thumbnail: string
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
  const [compressing, setCompressing] = useState(false)
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

  // Load styles list
  useEffect(() => {
    fetchStyles()
  }, [])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!isValidImageType(file)) {
      setError('Only JPG, PNG, WebP format images are supported')
      return
    }

    // Validate file size
    if (!isValidImageSize(file, 10)) {
      setError('Image size cannot exceed 10MB')
      return
    }

    setError('')
    setCompressing(true)
    
    try {
      // Smart compress image
      const compressedFile = await smartCompressImage(file)
      
      setSelectedFile(compressedFile)
      
      // Create preview
      const url = URL.createObjectURL(compressedFile)
      setPreviewUrl(url)
      
      // Show file size comparison before and after compression
      const originalSizeMB = formatFileSizeMB(file.size)
      const compressedSizeMB = formatFileSizeMB(compressedFile.size)
      const compressionRatio = ((file.size - compressedFile.size) / file.size * 100).toFixed(1)
      
      setSuccess(`Image selected and compressed (Original: ${originalSizeMB} → Compressed: ${compressedSizeMB}, reduced ${compressionRatio}%)`)
    } catch (error) {
      console.error('Image compression failed:', error)
      setError('Image compression failed, please try again')
    } finally {
      setCompressing(false)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !selectedStyle) {
      setError('Please select an image and style')
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
        setSuccess('Image uploaded successfully! Generating...')
        // Automatically start generation
        handleGenerate(data.url)
      } else {
        setError(data.error || 'Upload failed')
      }
    } catch (error) {
      setError('Upload failed, please try again')
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
        setSuccess('Generation task created, please check the results on My Works page')
        // Navigate to dashboard
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        setError(data.error || 'Generation failed')
      }
    } catch (error) {
      setError('Generation failed, please try again')
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
              Generate Stylized Avatar
            </h1>
            <p className="text-gray-600">
              Upload your avatar, choose your favorite style, and AI will generate unique stylized avatars for you
            </p>
          </div>

          <div className="space-y-6">
            {/* Upload Area */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="mr-2 h-5 w-5" />
                  Upload Avatar
                </CardTitle>
                <CardDescription>
                  Choose a clear portrait photo, supports JPG, PNG, WebP formats, maximum 10MB (will be automatically compressed)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {compressing ? (
                      <div className="space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-sm text-gray-600">Compressing image...</p>
                      </div>
                    ) : previewUrl ? (
                      <div className="space-y-4">
                        <img
                          src={previewUrl}
                          alt="Preview"
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
                          <p className="text-lg font-medium">Click to upload image</p>
                          <p className="text-sm text-gray-500">
                            or drag and drop image here
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

            {/* Style Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Choose Style
                </CardTitle>
                <CardDescription>
                  Choose your favorite artistic style
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Please select a style" />
                  </SelectTrigger>
                  <SelectContent>
                    {styles.map((style) => (
                      <SelectItem key={style.id} value={style.id}>
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 relative">
                            <img
                              src={getThumbnailUrl(style.thumbnail)}
                              alt={style.name}
                              width={48}
                              height={48}
                              className="object-cover rounded-lg border"
                              onError={(e) => {
                                // If thumbnail fails to load, show default icon
                                e.currentTarget.style.display = 'none'
                                e.currentTarget.nextElementSibling?.classList.remove('hidden')
                              }}
                            />
                            <div className="hidden w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center absolute inset-0">
                              <ImageIcon className="w-6 h-6 text-gray-400" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{style.name}</div>
                            <div className="text-sm text-gray-500">
                              {style.description}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Error and Success Messages */}
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

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || !selectedStyle || uploading || generating || compressing}
                className="flex-1"
              >
                {compressing ? 'Compressing...' : uploading ? 'Uploading...' : generating ? 'Generating...' : 'Start Generating'}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard')}
              >
                View My Works
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
