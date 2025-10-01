'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/navbar'
import { ImageUpload } from '@/components/image-upload'
import { ImageIcon, Download, RefreshCw, AlertCircle, CheckCircle, Clock, Upload, X, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface GeneratedImage {
  id: string
  source_image_url: string
  style: string
  status: 'queued' | 'running' | 'success' | 'failed'
  result_image_url: string | null
  credits_spent: number
  error_message: string | null
  created_at: string
}

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [images, setImages] = useState<GeneratedImage[]>([])
  const [credits, setCredits] = useState<number | null>(null)
  const [loadingImages, setLoadingImages] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [imageToDelete, setImageToDelete] = useState<GeneratedImage | null>(null)
  const [deleting, setDeleting] = useState(false)


  useEffect(() => {
    if (user) {
      fetchImages()
      fetchCredits()
    }
  }, [user])

  const fetchImages = async () => {
    try {
      const response = await fetch('/api/generated-images')
      if (response.ok) {
        const data = await response.json()
        setImages(data.images || [])
      }
    } catch (error) {
      console.error('Failed to fetch images:', error)
    } finally {
      setLoadingImages(false)
    }
  }

  const fetchCredits = async () => {
    try {
      const response = await fetch('/api/credits/me')
      if (response.ok) {
        const data = await response.json()
        setCredits(data.points)
      }
    } catch (error) {
      console.error('Failed to fetch credits:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'running':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'queued':
        return 'Queued'
      case 'running':
        return 'Generating'
      case 'success':
        return 'Success'
      case 'failed':
        return 'Failed'
      default:
        return status
    }
  }

  const handleDownload = (imageUrl: string, filename: string) => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleUploadSuccess = (imageUrl: string) => {
    setUploadSuccess('Image uploaded successfully!')
    setUploadError('')
    setShowUploadModal(false)
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setUploadSuccess('')
    }, 3000)
  }

  const handleUploadError = (error: string) => {
    setUploadError(error)
    setUploadSuccess('')
  }

  const handleDeleteClick = (image: GeneratedImage) => {
    setImageToDelete(image)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!imageToDelete) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/generated-images/${imageToDelete.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Remove deleted image from local state
        setImages(prevImages => 
          prevImages.filter(img => img.id !== imageToDelete.id)
        )
        setShowDeleteModal(false)
        setImageToDelete(null)
      } else {
        const errorData = await response.json()
        console.error('Delete failed:', errorData.error)
        alert('Delete failed: ' + errorData.error)
      }
    } catch (error) {
      console.error('Delete failed:', error)
      alert('Delete failed, please try again')
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
    setImageToDelete(null)
  }

  // Use useEffect to handle redirects, avoid calling setState during rendering
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, user, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="h-64 bg-muted animate-pulse rounded-lg" />
          </div>
        </main>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="h-64 bg-muted animate-pulse rounded-lg" />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                My Works
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                View and manage your stylized avatar generation history
              </p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <Link href="/upload">
                <Button className="w-full sm:w-auto">
                  <ImageIcon className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Generate New Avatar</span>
                  <span className="sm:hidden">Generate</span>
                </Button>
              </Link>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowUploadModal(true)}
                  className="flex-1 sm:flex-none"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Upload Image</span>
                  <span className="sm:hidden">Upload</span>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={fetchImages}
                  className="flex-1 sm:flex-none"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Refresh</span>
                  <span className="sm:hidden">Refresh</span>
                </Button>
              </div>
            </div>
          </div>

          {/* 积分显示 */}
          {credits !== null && (
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div>
                    <h3 className="text-lg font-semibold">Current Credits</h3>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-600">{credits}</p>
                  </div>
                  <Link href="/rewards">
                    <Button variant="outline" className="w-full sm:w-auto">
                      Get More Credits
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 作品列表 */}
          {loadingImages ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <div className="h-48 bg-muted animate-pulse rounded-t-lg" />
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted animate-pulse rounded mb-2" />
                    <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : images.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No avatars generated yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Start your first avatar stylization journey!
                </p>
                <Link href="/upload">
                  <Button>
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Generate Now
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {images.map((image) => (
                <Card key={image.id}>
                  <div className="aspect-square relative">
                    {image.status === 'success' && image.result_image_url ? (
                      <img
                        src={image.result_image_url}
                        alt="Generated result"
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center rounded-t-lg">
                        <ImageIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      {getStatusIcon(image.status)}
                    </div>
                  </div>
                  <CardContent className="p-3 sm:p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {getStatusText(image.status)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {image.credits_spent} credits
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Style: {image.style}
                      </p>
                      {image.error_message && (
                        <p className="text-xs text-red-500">
                          {image.error_message}
                        </p>
                      )}
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                        {image.status === 'success' && image.result_image_url && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(
                              image.result_image_url!,
                              `mochiface-${image.id}.jpg`
                            )}
                            className="w-full sm:w-auto"
                          >
                            <Download className="mr-1 h-3 w-3" />
                            Download
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteClick(image)}
                          className="w-full sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* 上传模态框 */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Upload Image</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowUploadModal(false)
                  setUploadError('')
                  setUploadSuccess('')
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <ImageUpload
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
            />
            
            {uploadError && (
              <div className="mt-4 text-red-500 text-sm text-center">
                {uploadError}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 删除确认对话框 */}
      {showDeleteModal && imageToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Confirm Delete
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete this work? This action cannot be undone, and the image and related information will be permanently deleted.
              </p>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <Button
                  variant="outline"
                  onClick={handleDeleteCancel}
                  disabled={deleting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  className="flex-1"
                >
                  {deleting ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Confirm Delete
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 成功消息 */}
      {uploadSuccess && (
        <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-auto bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50">
          {uploadSuccess}
        </div>
      )}
    </div>
  )
}
