# 🔧 环境变量配置指南

## 问题诊断

您遇到的错误 `Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL` 是因为 `.env.local` 文件中的 Supabase 配置不正确。

## 解决步骤

### 1. 检查 .env.local 文件

确保项目根目录下有 `.env.local` 文件，内容如下：

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=你的实际项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的实际匿名密钥
SUPABASE_SERVICE_ROLE_KEY=你的实际服务角色密钥

# Google OAuth Configuration (configured in Supabase Dashboard)
# These are configured in Supabase Dashboard > Authentication > Providers > Google
# GOOGLE_CLIENT_ID=your_google_client_id
# GOOGLE_CLIENT_SECRET=your_google_client_secret

# External Image Generation API (Nano Banana)
NANOBANANA_API_BASE=https://api.nanobanana.example/v1
NANOBANANA_API_KEY=your_nanobanana_api_key

# Reward Task Signing Secret
REWARD_SIGNING_SECRET=your-long-random-signing-secret

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
```

### 2. 获取 Supabase 配置值

1. **登录 Supabase Dashboard**
   - 访问 [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - 使用您的账户登录

2. **选择您的项目**
   - 在项目列表中找到您的项目
   - 点击进入项目

3. **获取 API 配置**
   - 点击左侧菜单的 **Settings**
   - 选择 **API**
   - 在 **Project URL** 部分复制 URL
   - 在 **Project API keys** 部分复制：
     - `anon` `public` key
     - `service_role` `secret` key

### 3. 更新 .env.local 文件

将获取的值替换到 `.env.local` 文件中：

```bash
# 示例（请替换为您的实际值）
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. 重启开发服务器

```bash
npm run dev
```

## 验证配置

配置完成后，您应该看到：

1. **控制台日志**显示 Supabase 环境变量检查通过
2. **Google 登录**正常工作
3. **成功重定向**到 dashboard 页面

## 常见问题

### Q: 仍然看到 "Invalid supabaseUrl" 错误
A: 确保 `.env.local` 文件在项目根目录，并且 URL 格式正确（以 https:// 开头）

### Q: 环境变量没有加载
A: 确保文件名是 `.env.local`（注意前面的点），并且重启了开发服务器

### Q: 找不到 Supabase 项目
A: 确保您已经创建了 Supabase 项目，并且 Google OAuth 已经配置

## 下一步

配置完成后，Google 登录应该能够：
- ✅ 成功创建用户档案
- ✅ 正确设置认证状态
- ✅ 重定向到 dashboard 页面
