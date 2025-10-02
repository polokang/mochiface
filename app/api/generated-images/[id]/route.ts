import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/client'

// 强制动态渲染，因为使用了 cookies
export const dynamic = 'force-dynamic'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not logged in' },
        { status: 401 }
      )
    }

    const imageId = params.id

    if (!imageId) {
      return NextResponse.json(
        { error: 'Image ID cannot be empty' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // First get image info to ensure user has permission to delete
    const { data: image, error: fetchError } = await supabase
      .from('generated_images')
      .select('*')
      .eq('id', imageId)
      .eq('user_id', user.user_id)
      .single()

    if (fetchError || !image) {
      return NextResponse.json(
        { error: 'Image not found or no permission to delete' },
        { status: 404 }
      )
    }

    // Delete image file from storage bucket
    if (image.result_image_url) {
      try {
        // Extract file path from URL
        const url = new URL(image.result_image_url)
        const pathParts = url.pathname.split('/')
        const bucketName = pathParts[3] // storage/v1/object/public/{bucket}/
        const filePath = pathParts.slice(4).join('/') // Remaining parts as file path

        if (bucketName && filePath) {
          const { error: deleteFileError } = await supabase.storage
            .from(bucketName)
            .remove([filePath])

          if (deleteFileError) {
            console.warn('Failed to delete storage file:', deleteFileError)
            // Don't prevent database record deletion, just log warning
          }
        }
      } catch (error) {
        console.warn('Failed to parse image URL:', error)
        // Don't prevent database record deletion
      }
    }

    // Delete database record
    const { error: deleteError } = await supabase
      .from('generated_images')
      .delete()
      .eq('id', imageId)
      .eq('user_id', user.user_id)

    if (deleteError) {
      return NextResponse.json(
        { error: 'Delete failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Delete successful'
    })

  } catch (error) {
    console.error('Delete image error:', error)
    return NextResponse.json(
      { error: 'Delete failed' },
      { status: 500 }
    )
  }
}
