# 认证状态调试工具

## 🔍 问题诊断

用户信息已成功插入数据库，但dashboard页面仍然跳转到登录页面，可能的原因：

### 1. **认证状态同步时机问题**
- 页面加载时认证状态还未完全同步
- 数据库查询用户profile有延迟
- 认证提供者初始化需要时间

### 2. **数据库查询失败**
- RLS策略阻止查询
- 网络连接问题
- 用户profile数据格式问题

### 3. **会话状态问题**
- Supabase会话Cookie未正确设置
- 会话过期或无效
- 跨页面状态同步失败

## 🛠️ 调试步骤

### 1. **检查浏览器控制台日志**
打开Chrome DevTools，查看Console面板，寻找以下关键日志：

```
🔍 [认证] 开始检查会话状态
🔍 [认证] 会话状态: { hasSession: true, hasUser: true, userId: "xxx" }
👤 [认证] 开始获取用户资料
🔍 [认证] 开始查询用户profile，用户ID: xxx
✅ [认证] 成功获取用户profile: { ... }
👤 [认证] 设置用户数据: { ... }
⏰ [认证] 认证初始化完成
```

### 2. **检查认证状态变化**
寻找状态变化日志：

```
🔄 [认证] 状态变化: { event: "SIGNED_IN", hasSession: true, hasUser: true, userId: "xxx" }
👤 [认证] 状态变化：开始获取用户资料
✅ [认证] 状态变化：用户资料获取完成
```

### 3. **检查Dashboard认证检查**
寻找Dashboard页面的认证检查日志：

```
🔍 [Dashboard] 认证状态检查: { loading: false, hasUser: true, userId: "xxx" }
```

## 🚨 常见错误模式

### 模式1：数据库查询失败
```
❌ [认证] 查询用户profile失败: { code: "PGRST116", message: "The result contains 0 rows" }
ℹ️ [认证] 用户profile不存在，创建默认数据
```

**解决方案**: 检查用户profile是否正确创建

### 模式2：会话获取失败
```
❌ [认证] 获取会话失败: { message: "Invalid JWT" }
```

**解决方案**: 检查Supabase配置和Cookie设置

### 模式3：认证状态未设置
```
🔍 [认证] 会话状态: { hasSession: true, hasUser: true, userId: "xxx" }
👤 [认证] 开始获取用户资料
❌ [认证] 查询用户profile失败: { code: "42501", message: "permission denied" }
❌ [认证] 数据库查询错误，不设置用户状态
```

**解决方案**: 检查RLS策略配置

## 🔧 手动调试命令

### 1. **检查Supabase会话**
在浏览器控制台执行：
```javascript
// 检查当前会话
const { data: { session } } = await supabase.auth.getSession()
console.log('当前会话:', session)

// 检查用户信息
console.log('用户信息:', session?.user)
```

### 2. **检查用户Profile**
```javascript
// 查询用户profile
const { data: profile, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('user_id', session?.user?.id)
  .single()

console.log('Profile数据:', profile)
console.log('查询错误:', error)
```

### 3. **检查认证状态**
```javascript
// 检查认证提供者状态
console.log('认证状态:', {
  user: user,
  loading: loading,
  authInitialized: authInitialized
})
```

## 📊 调试检查清单

### 认证提供者
- [ ] Supabase客户端正确初始化
- [ ] 会话状态正确获取
- [ ] 用户profile查询成功
- [ ] 用户数据正确设置
- [ ] 认证状态变化监听正常

### Dashboard页面
- [ ] 认证状态检查正常
- [ ] 重定向逻辑正确
- [ ] 延迟机制生效
- [ ] 调试日志清晰

### 数据库
- [ ] 用户profile数据存在
- [ ] RLS策略配置正确
- [ ] 查询权限正常
- [ ] 数据格式正确

## 🎯 快速修复建议

### 1. **如果数据库查询失败**
```typescript
// 在fetchUserProfile中添加重试机制
const retryQuery = async (maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .single()
      
      if (!error) return profile
    } catch (err) {
      if (i === maxRetries - 1) throw err
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
}
```

### 2. **如果认证状态未同步**
```typescript
// 添加强制刷新机制
useEffect(() => {
  const refreshAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      await fetchUserProfile(session.user)
    }
  }
  
  // 每5秒检查一次认证状态
  const interval = setInterval(refreshAuth, 5000)
  return () => clearInterval(interval)
}, [])
```

### 3. **如果重定向过快**
```typescript
// 增加重定向延迟
useEffect(() => {
  if (!loading && !user) {
    const timer = setTimeout(() => {
      router.push('/login')
    }, 1000) // 增加到1秒
    
    return () => clearTimeout(timer)
  }
}, [loading, user, router])
```

通过以上调试工具和修复建议，应该能够解决认证状态同步问题！🎯
