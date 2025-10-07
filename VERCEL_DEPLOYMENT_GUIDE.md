# Vercel 部署指南 - 静态资源问题解决

## 🚨 问题描述

在 Vercel 部署后，静态图片资源（如 `/images/passport.png`）无法正常显示，返回 404 错误。

## 🔧 解决方案

### 1. 使用 Next.js Image 组件

已更新 `app/upload/page.tsx` 使用 Next.js 的 `Image` 组件来显示缩略图：

```tsx
import Image from 'next/image'
import { getThumbnailUrl } from '@/lib/image-gen'

<Image
  src={getThumbnailUrl(style.thumbnail)}
  alt={style.name}
  width={48}
  height={48}
  className="object-cover rounded-lg border"
/>
```

### 2. 更新 Next.js 配置

已更新 `next.config.js` 添加静态资源配置：

```javascript
const nextConfig = {
  images: {
    remotePatterns: [
      // ... 现有配置
    ],
  },
  // 确保静态资源正确服务
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  trailingSlash: false,
}
```

### 3. 添加 Vercel 配置

已创建 `vercel.json` 配置文件：

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "headers": [
    {
      "source": "/images/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

**注意**: 移除了 `routes` 配置以避免与 `headers` 冲突。

### 4. 添加缩略图 URL 处理函数

已添加 `getThumbnailUrl` 函数来处理生产环境的路径问题：

```typescript
export function getThumbnailUrl(thumbnailPath: string): string {
  if (process.env.NODE_ENV === 'production' && thumbnailPath.startsWith('/images/')) {
    return thumbnailPath;
  }
  return thumbnailPath;
}
```

## 🚀 部署步骤

### 1. 提交更改

```bash
git add .
git commit -m "Fix static assets deployment for Vercel"
git push
```

### 2. 等待 Vercel 部署完成

检查 Vercel Dashboard 中的部署状态。

### 3. 验证静态资源

部署完成后，运行检查脚本：

```bash
npm run check-assets
```

或者手动检查图片 URL：
- `https://www.mochiface.com/images/passport.png`
- `https://www.mochiface.com/images/pro-headshot.png`
- `https://www.mochiface.com/images/idphoto-us-600.png`

## 🔍 故障排除

### 如果图片仍然无法显示：

1. **检查文件是否存在**
   ```bash
   ls -la public/images/
   ```

2. **检查 Vercel 构建日志**
   - 在 Vercel Dashboard 中查看构建日志
   - 确保没有错误信息

3. **检查网络请求**
   - 打开浏览器开发者工具
   - 查看 Network 标签页中的请求状态

4. **清除浏览器缓存**
   - 硬刷新页面 (Ctrl+F5 或 Cmd+Shift+R)

5. **检查 Vercel 函数日志**
   - 在 Vercel Dashboard 中查看函数日志
   - 查找任何错误信息

### 常见问题

1. **路径问题**
   - 确保图片路径以 `/images/` 开头（如 `/images/passport.png`）
   - 不要使用相对路径
   - 图片文件应放在 `public/images/` 目录下

2. **缓存问题**
   - Vercel 可能有 CDN 缓存
   - 等待几分钟后重试

3. **构建问题**
   - 确保 `public` 文件夹被正确包含在构建中
   - 检查 `.vercelignore` 文件

## 📋 检查清单

- [ ] 所有图片文件存在于 `public/images/` 目录
- [ ] `next.config.js` 配置正确
- [ ] `vercel.json` 文件已创建
- [ ] 使用 Next.js `Image` 组件
- [ ] 部署后手动验证图片 URL
- [ ] 运行 `npm run check-assets` 检查

## 🎯 预期结果

部署成功后，所有缩略图应该能够正常显示：
- ✅ 本地开发环境正常
- ✅ Vercel 生产环境正常
- ✅ 图片加载速度快
- ✅ 无 404 错误

---

**最后更新**: 2024年12月
**版本**: 1.0
