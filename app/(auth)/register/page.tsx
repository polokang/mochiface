'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/navbar'
import { createClientComponent } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth-provider'
import { CheckCircle, Mail } from 'lucide-react'

export default function RegisterPage() {
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')
  const router = useRouter()
  const supabase = createClientComponent()
  const { user, loading: authLoading } = useAuth()

  // 检查用户是否已登录，如果是则跳转到 dashboard
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard')
    }
  }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password, 
          fullName: fullName || null 
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || '注册失败')
        return
      }

      if (data.needsConfirmation) {
        setRegisteredEmail(email)
        setSuccess(true)
      } else {
        setError('注册失败，请重试')
      }
    } catch (error) {
      setError('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        setError(error.message)
        setLoading(false)
      }
    } catch (error) {
      setError('Google 登录失败，请重试')
      setLoading(false)
    }
  }

  // 如果注册成功，显示邮箱确认页面
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar />
        
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl text-green-600">注册成功！</CardTitle>
                <CardDescription>
                  请检查您的邮箱并点击确认链接完成注册
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-2 text-gray-600">
                  <Mail className="w-5 h-5" />
                  <span>确认邮件已发送至：{registeredEmail}</span>
                </div>
                <p className="text-sm text-gray-500">
                  如果没有收到邮件，请检查垃圾邮件文件夹
                </p>
                <div className="space-y-2">
                  <Button 
                    onClick={() => router.push('/login')} 
                    className="w-full"
                  >
                    返回登录
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSuccess(false)
                      setRegisteredEmail('')
                      setEmail('')
                      setPassword('')
                      setFullName('')
                    }}
                    className="w-full"
                  >
                    重新注册
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  // 如果正在检查用户状态，显示加载界面
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">检查登录状态...</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">注册</CardTitle>
              <CardDescription>
                创建你的 MochiFace 账户，获得 3 个免费积分
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">邮箱地址</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="请输入邮箱地址"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">姓名（可选）</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="请输入您的姓名"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">密码</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入密码（至少6位）"
                    required
                    minLength={6}
                  />
                </div>
                {error && (
                  <div className="text-red-500 text-sm text-center">
                    {error}
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? '注册中...' : '注册'}
                </Button>
              </form>
              
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      或者
                    </span>
                  </div>
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mt-4"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  {loading ? '登录中...' : '使用 Google 登录'}
                </Button>
              </div>
              
              <div className="mt-4 text-center text-sm">
                已有账户？{' '}
                <Link href="/login" className="text-blue-600 hover:underline">
                  立即登录
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
