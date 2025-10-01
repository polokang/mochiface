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
      { error: 'Failed to get styles list' },
      { status: 500 }
    )
  }
}
