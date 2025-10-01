import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/client'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      )
    }

    const imageId = params.id

    if (!imageId) {
      return NextResponse.json(
        { error: '图片ID不能为空' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // 首先获取图片信息，确保用户有权限删除
    const { data: image, error: fetchError } = await supabase
      .from('generated_images')
      .select('*')
      .eq('id', imageId)
      .eq('user_id', user.user_id)
      .single()

    if (fetchError || !image) {
      return NextResponse.json(
        { error: '图片不存在或无权限删除' },
        { status: 404 }
      )
    }

    // 删除存储桶中的图片文件
    if (image.result_image_url) {
      try {
        // 从 URL 中提取文件路径
        const url = new URL(image.result_image_url)
        const pathParts = url.pathname.split('/')
        const bucketName = pathParts[3] // storage/v1/object/public/{bucket}/
        const filePath = pathParts.slice(4).join('/') // 剩余部分作为文件路径

        if (bucketName && filePath) {
          const { error: deleteFileError } = await supabase.storage
            .from(bucketName)
            .remove([filePath])

          if (deleteFileError) {
            console.warn('删除存储文件失败:', deleteFileError)
            // 不阻止数据库记录删除，只记录警告
          }
        }
      } catch (error) {
        console.warn('解析图片URL失败:', error)
        // 不阻止数据库记录删除
      }
    }

    // 删除数据库记录
    const { error: deleteError } = await supabase
      .from('generated_images')
      .delete()
      .eq('id', imageId)
      .eq('user_id', user.user_id)

    if (deleteError) {
      return NextResponse.json(
        { error: '删除失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: '删除成功'
    })

  } catch (error) {
    console.error('Delete image error:', error)
    return NextResponse.json(
      { error: '删除失败' },
      { status: 500 }
    )
  }
}
