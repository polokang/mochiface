import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Starting upload request processing...')
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      console.log('❌ No file selected')
      return NextResponse.json(
        { error: 'No file selected' },
        { status: 400 }
      )
    }

    console.log('📁 File info:', {
      name: file.name,
      type: file.type,
      size: file.size
    })

    // Check file type
    if (!file.type.startsWith('image/')) {
      console.log('❌ Invalid file type:', file.type)
      return NextResponse.json(
        { error: 'Please select an image file' },
        { status: 400 }
      )
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      console.log('❌ File too large:', file.size)
      return NextResponse.json(
        { error: 'Image size cannot exceed 5MB' },
        { status: 400 }
      )
    }

    console.log('🔧 Creating Supabase client...')
    
    // Check environment variables
    console.log('🔍 Environment variables check:', {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Not set',
      serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Not set'
    })
    
    console.log('🔍 Environment variable values:', {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      serviceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.length : 0
    })
    
    const supabase = createServiceClient()
    
    // Test Supabase client
    console.log('🧪 Testing Supabase client...')
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
    
    if (bucketError) {
      console.error('❌ Cannot access storage buckets:', bucketError)
      return NextResponse.json(
        { error: `Supabase connection failed: ${bucketError.message}` },
        { status: 500 }
      )
    }
    
    console.log('✅ Supabase client working, bucket count:', buckets.length)

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `uploads/${fileName}`

    console.log('📤 Preparing to upload file:', filePath)

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('mochiface')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('❌ Storage upload error:', error)
      console.error('Error details:', {
        message: error.message,
        error: error
      })
      return NextResponse.json(
        { error: `Upload failed: ${error.message}` },
        { status: 500 }
      )
    }

    console.log('✅ Upload successful:', data.path)

    // Get public URL
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
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
