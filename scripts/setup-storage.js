const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// 读取 .env.local 文件
const envPath = path.join(__dirname, '..', '.env.local')
let envContent = ''

if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8')
}

// 解析环境变量
const envVars = {}
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=')
  if (key && value) {
    envVars[key.trim()] = value.trim()
  }
})

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少 Supabase 环境变量')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupStorage() {
  try {
    console.log('🔧 设置 Supabase Storage...')

    // 检查存储桶是否存在
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('❌ 获取存储桶列表失败:', listError)
      console.log('请检查 Supabase 服务密钥是否正确')
      return
    }

    console.log('📋 现有存储桶:', buckets.map(b => b.name))

    const mochifaceBucket = buckets.find(bucket => bucket.name === 'mochiface-bucket')
    
    if (mochifaceBucket) {
      console.log('✅ mochiface-bucket 存储桶已存在')
      console.log('   公开访问:', mochifaceBucket.public)
      console.log('   创建时间:', mochifaceBucket.created_at)
    } else {
      console.log('🔧 创建 mochiface-bucket 存储桶...')
      
      // 创建存储桶
      const { data, error } = await supabase.storage.createBucket('mochiface-bucket', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      })

      if (error) {
        console.error('❌ 创建存储桶失败:', error)
        console.log('错误详情:', error.message)
        return
      }

      console.log('✅ mochiface-bucket 存储桶创建成功')
    }

    // 测试上传功能
    console.log('🧪 测试存储桶功能...')
    const testContent = 'test'
    const testPath = 'test/test.txt'
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('mochiface-bucket')
      .upload(testPath, testContent)

    if (uploadError) {
      console.error('❌ 测试上传失败:', uploadError)
    } else {
      console.log('✅ 测试上传成功')
      
      // 清理测试文件
      await supabase.storage
        .from('mochiface-bucket')
        .remove([testPath])
      console.log('🧹 测试文件已清理')
    }

    console.log('✅ 存储桶设置完成')
    
  } catch (error) {
    console.error('❌ 设置存储桶时出错:', error)
  }
}

setupStorage()
