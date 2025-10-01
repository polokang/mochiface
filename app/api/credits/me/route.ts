import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getMyCredits } from '@/lib/credits'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      )
    }

    const credits = await getMyCredits(user.user_id)

    return NextResponse.json({
      points: credits
    })

  } catch (error) {
    console.error('Get credits error:', error)
    return NextResponse.json(
      { error: '获取积分失败' },
      { status: 500 }
    )
  }
}
