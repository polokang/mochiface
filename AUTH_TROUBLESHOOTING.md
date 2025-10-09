# 认证问题诊断指南

## 🔍 问题分析

您遇到的401错误通常由以下原因引起：

### 1. **用户认证状态问题**
- 用户未正确登录
- 会话已过期
- Cookie设置问题

### 2. **数据库Profile缺失**
- 用户注册后Profile未创建
- 数据库触发器未正常工作
- RLS策略阻止访问

### 3. **环境变量配置**
- Supabase配置错误
- 缺少必要的环境变量

## 🔧 已修复的问题

### 1. **认证提供者优化**
- 修复了用户Profile获取逻辑
- 添加了错误处理和降级方案
- 确保从数据库正确获取用户数据

### 2. **Google认证API修复**
- 移除了不存在的RPC函数调用
- 直接使用Supabase客户端插入数据
- 添加了积分流水记录创建

### 3. **用户创建流程**
- 确保用户注册时创建Profile
- 添加积分分配逻辑
- 处理用户名冲突

## 🚀 测试步骤

### 1. **检查用户登录状态**
```javascript
// 在浏览器控制台检查
console.log('User:', window.localStorage.getItem('supabase.auth.token'))
```

### 2. **检查数据库Profile**
```sql
-- 在Supabase SQL编辑器中执行
SELECT * FROM profiles WHERE user_id = 'your-user-id';
```

### 3. **检查认证Cookie**
```javascript
// 在浏览器控制台检查
document.cookie
```

## 🔍 调试方法

### 1. **查看Vercel日志**
```bash
vercel logs --follow
```

### 2. **检查网络请求**
- 打开Chrome DevTools
- 查看Network面板
- 检查API请求的Headers和Response

### 3. **检查Supabase认证**
- 登录Supabase Dashboard
- 查看Authentication > Users
- 检查用户状态和元数据

## 📋 常见解决方案

### 1. **清除浏览器数据**
```javascript
// 清除所有认证相关数据
localStorage.clear()
sessionStorage.clear()
// 清除所有Cookie
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});
```

### 2. **重新登录**
- 完全退出登录
- 清除浏览器缓存
- 重新进行Google登录

### 3. **检查环境变量**
确保Vercel环境变量正确设置：
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🎯 预防措施

### 1. **添加认证检查**
```typescript
// 在API路由中添加更详细的错误信息
if (!user) {
  console.error('User not found:', {
    hasSession: !!session,
    userId: user?.id,
    error: error?.message
  })
  return NextResponse.json(
    { error: 'Not logged in', details: 'User session not found' },
    { status: 401 }
  )
}
```

### 2. **添加重试机制**
```typescript
// 在认证提供者中添加重试逻辑
const retryAuth = async (maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        await fetchUserProfile(session.user)
        return
      }
    } catch (error) {
      console.error(`Auth retry ${i + 1} failed:`, error)
      if (i === maxRetries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
}
```

### 3. **监控认证状态**
```typescript
// 添加认证状态监控
useEffect(() => {
  const checkAuthStatus = () => {
    if (!user && !loading) {
      console.warn('User not authenticated, redirecting to login')
      router.push('/login')
    }
  }
  
  const interval = setInterval(checkAuthStatus, 5000)
  return () => clearInterval(interval)
}, [user, loading])
```

## 📞 进一步支持

如果问题仍然存在，请提供以下信息：

1. **错误日志**：完整的Vercel函数日志
2. **用户ID**：从Supabase Dashboard获取
3. **浏览器信息**：Chrome DevTools的Network面板截图
4. **环境变量**：确认所有必要的环境变量已设置

通过这些修复，401认证错误应该得到解决！🎯
