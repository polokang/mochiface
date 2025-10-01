import { NextRequest, NextResponse } from 'next/server'
import { isUsernameAvailable } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json()

    if (!username) {
      return NextResponse.json(
        { error: '用户名是必填项' },
        { status: 400 }
      )
    }

    // 检查用户名是否可用
    const available = await isUsernameAvailable(username)

    return NextResponse.json({
      available,
      username
    })

  } catch (error) {
    console.error('Username check error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
