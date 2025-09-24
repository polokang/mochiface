# 🍡 MochiFace - AI 图片生成平台

一个基于 Next.js 和 Google Nano Banana API 的现代化 AI 图片生成平台，支持多种艺术风格转换。

## ✨ 功能特性

- 🎨 **多种艺术风格** - 支持动漫、写实、卡通、油画、水彩、素描等风格
- 👤 **用户系统** - 完整的用户注册、登录和身份验证
- 🪙 **积分系统** - 用户注册获得 3 积分，每次生成消耗 1 积分
- 🔐 **安全认证** - 基于 JWT 的用户认证系统
- 🗄️ **数据持久化** - MongoDB 数据库存储用户和生成记录
- 🐳 **Docker 部署** - 完整的 Docker 和 Docker Compose 配置
- 🌐 **Nginx 代理** - 80 端口反向代理，支持静态文件服务
- 📱 **响应式设计** - 基于 Tailwind CSS 的现代化 UI

## 🚀 技术栈

- **前端**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **后端**: Next.js API Routes, Node.js
- **数据库**: MongoDB with Mongoose
- **认证**: JWT (jsonwebtoken)
- **密码加密**: bcryptjs
- **部署**: Docker, Docker Compose, Nginx
- **AI 服务**: Google Nano Banana API

## 📋 环境要求

- Node.js 18+
- Docker & Docker Compose
- 远程 MongoDB 数据库 (MongoDB Atlas 或自建)

## 🛠️ 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd mochiface
```

### 2. 配置环境变量

```bash
# Windows
copy env.example .env

# Linux/Mac
cp env.example .env
```

编辑 `.env` 文件，填入必要的配置：

```env
# 应用配置
NODE_ENV=development
PORT=3000

# 数据库配置 - 使用远程 MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mochiface

# JWT 配置
JWT_SECRET=your-super-secret-jwt-key-here

# Google API 配置
GOOGLE_API_KEY=your-google-api-key-here
```

> **重要**: 确保 `.env` 文件在项目根目录下，Docker Compose 会自动读取此文件中的环境变量。

### 3. 使用 Docker Compose 启动

```bash
# 构建并启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 4. 访问应用

- 应用地址: http://localhost
- API 文档: http://localhost/api
- 健康检查: http://localhost/health

## 🔧 开发模式

### 本地开发

```bash
# 安装依赖
npm install

# 配置环境变量 (确保 MONGODB_URI 指向远程数据库)
cp env.example .env
# 编辑 .env 文件，填入远程 MongoDB 连接字符串

# 启动开发服务器
npm run dev
```

### 构建和部署

```bash
# 构建应用
npm run build

# 启动生产服务器
npm start

# 使用 Docker 构建镜像
docker build -t mochiface .

# 推送到 Docker Hub
docker tag mochiface your-username/mochiface:latest
docker push your-username/mochiface:latest
```

## 📁 项目结构

```
mochiface/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   ├── auth/          # 认证相关 API
│   │   ├── generate/      # 图片生成 API
│   │   └── user/          # 用户相关 API
│   ├── login/             # 登录页面
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 首页
├── components/            # React 组件
│   └── ui/               # UI 组件库
├── lib/                  # 工具库
│   ├── auth.ts           # 认证工具
│   ├── auth-context.tsx  # 认证上下文
│   ├── mongodb.ts        # 数据库连接
│   └── utils.ts          # 通用工具
├── models/               # 数据模型
│   ├── User.ts           # 用户模型
│   └── Generation.ts     # 生成记录模型
├── public/               # 静态资源
│   └── images/           # 图片存储
├── docker-compose.yml    # Docker Compose 配置
├── Dockerfile           # Docker 镜像配置
├── nginx.conf           # Nginx 配置
└── mongo-init.js        # MongoDB 初始化脚本
```

## 🔌 API 接口

### 认证接口

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

### 用户接口

- `GET /api/user/credits` - 获取用户积分

### 图片生成接口

- `POST /api/generate` - 生成图片

## 🎨 支持的艺术风格

- **anime** - 动漫风格
- **realistic** - 写实风格
- **cartoon** - 卡通风格
- **oil_painting** - 油画风格
- **watercolor** - 水彩风格
- **sketch** - 素描风格

## 🔒 安全特性

- JWT Token 认证
- 密码 bcrypt 加密
- 文件上传验证
- API 请求限制
- 环境变量保护

## 🐳 Docker 服务

- **app**: Next.js 应用 (端口 3000)
- **nginx**: 反向代理服务器 (端口 80)

> **注意**: 数据库通过 MONGODB_URI 环境变量连接远程 MongoDB 服务

## 📝 使用说明

1. **注册账户** - 新用户注册自动获得 3 个积分
2. **上传图片** - 选择要转换的原始图片
3. **选择风格** - 从 6 种艺术风格中选择一种
4. **生成图片** - 点击生成按钮，消耗 1 积分
5. **下载结果** - 生成完成后可下载新图片

## 🤝 贡献指南

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

MIT License - 查看 [LICENSE](LICENSE) 文件了解详情

## 🆘 常见问题

### Q: 如何获取 Google API Key？
A: 请访问 Google Cloud Console 创建项目并启用相关 API 服务。

### Q: 如何修改积分规则？
A: 在 `models/User.ts` 中修改默认积分值，在 `app/api/generate/route.ts` 中修改消耗规则。

### Q: 如何添加新的艺术风格？
A: 在 `app/page.tsx` 的 `ART_STYLES` 数组中添加新风格，并在 `models/Generation.ts` 中更新枚举值。

## 📞 支持

如有问题或建议，请提交 Issue 或联系开发团队。
