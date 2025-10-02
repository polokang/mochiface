import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getMyCredits } from '@/lib/credits'

// 强制动态渲染，因为使用了 cookies
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not logged in' },
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
      { error: 'Failed to get credits' },
      { status: 500 }
    )
  }
}
