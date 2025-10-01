import { NextResponse } from 'next/server'
import { IMAGE_STYLES } from '@/lib/image-gen'

export async function GET() {
  try {
    return NextResponse.json({
      styles: IMAGE_STYLES
    })
  } catch (error) {
    console.error('Get styles error:', error)
    return NextResponse.json(
      { error: '获取风格列表失败' },
      { status: 500 }
    )
  }
}
