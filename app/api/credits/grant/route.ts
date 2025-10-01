import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { addCredits, getMyCredits } from '@/lib/credits'
import { selfHostedRewardProvider } from '@/lib/rewards/self-hosted'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      )
    }

    const { proof } = await request.json()

    if (!proof) {
      return NextResponse.json(
        { error: '验证证明是必填项' },
        { status: 400 }
      )
    }

    // 验证奖励任务证明
    const isValid = await selfHostedRewardProvider.verifyProof(proof, user.user_id)
    
    if (!isValid) {
      return NextResponse.json(
        { error: '验证证明无效或已过期' },
        { status: 400 }
      )
    }

    // 发放积分
    await addCredits(user.user_id, 1, 'reward_task')

    // 获取更新后的积分
    const updatedCredits = await getMyCredits(user.user_id)

    return NextResponse.json({
      message: '积分发放成功',
      points: updatedCredits
    })

  } catch (error) {
    console.error('Grant credits error:', error)
    return NextResponse.json(
      { error: '积分发放失败' },
      { status: 500 }
    )
  }
}
