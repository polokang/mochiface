import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  let next = searchParams.get('next') ?? '/dashboard'
  if (!next.startsWith('/')) {
    // if "next" is not a relative URL, use the default
    next = '/dashboard'
  }

  if (code) {
    const supabase = createServerClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    
    if (!error && data.user && data.session) {
      // 检查用户是否已确认邮箱
      if (data.user.email_confirmed_at) {
        // 处理 Google 登录后的用户信息
        try {
          await fetch(`${origin}/api/auth/google`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user: data.user }),
          })
        } catch (apiError) {
          console.error('Error processing Google login:', apiError)
          // 不阻止登录，只是记录错误
        }
      } else {
        // 邮箱未确认，重定向到邮箱确认页面
        return NextResponse.redirect(`${origin}/login?message=请先确认您的邮箱地址`)
      }

      // 获取正确的站点URL
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
      const forwardedHost = request.headers.get('x-forwarded-host')
      const forwardedProto = request.headers.get('x-forwarded-proto')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      console.log('🔍 回调URL调试信息:', {
        origin,
        siteUrl,
        forwardedHost,
        forwardedProto,
        isLocalEnv,
        nodeEnv: process.env.NODE_ENV
      })
      
      // 创建重定向响应
      let redirectUrl
      if (isLocalEnv) {
        // 本地开发环境
        redirectUrl = `${origin}${next}`
      } else if (siteUrl && siteUrl !== 'http://localhost:3000') {
        // 使用环境变量中的生产域名
        redirectUrl = `${siteUrl}${next}`
      } else if (forwardedHost) {
        // 使用Vercel的转发头
        const protocol = forwardedProto || 'https'
        redirectUrl = `${protocol}://${forwardedHost}${next}`
      } else {
        // 回退到origin
        redirectUrl = `${origin}${next}`
      }
      
      console.log('🎯 最终重定向URL:', redirectUrl)
      
      
      // 创建重定向响应，确保会话 Cookie 被正确设置
      const response = NextResponse.redirect(redirectUrl)
      
      // 手动设置会话 Cookie（如果 Supabase 没有自动设置）
      if (data.session.access_token) {
        response.cookies.set('sb-access-token', data.session.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7 // 7 days
        })
      }
      
      if (data.session.refresh_token) {
        response.cookies.set('sb-refresh-token', data.session.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30 // 30 days
        })
      }
      
      return response
    } else {
      console.error('OAuth callback error:', error)
    }
  }

  // return the user to an error page with instructions
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || origin
  const errorRedirectUrl = siteUrl && siteUrl !== 'http://localhost:3000' 
    ? `${siteUrl}/login?error=auth_callback_error`
    : `${origin}/login?error=auth_callback_error`
  return NextResponse.redirect(errorRedirectUrl)
}
