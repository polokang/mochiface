import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/client'
import { isUsernameAvailable } from '@/lib/auth'

// 强制动态渲染，因为使用了 cookies
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // 从邮箱生成用户名
    const username = email.split('@')[0]
    
    // 检查用户名是否可用
    const usernameAvailable = await isUsernameAvailable(username)
    if (!usernameAvailable) {
      return NextResponse.json(
        { error: 'Username for this email is already taken' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // 注册用户（启用邮箱确认）
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
        data: {
          username,
          full_name: fullName || null
        }
      }
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'Registration failed' },
        { status: 400 }
      )
    }

    // 使用服务角色客户端创建用户档案
    const serviceSupabase = createServiceClient()
    
    try {
      // 创建用户档案
      const { error: profileError } = await serviceSupabase
        .from('profiles')
        .insert({
          user_id: data.user.id,
          username: username,
          email: email,
          full_name: fullName || null,
          points: 3 // 新用户获得 3 个积分
        })

      if (profileError) {
        console.error('Error creating user profile:', profileError)
        // 不阻止注册，但记录错误
      }
    } catch (profileError) {
      console.error('Error creating user profile:', profileError)
      // 不阻止注册，但记录错误
    }

    return NextResponse.json({
      message: 'Registration successful! Please check your email and click the confirmation link to complete registration.',
      email: email,
      needsConfirmation: true
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}