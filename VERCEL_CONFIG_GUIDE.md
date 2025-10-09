# Vercel 配置指南

## 🔧 vercel.json 配置说明

### 问题解决
修复了 `vercel.json` 中的配置冲突：
- ❌ 不能同时使用 `builds` 和 `functions` 属性
- ✅ 对于 Next.js 项目，Vercel 会自动检测构建器

### 当前配置

```json
{
  "functions": {
    "app/api/image/generate/route.ts": {
      "maxDuration": 60
    },
    "app/api/upload-image/route.ts": {
      "maxDuration": 30
    }
  },
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

## 📋 配置说明

### 1. **函数超时设置**
- `app/api/image/generate/route.ts`: 60秒（图片生成需要更长时间）
- `app/api/upload-image/route.ts`: 30秒（图片上传相对较快）

### 2. **缓存头设置**
- 静态图片资源缓存1年
- 提高图片加载性能

### 3. **自动构建检测**
- Vercel 会自动检测 Next.js 项目
- 无需手动配置 `builds` 属性

## 🚀 部署注意事项

### 1. **函数超时限制**
- **Hobby 计划**: 10秒最大执行时间
- **Pro 计划**: 60秒最大执行时间
- **Enterprise 计划**: 无限制

### 2. **内存限制**
- **Hobby 计划**: 1024MB
- **Pro 计划**: 3008MB
- **Enterprise 计划**: 可配置

### 3. **并发限制**
- **Hobby 计划**: 100个并发函数
- **Pro 计划**: 1000个并发函数
- **Enterprise 计划**: 可配置

## 🔍 常见问题

### 1. **配置冲突**
```json
// ❌ 错误：不能同时使用
{
  "builds": [...],
  "functions": {...}
}

// ✅ 正确：只使用 functions
{
  "functions": {...}
}
```

### 2. **超时设置无效**
- 确保函数路径正确
- 检查 Vercel 计划限制
- 验证配置语法

### 3. **缓存不生效**
- 检查 `source` 路径匹配
- 确认 `headers` 配置正确
- 清除浏览器缓存

## 📊 性能优化建议

### 1. **函数优化**
- 减少冷启动时间
- 优化内存使用
- 使用连接池

### 2. **缓存策略**
- 静态资源长期缓存
- API 响应适当缓存
- CDN 加速

### 3. **监控指标**
- 函数执行时间
- 内存使用情况
- 错误率统计

## 🎯 验证方法

### 1. **本地测试**
```bash
# 检查配置语法
vercel --dry-run
```

### 2. **预览部署**
```bash
# 部署到预览环境
vercel --target preview
```

### 3. **生产部署**
```bash
# 部署到生产环境
vercel --prod
```

### 4. **检查函数配置**
- 在 Vercel Dashboard 中查看函数设置
- 确认超时时间已应用
- 监控函数执行情况

通过正确的 Vercel 配置，您的应用将获得最佳的性能和可靠性！🎉
