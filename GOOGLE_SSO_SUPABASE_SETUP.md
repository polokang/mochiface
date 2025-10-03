# Google SSO + Supabase 登录配置指南

## 📋 概述

本指南将帮助您配置 Google OAuth 2.0 与 Supabase 的集成，实现用户通过 Google 账户登录您的应用。

## 🔑 占位符说明

本文档中使用以下占位符，请替换为您的实际值：

- `{Project ID}`: 您的 Supabase 项目 ID
- `{your_supabase_anon_key}`: Supabase 匿名密钥
- `{your_supabase_service_role_key}`: Supabase 服务角色密钥
- `{your_google_api_key}`: Google API 密钥
- `{your_google_client_id}`: Google OAuth 客户端 ID
- `{your_google_client_secret}`: Google OAuth 客户端密钥

## 🏗️ 架构说明

```
用户 → Google OAuth → Supabase → 您的应用
```

1. 用户点击 Google 登录
2. 重定向到 Google OAuth 页面
3. 用户授权后，Google 重定向到 Supabase
4. Supabase 处理认证，重定向到您的应用
5. 您的应用处理最终登录逻辑

## 🔧 配置步骤

### 步骤 1: Google Cloud Console 配置

#### 1.1 创建 Google Cloud 项目
1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 记录项目 ID

#### 1.2 启用 Google+ API
1. 进入 **APIs & Services** > **Library**
2. 搜索 "Google+ API"
3. 点击启用

#### 1.3 创建 OAuth 2.0 凭据
1. 进入 **APIs & Services** > **Credentials**
2. 点击 **+ CREATE CREDENTIALS** > **OAuth client ID**
3. 选择 **Web application**
4. 填写应用信息：
   - **Name**: MochiFace (或您的应用名称)
   - **Authorized JavaScript origins**:
     ```
     http://localhost:3000
     https://www.mochiface.com
     ```
   - **Authorized redirect URIs**:
     ```
     https://{Project ID}.supabase.co/auth/v1/callback
     https://www.mochiface.com/auth/callback
     ```
5. 点击 **Create**
6. 记录 **Client ID** (`{your_google_client_id}`) 和 **Client Secret** (`{your_google_client_secret}`)

### 步骤 2: Supabase 配置

#### 2.1 项目设置
1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择您的项目
3. 进入 **Settings** > **API**
4. 记录以下信息：
   - **Project URL**: `https://{Project ID}.supabase.co`
   - **anon public**: `{anon_key}` (anon key)
   - **service_role**: `{service_role_key}` (service role key)

#### 2.2 URL 配置
1. 进入 **Authentication** > **URL Configuration**
2. 设置：
   - **Site URL**: `https://www.mochiface.com`
   - **Redirect URLs**: 
     ```
     https://www.mochiface.com/auth/callback
     http://localhost:3000/auth/callback
     ```

#### 2.3 Google Provider 配置
1. 进入 **Authentication** > **Providers**
2. 找到 **Google** 并点击启用
3. 填入 Google OAuth 凭据：
   - **Client ID**: `{your_google_client_id}`
   - **Client Secret**: `{your_google_client_secret}`
4. 设置 **Redirect URL**: `https://www.mochiface.com/auth/callback`
5. 点击 **Save**

### 步骤 3: 环境变量配置

