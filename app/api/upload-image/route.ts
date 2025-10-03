import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file selected' },
        { status: 400 }
      )
    }


    // Check file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Please select an image file' },
        { status: 400 }
      )
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image size cannot exceed 5MB' },
        { status: 400 }
      )
    }

    
    // Check environment variables
    
    const supabase = createServiceClient()
    
    // Test Supabase client
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
    
    if (bucketError) {
      console.error('❌ Cannot access storage buckets:', bucketError)
      return NextResponse.json(
        { error: `Supabase connection failed: ${bucketError.message}` },
        { status: 500 }
      )
    }
    

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `uploads/${fileName}`


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
