import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ImageIcon, Sparkles, Download, Gift } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            让头像变得
            <span className="text-blue-600"> 更有趣</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            上传你的头像，选择喜欢的风格，AI 为你生成独特的风格化头像。
            支持多种艺术风格，让你的头像在人群中脱颖而出。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/upload">
              <Button size="lg" className="text-lg px-8 py-6">
                <Sparkles className="mr-2 h-5 w-5" />
                开始生成
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                免费注册
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            为什么选择 MochiFace？
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <ImageIcon className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>多种风格</CardTitle>
                <CardDescription>
                  提供卡通、动漫、水彩、复古等多种艺术风格，满足不同喜好
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Download className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>高质量输出</CardTitle>
                <CardDescription>
                  使用先进的 AI 技术，生成高分辨率、高质量的风格化头像
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Gift className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>积分系统</CardTitle>
                <CardDescription>
                  新用户赠送 3 积分，完成任务可获得更多积分，经济实惠
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* How it works */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            如何使用？
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">上传头像</h3>
              <p className="text-gray-600">
                选择一张清晰的人像照片，支持 JPG、PNG、WebP 格式
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">选择风格</h3>
              <p className="text-gray-600">
                从多种艺术风格中选择你喜欢的，预览效果
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">生成下载</h3>
              <p className="text-gray-600">
                AI 自动生成风格化头像，完成后可下载高清图片
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-white rounded-2xl p-12 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            准备好开始了吗？
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            立即注册，获得 3 个免费积分，开始你的头像风格化之旅！
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8 py-6">
                免费注册
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                已有账号？登录
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4">MochiFace</h3>
          <p className="text-gray-400 mb-4">
            让头像变得更有趣 - AI 驱动的头像风格化生成器
          </p>
          <p className="text-sm text-gray-500">
            © 2024 MochiFace. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}