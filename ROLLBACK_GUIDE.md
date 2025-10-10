# 回滚指南

## 稳定版本标记

当前稳定版本已标记为 `v1.0-stable`，包含以下功能：

### ✅ 已实现功能
- 图片生成API完整实现
- 支持文件上传和URL两种方式
- 图片自动压缩优化
- 同步处理避免Vercel超时
- 完整的错误处理和日志记录
- 数据库RLS限制已禁用
- Google Gemini API集成
- 积分系统集成

### 🔧 技术特性
- 使用Sharp进行图片压缩
- 直接Buffer处理避免重复下载
- 兼容multipart/form-data和JSON请求
- 简化的数据库操作
- 优化的重试机制和超时设置

## 快速回滚方法

### 方法1：使用脚本（推荐）

**Windows:**
```bash
scripts\rollback-to-stable.bat
```

**Linux/Mac:**
```bash
chmod +x scripts/rollback-to-stable.sh
./scripts/rollback-to-stable.sh
```

### 方法2：手动Git命令

```bash
# 1. 查看所有标签
git tag -l

# 2. 回滚到稳定版本
git reset --hard v1.0-stable

# 3. 强制推送到远程（如果需要）
git push origin master --force
```

### 方法3：创建新分支

```bash
# 1. 基于稳定版本创建新分支
git checkout -b hotfix v1.0-stable

# 2. 推送新分支
git push origin hotfix

# 3. 在Vercel中切换到hotfix分支进行部署
```

## 回滚前检查

在回滚前，建议先：

1. **备份当前更改**
   ```bash
   git stash push -m "backup before rollback"
   ```

2. **查看当前状态**
   ```bash
   git status
   git log --oneline -10
   ```

3. **确认标签存在**
   ```bash
   git tag -l | grep v1.0-stable
   ```

## 回滚后操作

回滚完成后：

1. **重新部署到Vercel**
   - 推送代码到远程仓库
   - Vercel会自动触发重新部署

2. **验证功能**
   - 测试图片生成功能
   - 检查日志输出
   - 确认数据库操作正常

3. **继续开发**
   - 可以基于稳定版本继续开发
   - 建议创建新的功能分支

## 标签管理

### 查看标签详情
```bash
git show v1.0-stable
```

### 删除标签（如果需要）
```bash
# 删除本地标签
git tag -d v1.0-stable

# 删除远程标签
git push origin --delete v1.0-stable
```

### 创建新标签
```bash
# 创建带注释的标签
git tag -a v1.1-feature -m "新功能描述"

# 推送标签
git push origin v1.1-feature
```

## 注意事项

⚠️ **重要提醒：**
- 回滚会丢失当前所有未提交的更改
- 建议在回滚前先提交或备份当前工作
- 如果已经推送到远程，回滚后需要强制推送
- 在生产环境回滚前，建议先在测试环境验证

## 联系支持

如果回滚过程中遇到问题，请检查：
1. Git状态是否正常
2. 网络连接是否稳定
3. 是否有足够的权限操作仓库