#### 3.1 本地开发环境 (.env.local)
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://{Project ID}.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY={your_supabase_anon_key}
SUPABASE_SERVICE_ROLE_KEY={your_supabase_service_role_key}

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Google API (for image generation)
GOOGLE_API_KEY={your_google_api_key}
```

#### 3.2 生产环境 (Vercel)
在 Vercel Dashboard 中设置环境变量：
```bash
NEXT_PUBLIC_SUPABASE_URL=https://{Project ID}.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY={your_supabase_anon_key}
SUPABASE_SERVICE_ROLE_KEY={your_supabase_service_role_key}
NEXT_PUBLIC_SITE_URL=https://www.mochiface.com
GOOGLE_API_KEY={your_google_api_key}
```

### 步骤 4: 代码实现

#### 4.1 登录页面实现
```tsx
// app/(auth)/login/page.tsx
const handleGoogleLogin = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })
}
```

#### 4.2 OAuth 回调处理
```tsx
// app/auth/callback/route.ts
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  if (code) {
    const supabase = createServerClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // 处理用户信息
      // 重定向到目标页面
      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }
}
```

#### 4.3 用户信息处理
```tsx
// app/api/auth/google/route.ts
export async function POST(request: NextRequest) {
  const { user } = await request.json()
  
  // 检查用户是否存在
  // 创建用户档案
  // 分配初始积分
}
```

## 🔍 故障排除

### 常见错误及解决方案

#### 1. redirect_uri_mismatch
**错误**: `redirect_uri_mismatch`
**原因**: Google OAuth 配置中的重定向 URI 不匹配
**解决**: 确保 Google Cloud Console 中的重定向 URI 包含：
- `https://{Project ID}.supabase.co/auth/v1/callback`
- `https://www.mochiface.com/auth/callback`

#### 2. invalid_client
**错误**: `invalid_client`
**原因**: Client ID 或 Client Secret 错误
**解决**: 检查 Supabase 中的 Google Provider 配置

#### 3. access_denied
**错误**: `access_denied`
**原因**: 用户拒绝授权或应用未通过 Google 验证
**解决**: 确保应用在 Google Cloud Console 中正确配置

#### 4. 重定向到 localhost
**问题**: 生产环境重定向到 localhost
**解决**: 检查环境变量 `NEXT_PUBLIC_SITE_URL` 是否正确设置

## 📋 配置检查清单

### Google Cloud Console
- [ ] 创建了 OAuth 2.0 客户端 ID
- [ ] 启用了 Google+ API
- [ ] 配置了正确的重定向 URI
- [ ] 记录了 Client ID (`{your_google_client_id}`) 和 Client Secret (`{your_google_client_secret}`)

### Supabase Dashboard
- [ ] 设置了正确的 Site URL
- [ ] 配置了 Redirect URLs
- [ ] 启用了 Google Provider
- [ ] 填入了正确的 Google OAuth 凭据 (`{your_google_client_id}` 和 `{your_google_client_secret}`)

### 环境变量
- [ ] 本地开发环境变量正确 (`{Project ID}`, `{your_supabase_anon_key}`, `{your_supabase_service_role_key}`, `{your_google_api_key}`)
- [ ] 生产环境变量正确
- [ ] 所有必需的密钥都已设置

### 代码实现
- [ ] 登录页面实现了 Google 登录按钮
- [ ] OAuth 回调路由正确处理认证
- [ ] 用户信息处理逻辑完整
- [ ] 错误处理机制完善

## 🚀 测试步骤

1. **本地测试**:
   - 启动开发服务器: `npm run dev`
   - 访问 `http://localhost:3000/login`
   - 点击 Google 登录按钮
   - 验证登录流程

2. **生产测试**:
   - 部署到 Vercel
   - 访问 `https://www.mochiface.com/login`
   - 测试 Google 登录
   - 验证重定向正确

## 📚 相关文档

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Next.js Authentication](https://nextjs.org/docs/authentication)

## 🔒 安全注意事项

1. **保护密钥**: 永远不要将 Client Secret 暴露在前端代码中
2. **HTTPS**: 生产环境必须使用 HTTPS
3. **域名验证**: 确保重定向 URI 域名正确
4. **定期轮换**: 定期更新 OAuth 凭据
5. **监控日志**: 监控认证日志，及时发现异常
6. **文档安全**: 本文档已隐藏敏感信息，使用占位符替代真实密钥
7. **版本控制**: 确保包含真实密钥的文件不会提交到公共代码仓库

## 📞 支持

如果遇到问题，请检查：
1. Google Cloud Console 配置
2. Supabase Dashboard 设置
3. 环境变量配置
4. 代码实现

---

**最后更新**: 2024年12月
**版本**: 1.0
