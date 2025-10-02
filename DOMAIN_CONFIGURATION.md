# 域名配置指南

## 问题描述
Google SSO 登录后重定向到 `http://localhost:3000/` 而不是生产域名。

## 解决方案

### 1. 环境变量配置

在您的 `.env.local` 文件中添加以下配置：

```bash
# 生产环境域名配置
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# 开发环境保持 localhost
# NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 2. Vercel 环境变量配置

在 Vercel 项目设置中添加环境变量：

1. 进入 Vercel Dashboard
2. 选择您的项目
3. 进入 Settings > Environment Variables
4. 添加以下变量：
   - `NEXT_PUBLIC_SITE_URL` = `https://your-domain.com`

### 3. Supabase 项目配置

在 Supabase Dashboard 中配置重定向 URL：

1. 进入 Supabase Dashboard
2. 选择您的项目
3. 进入 Authentication > URL Configuration
4. 在 "Site URL" 中设置：`https://your-domain.com`
5. 在 "Redirect URLs" 中添加：
   - `https://your-domain.com/auth/callback`
   - `https://your-domain.com/**` (允许所有子路径)

### 4. Google OAuth 配置

在 Google Cloud Console 中配置授权重定向 URI：

1. 进入 Google Cloud Console
2. 选择您的项目
3. 进入 APIs & Services > Credentials
4. 选择您的 OAuth 2.0 客户端 ID
5. 在 "Authorized redirect URIs" 中添加：
   - `https://your-domain.com/auth/callback`
   - `https://your-domain.com/**`

### 5. 代码中的配置

代码已经自动使用环境变量 `NEXT_PUBLIC_SITE_URL`：

- `app/auth/callback/route.ts` - OAuth 回调重定向
- `app/api/auth/register/route.ts` - 邮箱确认链接

### 6. 验证配置

部署后验证以下 URL 是否正常工作：

1. 直接访问：`https://your-domain.com/auth/callback`
2. Google 登录流程
3. 邮箱确认链接

## 注意事项

- 确保所有 URL 都使用 HTTPS
- 域名必须与 Supabase 和 Google OAuth 配置中的域名完全匹配
- 开发环境可以继续使用 `http://localhost:3000`
- 生产环境必须使用 HTTPS

## 常见问题

### Q: 仍然重定向到 localhost
A: 检查 Vercel 环境变量是否正确设置，并重新部署

### Q: Google OAuth 错误
A: 检查 Google Cloud Console 中的重定向 URI 配置

### Q: Supabase 认证失败
A: 检查 Supabase Dashboard 中的 URL 配置
