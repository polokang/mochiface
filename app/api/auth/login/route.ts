import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { updateLastLogin } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: '邮箱和密码都是必填项' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // 登录用户
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    if (!data.user) {
      return NextResponse.json(
        { error: '登录失败' },
        { status: 401 }
      )
    }

    // 更新最后登录时间
    await updateLastLogin(data.user.id)

    // 从用户元数据中获取用户名
    const username = data.user.user_metadata?.username || email.split('@')[0]

    return NextResponse.json({
      message: '登录成功',
      user: {
        id: data.user.id,
        username: username,
        email: data.user.email
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}