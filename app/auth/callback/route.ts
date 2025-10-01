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

      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      // 创建重定向响应
      let redirectUrl
      if (isLocalEnv) {
        redirectUrl = `${origin}${next}`
      } else if (forwardedHost) {
        redirectUrl = `https://${forwardedHost}${next}`
      } else {
        redirectUrl = `${origin}${next}`
      }
      
      
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
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
