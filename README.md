# MochiFace - 头像风格化生成器

一个基于 AI 的头像风格化生成网站，支持多种艺术风格，让用户轻松创建独特的风格化头像。

## 功能特性

- 🎨 **多种艺术风格**: 支持卡通、动漫、水彩、复古等多种风格
- 🖼️ **高质量输出**: 使用先进的 AI 技术生成高分辨率头像
- 💰 **积分系统**: 新用户赠送 3 积分，完成任务获得更多积分
- 🔐 **安全认证**: 基于 Supabase Auth 的用户认证系统
- 📱 **响应式设计**: 完美适配桌面和移动设备
- 🐳 **Docker 支持**: 一键部署，开箱即用

## 技术栈

- **前端**: Next.js 14 (App Router) + React + TypeScript + TailwindCSS + shadcn/ui
- **后端**: Next.js API Routes + Supabase
- **数据库**: Supabase (PostgreSQL)
- **存储**: Supabase Storage
- **认证**: Supabase Auth
- **图片生成**: Nano Banana API
- **部署**: Docker + Docker Compose

## 快速开始

### 环境要求

- Node.js 18+ 
- Docker & Docker Compose (可选)
- Supabase 账户

### 1. 克隆项目

```bash
git clone <repository-url>
cd mochiface
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env` 并填写配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 图片生成 API (Nano Banana)
NANOBANANA_API_BASE=https://api.nanobanana.example/v1
NANOBANANA_API_KEY=your_nanobanana_api_key

# 奖励任务签名密钥
REWARD_SIGNING_SECRET=your-long-random-signing-secret

# Next.js 配置
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
```

### 4. 设置 Supabase

1. 在 [Supabase](https://supabase.com) 创建新项目
2. 启用 Storage 功能
3. 创建两个存储桶：
   - `uploads`: 存储用户上传的原始图片
   - `results`: 存储生成的风格化图片
4. 在 SQL 编辑器中执行 `supabase/schema.sql` 和 `supabase/policies.sql`

### 5. 运行开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## Docker 部署

### 使用 Docker Compose

```bash
# 构建并启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 手动 Docker 构建

```bash
# 构建镜像
docker build -t mochiface .

# 运行容器
docker run -p 3000:3000 --env-file .env mochiface
```

## 项目结构

```
mochiface/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   ├── auth/          # 认证相关
│   │   ├── credits/       # 积分管理
│   │   ├── image/         # 图片生成
│   │   └── uploads/       # 文件上传
│   ├── (auth)/            # 认证页面
│   ├── dashboard/         # 用户仪表板
│   ├── upload/            # 上传页面
│   └── rewards/           # 奖励任务
├── components/            # React 组件
│   └── ui/               # shadcn/ui 组件
├── lib/                  # 工具库
│   ├── supabase/         # Supabase 客户端
│   ├── auth.ts           # 认证工具
│   ├── credits.ts        # 积分系统
│   ├── image-gen/        # 图片生成服务
│   └── rewards/          # 奖励系统
├── supabase/             # 数据库模式
│   ├── schema.sql        # 表结构
│   └── policies.sql      # RLS 策略
└── public/               # 静态资源
```

## 数据库设计

### 主要表结构

- `profiles`: 用户资料和积分
- `credit_transactions`: 积分流水记录
- `generated_images`: 生成记录
- `reward_tasks`: 奖励任务记录

### 积分系统

- 新用户注册赠送 3 积分
- 每次生成图片消耗 1 积分
- 完成奖励任务获得 1 积分
- 所有积分变动都有详细记录

## API 接口

### 认证接口

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

### 积分接口

- `GET /api/credits/me` - 获取当前积分
- `POST /api/credits/grant` - 发放积分

### 图片接口

- `GET /api/image/styles` - 获取风格列表
- `POST /api/image/generate` - 生成风格化图片
- `POST /api/upload-image` - 上传图片

## 安全特性

- 行级安全策略 (RLS) 保护用户数据
- 文件类型和大小验证
- 积分系统防刷机制
- 奖励任务签名验证

## 合规说明

本项目实现了合规的奖励积分系统：

- **禁止使用 Google AdSense 激励广告**（违反 AdSense 政策）
- 使用自有奖励任务系统（观看站内视频）
- 提供 `RewardProvider` 适配层，便于未来集成其他合规的广告网络
- UI 文案不涉及 AdSense 激励

## 开发指南

### 添加新的图片风格

1. 在 `lib/image-gen/index.ts` 中添加新风格
2. 更新 `IMAGE_STYLES` 数组
3. 在 `lib/image-gen/nano-banana.ts` 中实现对应的 API 调用

### 添加新的奖励任务

1. 在 `lib/rewards/self-hosted.ts` 中实现新的任务类型
2. 更新前端页面添加新的任务选项
3. 确保任务验证逻辑正确

### 集成其他图片生成服务

1. 实现 `ImageGenService` 接口
2. 在 `lib/image-gen/` 目录下创建新的适配器
3. 更新环境变量配置

## 故障排除

### 常见问题

1. **Supabase 连接失败**
   - 检查环境变量配置
   - 确认 Supabase 项目状态

2. **图片上传失败**
   - 检查 Supabase Storage 配置
   - 确认存储桶权限设置

3. **积分系统异常**
   - 检查数据库 RLS 策略
   - 确认用户认证状态

### 日志查看

```bash
# Docker 日志
docker-compose logs -f web

# 开发环境日志
npm run dev
```

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系方式

如有问题或建议，请通过以下方式联系：

- 创建 Issue
- 发送邮件至 [your-email@example.com]

---

**注意**: 请确保在生产环境中使用强密码和安全的密钥配置。