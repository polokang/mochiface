import { NextRequest, NextResponse } from 'next/server'
import { updateLastLogin } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: '用户ID是必填项' },
        { status: 400 }
      )
    }

    // 更新最后登录时间
    await updateLastLogin(userId)

    return NextResponse.json({
      message: '登录时间更新成功'
    })

  } catch (error) {
    console.error('Update login error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
