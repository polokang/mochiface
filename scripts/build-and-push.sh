#!/bin/bash

# 构建和推送 Docker 镜像到 Docker Hub 的脚本

# 检查环境变量
if [ -z "$DOCKER_HUB_USERNAME" ] || [ -z "$DOCKER_IMAGE_NAME" ]; then
    echo "错误: 请设置 DOCKER_HUB_USERNAME 和 DOCKER_IMAGE_NAME 环境变量"
    echo "例如: export DOCKER_HUB_USERNAME=your-username"
    echo "例如: export DOCKER_IMAGE_NAME=mochiface"
    exit 1
fi

# 设置变量
IMAGE_NAME="$DOCKER_HUB_USERNAME/$DOCKER_IMAGE_NAME"
TAG="latest"

echo "🚀 开始构建 Docker 镜像..."
echo "镜像名称: $IMAGE_NAME:$TAG"

# 构建镜像
docker build -t $IMAGE_NAME:$TAG .

if [ $? -ne 0 ]; then
    echo "❌ 镜像构建失败"
    exit 1
fi

echo "✅ 镜像构建成功"

# 登录 Docker Hub
echo "🔐 登录 Docker Hub..."
docker login

if [ $? -ne 0 ]; then
    echo "❌ Docker Hub 登录失败"
    exit 1
fi

# 推送镜像
echo "📤 推送镜像到 Docker Hub..."
docker push $IMAGE_NAME:$TAG

if [ $? -ne 0 ]; then
    echo "❌ 镜像推送失败"
    exit 1
fi

echo "✅ 镜像推送成功!"
echo "🎉 镜像地址: $IMAGE_NAME:$TAG"
echo ""
echo "现在可以使用以下命令部署:"
echo "docker-compose -f docker-compose.prod.yml up -d"
