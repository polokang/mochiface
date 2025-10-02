import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { addCredits, getMyCredits } from '@/lib/credits'
import { selfHostedRewardProvider } from '@/lib/rewards/self-hosted'

// 强制动态渲染，因为使用了 cookies
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not logged in' },
        { status: 401 }
      )
    }

    const { proof } = await request.json()

    if (!proof) {
      return NextResponse.json(
        { error: 'Verification proof is required' },
        { status: 400 }
      )
    }

    // Verify reward task proof
    const isValid = await selfHostedRewardProvider.verifyProof(proof, user.user_id)
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Verification proof is invalid or expired' },
        { status: 400 }
      )
    }

    // Grant credits
    await addCredits(user.user_id, 1, 'reward_task')

    // Get updated credits
    const updatedCredits = await getMyCredits(user.user_id)

    return NextResponse.json({
      message: 'Credits granted successfully',
      points: updatedCredits
    })

  } catch (error) {
    console.error('Grant credits error:', error)
    return NextResponse.json(
      { error: 'Failed to grant credits' },
      { status: 500 }
    )
  }
}
