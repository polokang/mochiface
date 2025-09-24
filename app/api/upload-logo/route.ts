import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { verifyToken, getTokenFromRequest } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: '无效的 token' },
        { status: 401 }
      )
    }

    // 解析表单数据
    const formData = await request.formData()
    const logo = formData.get('logo') as File

    if (!logo) {
      return NextResponse.json(
        { error: '请选择要上传的 logo 文件' },
        { status: 400 }
      )
    }

    // 验证文件类型
    if (!logo.type.startsWith('image/')) {
      return NextResponse.json(
        { error: '请上传图片文件' },
        { status: 400 }
      )
    }

    // 验证文件大小 (最大 2MB)
    if (logo.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: '文件大小不能超过 2MB' },
        { status: 400 }
      )
    }

    // 保存 logo 文件
    const bytes = await logo.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const logoDir = join(process.cwd(), 'public')
    await mkdir(logoDir, { recursive: true })
    
    // 生成唯一的文件名
    const logoName = `logo_${Date.now()}.${logo.name.split('.').pop()}`
    const logoPath = join(logoDir, logoName)
    await writeFile(logoPath, buffer)

    return NextResponse.json({
      message: 'Logo 上传成功',
      logoUrl: `/${logoName}`,
    })

  } catch (error) {
    console.error('上传 logo 错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
