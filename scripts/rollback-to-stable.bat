@echo off
REM 回滚到稳定版本的Windows批处理脚本
REM 使用方法: scripts\rollback-to-stable.bat

echo 🔄 开始回滚到稳定版本 v1.0-stable...

REM 检查标签是否存在
git tag -l | findstr "v1.0-stable" >nul
if errorlevel 1 (
    echo ❌ 错误: 找不到标签 v1.0-stable
    echo 请确保标签已创建并推送到远程仓库
    pause
    exit /b 1
)

REM 显示当前状态
echo 📊 当前状态:
git status --short
echo.

REM 确认回滚
set /p confirm="⚠️  这将重置当前分支到 v1.0-stable 标签。继续吗？(y/N): "
if /i not "%confirm%"=="y" (
    echo ❌ 回滚已取消
    pause
    exit /b 0
)

REM 执行回滚
echo 🔄 正在回滚...
git reset --hard v1.0-stable

REM 检查回滚结果
if errorlevel 1 (
    echo ❌ 回滚失败
    pause
    exit /b 1
) else (
    echo ✅ 回滚成功！
    echo 📊 当前状态:
    git log --oneline -5
    echo.
    echo 🚀 现在可以重新部署到 Vercel
)

pause
