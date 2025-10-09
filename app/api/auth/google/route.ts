import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { updateLastLogin } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { user } = await request.json()

    if (!user) {
      return NextResponse.json(
        { error: '用户信息缺失' },
        { status: 400 }
      )
    }

    // 使用服务角色客户端来绕过 RLS 限制
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 检查用户是否已存在
    const { data: existingUser, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user:', fetchError)
      return NextResponse.json(
        { error: '获取用户信息失败' },
        { status: 500 }
      )
    }

    // 如果用户不存在，创建新用户档案
    if (!existingUser) {
      // 从 Google 用户信息中提取用户名
      const username = user.user_metadata?.full_name?.replace(/\s+/g, '').toLowerCase() || 
                      user.email?.split('@')[0] || 
                      `user_${user.id.slice(0, 8)}`

      // 确保用户名唯一
      let finalUsername = username
      let counter = 1
      while (true) {
        const { data: existingUsername } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', finalUsername)
          .single()

        if (!existingUsername) {
          break
        }
        finalUsername = `${username}_${counter}`
        counter++
      }

      // 创建用户档案 - 直接插入
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          username: finalUsername,
          points: 3
        })

      if (insertError) {
        console.error('Error creating user profile:', insertError)
        return NextResponse.json(
          { error: '创建用户档案失败' },
          { status: 500 }
        )
      }

      // 创建积分流水记录
      const { error: creditError } = await supabase
        .from('credit_transactions')
        .insert({
          user_id: user.id,
          delta: 3,
          reason: 'signup_bonus'
        })

      if (creditError) {
        console.error('Error creating credit transaction:', creditError)
        // 不阻止用户创建，只是记录错误
      }
    } else {
      // 更新最后登录时间
      await updateLastLogin(user.id)
    }

    return NextResponse.json({
      message: 'Google 登录成功'
    })

  } catch (error) {
    console.error('Google login error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
