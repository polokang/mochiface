# Google SSO 登录配置指南

本文档说明如何在 MochiFace 项目中配置和使用 Google SSO 登录功能。

## 前置条件

1. 已配置好 Supabase 项目
2. 已设置好基本的认证系统

## 配置步骤

### 1. 在 Google Cloud Console 中创建 OAuth 应用

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 Google+ API
4. 转到 "凭据" > "创建凭据" > "OAuth 2.0 客户端 ID"
5. 选择 "Web 应用程序"
6. 配置以下设置：
   - **名称**: MochiFace Auth
   - **已获授权的 JavaScript 来源**: 
     - `http://localhost:3000` (开发环境)
     - `https://yourdomain.com` (生产环境)
   - **已获授权的重定向 URI**:
     - `https://your-project-ref.supabase.co/auth/v1/callback`

### 2. 在 Supabase Dashboard 中配置 Google 提供商

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 转到 "Authentication" > "Providers"
4. 找到 "Google" 并点击启用
5. 输入以下信息：
   - **Client ID**: 从 Google Cloud Console 获取
   - **Client Secret**: 从 Google Cloud Console 获取
6. 点击 "Save"

### 3. 配置环境变量

确保你的 `.env.local` 文件包含以下变量：

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. 测试配置

运行测试脚本验证配置：

```bash
node scripts/test-google-auth.js
```

## 功能特性

### 前端功能

- **登录页面**: 添加了 Google 登录按钮
- **注册页面**: 添加了 Google 登录按钮
- **OAuth 回调**: 自动处理 Google 登录后的重定向

### 后端功能

- **用户档案创建**: 自动为新用户创建档案
- **用户名生成**: 从 Google 用户信息自动生成唯一用户名
- **积分分配**: 为新用户自动分配 3 个欢迎积分
- **会话管理**: 集成 Supabase 认证系统

### 用户体验

- **无缝登录**: 用户可以通过 Google 账户快速登录
- **自动注册**: 首次使用 Google 登录的用户会自动创建账户
- **数据同步**: 自动同步 Google 用户信息（姓名、头像等）

## 代码结构

```
app/
├── (auth)/
│   ├── login/page.tsx          # 登录页面（包含 Google 登录）
│   └── register/page.tsx       # 注册页面（包含 Google 登录）
├── auth/
│   └── callback/route.ts       # OAuth 回调处理
└── api/
    └── auth/
        └── google/route.ts     # Google 登录 API

lib/
└── auth-context.tsx            # 认证上下文（支持 Google 登录）
```

## 故障排除

### 常见问题

1. **"Google OAuth 配置错误"**
   - 检查 Supabase Dashboard 中的 Google 提供商配置
   - 确认 Client ID 和 Client Secret 正确

2. **"重定向 URI 不匹配"**
   - 检查 Google Cloud Console 中的重定向 URI 配置
   - 确保 URI 格式为: `https://your-project-ref.supabase.co/auth/v1/callback`

3. **"用户档案创建失败"**
   - 检查 Supabase 数据库中的 profiles 表结构
   - 确认 RLS 策略允许插入操作

### 调试步骤

1. 检查浏览器控制台是否有错误信息
2. 查看 Supabase Dashboard 中的认证日志
3. 运行测试脚本验证配置
4. 检查网络请求是否成功

## 安全注意事项

1. **环境变量**: 确保敏感信息存储在环境变量中
2. **HTTPS**: 生产环境必须使用 HTTPS
3. **域名验证**: 确保重定向 URI 域名已正确验证
4. **权限最小化**: 只请求必要的用户信息权限

## 更新日志

- **v1.0.0**: 初始 Google SSO 集成
  - 添加 Google 登录按钮到登录和注册页面
  - 实现 OAuth 回调处理
  - 自动用户档案创建和积分分配
  - 集成 Supabase 认证系统
