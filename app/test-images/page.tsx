'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getThumbnailUrl } from '@/lib/image-gen'
import { IMAGE_STYLES } from '@/lib/image-gen'

export default function TestImagesPage() {
  const [testResults, setTestResults] = useState<Record<string, boolean>>({})

  const testImage = (styleId: string, thumbnailPath: string) => {
    return new Promise<boolean>((resolve) => {
      const img = new Image()
      img.onload = () => {
        setTestResults(prev => ({ ...prev, [styleId]: true }))
        resolve(true)
      }
      img.onerror = () => {
        setTestResults(prev => ({ ...prev, [styleId]: false }))
        resolve(false)
      }
      img.src = getThumbnailUrl(thumbnailPath)
    })
  }

  const testAllImages = async () => {
    const results: Record<string, boolean> = {}
    
    for (const style of IMAGE_STYLES) {
      const result = await testImage(style.id, style.thumbnail)
      results[style.id] = result
    }
    
    setTestResults(results)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">🖼️ 图片加载测试</h1>
        
        <div className="mb-6 text-center">
          <Button onClick={testAllImages} className="mb-4">
            🚀 测试所有图片
          </Button>
          <p className="text-sm text-gray-600">
            点击按钮测试所有样式缩略图是否能正常加载
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {IMAGE_STYLES.map((style) => (
            <Card key={style.id} className="overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg">{style.name}</CardTitle>
                <p className="text-sm text-gray-600">{style.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* 使用 next/image 组件 */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Next.js Image 组件:</h4>
                    <div className="w-24 h-24 relative border rounded-lg overflow-hidden">
                      <img
                        src={getThumbnailUrl(style.thumbnail)}
                        alt={style.name}
                        className="w-full h-full object-cover"
                        onLoad={() => {
                          setTestResults(prev => ({ ...prev, [`${style.id}_img`]: true }))
                        }}
                        onError={() => {
                          setTestResults(prev => ({ ...prev, [`${style.id}_img`]: false }))
                        }}
                      />
                    </div>
                  </div>

                  {/* 显示测试结果 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>图片路径:</span>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {getThumbnailUrl(style.thumbnail)}
                      </code>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span>加载状态:</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        testResults[`${style.id}_img`] === true 
                          ? 'bg-green-100 text-green-800' 
                          : testResults[`${style.id}_img`] === false
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {testResults[`${style.id}_img`] === true 
                          ? '✅ 成功' 
                          : testResults[`${style.id}_img`] === false
                          ? '❌ 失败'
                          : '⏳ 待测试'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 总结 */}
        <div className="mt-8 p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">📊 测试总结</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Object.values(testResults).filter(Boolean).length}
              </div>
              <div>成功加载</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {Object.values(testResults).filter(v => v === false).length}
              </div>
              <div>加载失败</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {IMAGE_STYLES.length * 2 - Object.keys(testResults).length}
              </div>
              <div>未测试</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {IMAGE_STYLES.length}
              </div>
              <div>总图片数</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
