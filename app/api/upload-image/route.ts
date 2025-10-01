import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 开始处理上传请求...')
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      console.log('❌ 没有选择文件')
      return NextResponse.json(
        { error: '没有选择文件' },
        { status: 400 }
      )
    }

    console.log('📁 文件信息:', {
      name: file.name,
      type: file.type,
      size: file.size
    })

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      console.log('❌ 文件类型不正确:', file.type)
      return NextResponse.json(
        { error: '请选择图片文件' },
        { status: 400 }
      )
    }

    // 检查文件大小 (5MB 限制)
    if (file.size > 5 * 1024 * 1024) {
      console.log('❌ 文件过大:', file.size)
      return NextResponse.json(
        { error: '图片大小不能超过 5MB' },
        { status: 400 }
      )
    }

    console.log('🔧 创建 Supabase 客户端...')
    
    // 检查环境变量
    console.log('🔍 环境变量检查:', {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ 已设置' : '❌ 未设置',
      serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ 已设置' : '❌ 未设置'
    })
    
    console.log('🔍 环境变量值:', {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      serviceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.length : 0
    })
    
    const supabase = createServiceClient()
    
    // 测试 Supabase 客户端
    console.log('🧪 测试 Supabase 客户端...')
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
    
    if (bucketError) {
      console.error('❌ 无法访问存储桶:', bucketError)
      return NextResponse.json(
        { error: `Supabase 连接失败: ${bucketError.message}` },
        { status: 500 }
      )
    }
    
    console.log('✅ Supabase 客户端正常，存储桶数量:', buckets.length)

    // 生成唯一文件名
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `uploads/${fileName}`

    console.log('📤 准备上传文件:', filePath)

    // 上传到 Supabase Storage
    const { data, error } = await supabase.storage
      .from('mochiface')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('❌ Storage upload error:', error)
      console.error('错误详情:', {
        message: error.message,
        error: error
      })
      return NextResponse.json(
        { error: `上传失败: ${error.message}` },
        { status: 500 }
      )
    }

    console.log('✅ 上传成功:', data.path)

    // 获取公共 URL
    const { data: { publicUrl } } = supabase.storage
      .from('mochiface')
      .getPublicUrl(filePath)

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: data.path
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
