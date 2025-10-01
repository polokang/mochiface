import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
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

    const { taskType } = await request.json()

    if (!taskType) {
      return NextResponse.json(
        { error: '任务类型是必填项' },
        { status: 400 }
      )
    }

    // 生成奖励任务证明
    const proof = await selfHostedRewardProvider.generateProof(user.user_id, taskType)

    return NextResponse.json({
      proof,
      message: '任务证明生成成功'
    })

  } catch (error) {
    console.error('Generate proof error:', error)
    return NextResponse.json(
      { error: '生成任务证明失败' },
      { status: 500 }
    )
  }
}
