'use client'

import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              隐私权政策
            </h1>
            <p className="text-gray-600">
              最后更新日期：2024年12月
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>1. 信息收集</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                我们收集您主动提供的信息，包括但不限于：
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>注册时提供的用户名、邮箱地址</li>
                <li>上传的图片文件</li>
                <li>使用服务时产生的生成记录</li>
                <li>与我们的客服团队沟通时提供的信息</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. 信息使用</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>我们使用收集的信息用于：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>提供和改进我们的AI图片生成服务</li>
                <li>处理您的账户和交易</li>
                <li>与您沟通服务相关事宜</li>
                <li>分析使用情况以优化用户体验</li>
                <li>遵守法律法规要求</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. 信息存储和安全</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                我们采用行业标准的安全措施保护您的信息：
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>使用HTTPS加密传输数据</li>
                <li>定期备份和更新安全系统</li>
                <li>限制员工访问权限</li>
                <li>使用可靠的云服务提供商（Supabase）</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. 信息共享</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>我们不会出售、交易或转让您的个人信息给第三方，除非：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>获得您的明确同意</li>
                <li>法律要求或法院命令</li>
                <li>保护我们的权利、财产或安全</li>
                <li>与可信赖的服务提供商合作（如云存储服务）</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. 第三方服务</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>我们的服务集成了以下第三方服务：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Supabase</strong>：用于用户认证和数据存储</li>
                <li><strong>Google OAuth</strong>：用于第三方登录</li>
                <li><strong>Google Gemini API</strong>：用于AI图片生成</li>
                <li><strong>Vercel</strong>：用于网站托管</li>
              </ul>
              <p className="text-sm text-gray-600">
                这些第三方服务有自己的隐私政策，我们建议您查看其相关条款。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. 您的权利</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>您有权：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>访问和查看我们持有的关于您的信息</li>
                <li>要求更正不准确的信息</li>
                <li>要求删除您的个人信息</li>
                <li>限制或反对某些信息处理活动</li>
                <li>数据可携带性（在技术上可行的情况下）</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Cookie 和跟踪技术</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                我们使用 Cookie 和类似技术来：
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>记住您的登录状态</li>
                <li>保存您的偏好设置</li>
                <li>分析网站使用情况</li>
                <li>提供个性化体验</li>
              </ul>
              <p className="text-sm text-gray-600">
                您可以通过浏览器设置管理 Cookie 偏好。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. 儿童隐私</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                我们的服务不面向13岁以下的儿童。我们不会故意收集13岁以下儿童的个人信息。
                如果我们发现收集了此类信息，将立即删除。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. 政策更新</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                我们可能会不时更新本隐私政策。重大变更将通过网站通知或邮件告知您。
                继续使用我们的服务即表示您接受更新后的政策。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. 联系我们</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                如果您对本隐私政策有任何疑问或需要行使您的权利，请通过以下方式联系我们：
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p><strong>邮箱</strong>：privacy@mochiface.com</p>
                <p><strong>网站</strong>：www.mochiface.com</p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>本隐私政策自2024年12月起生效</p>
          </div>
        </div>
      </main>
    </div>
  )
}
