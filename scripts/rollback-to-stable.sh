#!/bin/bash

# 回滚到稳定版本的脚本
# 使用方法: ./scripts/rollback-to-stable.sh

echo "🔄 开始回滚到稳定版本 v1.0-stable..."

# 检查标签是否存在
if ! git tag -l | grep -q "v1.0-stable"; then
    echo "❌ 错误: 找不到标签 v1.0-stable"
    echo "请确保标签已创建并推送到远程仓库"
    exit 1
fi

# 显示当前状态
echo "📊 当前状态:"
git status --short
echo ""

# 确认回滚
read -p "⚠️  这将重置当前分支到 v1.0-stable 标签。继续吗？(y/N): " confirm
if [[ $confirm != [yY] ]]; then
    echo "❌ 回滚已取消"
    exit 0
fi

# 执行回滚
echo "🔄 正在回滚..."
git reset --hard v1.0-stable

# 检查回滚结果
if [ $? -eq 0 ]; then
    echo "✅ 回滚成功！"
    echo "📊 当前状态:"
    git log --oneline -5
    echo ""
    echo "🚀 现在可以重新部署到 Vercel"
else
    echo "❌ 回滚失败"
    exit 1
fi
