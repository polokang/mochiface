# Vercel Google SSO 配置指南

## 🔍 问题分析

Google SSO回调URL仍然指向localhost:3000的原因：

### 1. **环境变量未正确设置**
- `NEXT_PUBLIC_SITE_URL` 在Vercel中未设置或设置错误
- 环境变量作用域不正确

### 2. **客户端重定向URL配置**
- 使用了 `window.location.origin` 而不是环境变量
- 在服务端渲染时无法获取正确的URL

### 3. **Vercel头部信息处理**
- 未正确使用 `x-forwarded-host` 和 `x-forwarded-proto` 头
- 回退逻辑不完善

## 🔧 修复措施

### 1. **客户端重定向URL修复**
```typescript
// 修复前
redirectTo: `${window.location.origin}/auth/callback`

// 修复后
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
const redirectUrl = `${siteUrl}/auth/callback`
```

### 2. **服务端重定向逻辑优化**
```typescript
// 优先级顺序
1. 环境变量 NEXT_PUBLIC_SITE_URL
2. Vercel转发头 x-forwarded-host + x-forwarded-proto
3. 请求origin（回退）
```

### 3. **调试日志添加**
```typescript
console.log('🔍 回调URL调试信息:', {
  origin,
  siteUrl,
  forwardedHost,
  forwardedProto,
  isLocalEnv,
  nodeEnv: process.env.NODE_ENV
})
```

## ⚙️ Vercel环境变量配置

### 1. **必需的环境变量**
```bash
# 在Vercel项目设置中添加
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GOOGLE_API_KEY=your_google_api_key
```

### 2. **环境变量作用域**
- **Production**: 生产环境
- **Preview**: 预览环境
- **Development**: 开发环境

确保所有环境都设置了 `NEXT_PUBLIC_SITE_URL`

### 3. **域名配置**
```bash
# 生产环境
NEXT_PUBLIC_SITE_URL=https://www.mochiface.com

# 预览环境
NEXT_PUBLIC_SITE_URL=https://mochiface-git-branch.vercel.app

# 开发环境
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 🔧 Supabase配置

### 1. **重定向URL设置**
在Supabase Dashboard > Authentication > URL Configuration中添加：

```
https://your-domain.vercel.app/auth/callback
https://your-domain.vercel.app/**
```

### 2. **Google OAuth配置**
在Google Cloud Console > OAuth 2.0客户端ID中添加：

```
https://your-domain.vercel.app/auth/callback
```

## 🧪 测试步骤

### 1. **检查环境变量**
```bash
# 在Vercel函数中打印环境变量
console.log('NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL)
```

### 2. **检查重定向URL**
```bash
# 在浏览器控制台检查
console.log('Current origin:', window.location.origin)
console.log('Site URL:', process.env.NEXT_PUBLIC_SITE_URL)
```

### 3. **检查回调日志**
查看Vercel函数日志中的调试信息：
```
🔍 回调URL调试信息: {
  origin: "https://your-domain.vercel.app",
  siteUrl: "https://your-domain.vercel.app",
  forwardedHost: "your-domain.vercel.app",
  forwardedProto: "https",
  isLocalEnv: false,
  nodeEnv: "production"
}
```

## 🚨 常见问题

### 1. **环境变量未生效**
- 检查环境变量名称是否正确
- 确认环境变量作用域设置
- 重新部署应用

### 2. **重定向循环**
- 检查Supabase重定向URL配置
- 确认Google OAuth重定向URI设置
- 检查域名是否匹配

### 3. **HTTPS问题**
- 确保生产环境使用HTTPS
- 检查证书配置
- 确认Vercel自动HTTPS设置

## 📋 检查清单

### Vercel配置
- [ ] `NEXT_PUBLIC_SITE_URL` 环境变量已设置
- [ ] 环境变量作用域正确（Production/Preview/Development）
- [ ] 域名格式正确（包含https://）
- [ ] 应用已重新部署

### Supabase配置
- [ ] 重定向URL已添加到Site URL
- [ ] 重定向URL已添加到Redirect URLs
- [ ] Google OAuth提供者已启用
- [ ] 客户端ID和密钥已配置

### Google Cloud配置
- [ ] OAuth 2.0客户端ID已创建
- [ ] 重定向URI已添加
- [ ] 客户端ID已添加到Supabase

### 代码配置
- [ ] 客户端重定向URL使用环境变量
- [ ] 服务端重定向逻辑已优化
- [ ] 调试日志已添加

## 🎯 验证方法

### 1. **本地测试**
```bash
# 设置环境变量
export NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
npm run dev
```

### 2. **Vercel预览测试**
```bash
# 部署到预览环境
vercel --target preview
```

### 3. **生产环境测试**
```bash
# 部署到生产环境
vercel --prod
```

通过以上配置，Google SSO回调URL问题应该得到解决！🎉
