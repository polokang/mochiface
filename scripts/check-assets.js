#!/usr/bin/env node

/**
 * 检查静态资源是否正确部署
 * 在 Vercel 部署后运行此脚本来验证图片资源
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://www.mochiface.com';
const IMAGES_DIR = path.join(__dirname, '../public/images');

// 获取所有图片文件
const imageFiles = fs.readdirSync(IMAGES_DIR).filter(file => 
  file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.webp')
);

console.log(`🔍 Checking ${imageFiles.length} image assets...`);
console.log(`🌐 Base URL: ${BASE_URL}`);
console.log('');

let successCount = 0;
let failCount = 0;

async function checkImage(imageFile) {
  return new Promise((resolve) => {
    // 检查两种路径格式，优先检查 /images/ 路径
    const urls = [
      `${BASE_URL}/images/${imageFile}`,
      `${BASE_URL}/${imageFile}`
    ];
    
    let checked = 0;
    let found = false;
    
    urls.forEach(url => {
      const request = https.get(url, (response) => {
        checked++;
        if (response.statusCode === 200 && !found) {
          console.log(`✅ ${imageFile} - OK (${url})`);
          successCount++;
          found = true;
        } else if (checked === urls.length && !found) {
          console.log(`❌ ${imageFile} - Not found in any path`);
          failCount++;
        }
        
        if (checked === urls.length) {
          resolve();
        }
      });

      request.on('error', (error) => {
        checked++;
        if (checked === urls.length && !found) {
          console.log(`❌ ${imageFile} - Error: ${error.message}`);
          failCount++;
        }
        
        if (checked === urls.length) {
          resolve();
        }
      });

      request.setTimeout(5000, () => {
        checked++;
        if (checked === urls.length && !found) {
          console.log(`❌ ${imageFile} - Timeout`);
          failCount++;
        }
        
        if (checked === urls.length) {
          resolve();
        }
        request.destroy();
      });
    });
  });
}

async function checkAllImages() {
  for (const imageFile of imageFiles) {
    await checkImage(imageFile);
    // 添加小延迟避免请求过于频繁
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('');
  console.log('📊 Summary:');
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📈 Success Rate: ${((successCount / imageFiles.length) * 100).toFixed(1)}%`);

  if (failCount > 0) {
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('1. Check if images exist in public/images/ directory');
    console.log('2. Verify Vercel deployment includes public folder');
    console.log('3. Check Vercel build logs for any errors');
    console.log('4. Ensure next.config.js is properly configured');
    process.exit(1);
  } else {
    console.log('');
    console.log('🎉 All images are accessible!');
  }
}

checkAllImages().catch(console.error);
