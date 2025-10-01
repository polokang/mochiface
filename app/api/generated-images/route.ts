import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      )
    }

    const supabase = createServiceClient()
    
    const { data: images, error } = await supabase
      .from('generated_images')
      .select('*')
      .eq('user_id', user.user_id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: '获取生成记录失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      images: images || []
    })

  } catch (error) {
    console.error('Get generated images error:', error)
    return NextResponse.json(
      { error: '获取生成记录失败' },
      { status: 500 }
    )
  }
}
