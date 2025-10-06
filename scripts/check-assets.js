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
    const url = `${BASE_URL}/images/${imageFile}`;
    const request = https.get(url, (response) => {
      if (response.statusCode === 200) {
        console.log(`✅ ${imageFile} - OK`);
        successCount++;
      } else {
        console.log(`❌ ${imageFile} - ${response.statusCode} ${response.statusMessage}`);
        failCount++;
      }
      resolve();
    });

    request.on('error', (error) => {
      console.log(`❌ ${imageFile} - Error: ${error.message}`);
      failCount++;
      resolve();
    });

    request.setTimeout(5000, () => {
      console.log(`❌ ${imageFile} - Timeout`);
      failCount++;
      request.destroy();
      resolve();
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
