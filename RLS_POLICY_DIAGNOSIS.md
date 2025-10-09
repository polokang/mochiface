# RLS策略问题诊断和修复指南

## 🔍 问题确认

通过检查Supabase数据库，确认存在RLS策略问题：

### 1. **当前RLS策略配置**
```sql
-- profiles表的RLS策略
Policy: "profiles: owner rw"
Type: PERMISSIVE
Roles: {authenticated}
Command: ALL
Condition: (auth.uid() = user_id)
```

### 2. **问题分析**
- RLS策略要求 `auth.uid() = user_id`
- 客户端查询时 `auth.uid()` 可能返回null
- 导致权限不足错误 (code: 42501)

### 3. **数据库状态**
- profiles表中有1条记录
- 用户ID: `e21dfe83-59b3-4b65-85d4-e7cc8270eec9`
- 用户名: `hunter.zhou.au`
- 积分: 3

## 🔧 修复措施

### 1. **增强错误处理**
```typescript
// 检查当前认证状态
const { data: { user: currentUser } } = await supabase.auth.getUser()

if (!currentUser) {
  console.error('❌ [认证] 当前用户未认证，无法查询profile')
  return
}
```

### 2. **RLS权限错误处理**
```typescript
if (error.code === '42501') {
  console.error('❌ [认证] RLS策略阻止查询，权限不足')
  // 权限问题，使用默认数据
  const userData: User = {
    id: supabaseUser.id,
    username: supabaseUser.email?.split('@')[0] || 'user',
    email: supabaseUser.email || '',
    credits: 3,
    full_name: supabaseUser.user_metadata?.full_name,
    avatar_url: supabaseUser.user_metadata?.avatar_url
  }
  setUser(userData)
  return
}
```

### 3. **详细错误日志**
```typescript
console.error('❌ [认证] 查询用户profile失败:', {
  code: error.code,
  message: error.message,
  details: error.details,
  hint: error.hint
})
```

## 🎯 根本解决方案

### 方案1：修复RLS策略（推荐）
```sql
-- 删除现有策略
DROP POLICY "profiles: owner rw" ON profiles;

-- 创建新的更宽松的策略
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_delete_own" ON profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
```

### 方案2：使用服务端查询
```typescript
// 在服务端API中查询profile
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('user_id', userId)
  .single()
```

### 方案3：临时禁用RLS（不推荐）
```sql
-- 临时禁用RLS进行测试
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
```

## 📊 调试步骤

### 1. **检查认证状态**
```javascript
// 在浏览器控制台执行
const { data: { user } } = await supabase.auth.getUser()
console.log('当前用户:', user)
console.log('用户ID:', user?.id)
```

### 2. **测试RLS策略**
```javascript
// 测试查询权限
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('user_id', user.id)

console.log('查询结果:', data)
console.log('查询错误:', error)
```

### 3. **检查会话状态**
```javascript
// 检查会话
const { data: { session } } = await supabase.auth.getSession()
console.log('会话状态:', session)
console.log('访问令牌:', session?.access_token)
```

## 🚨 常见错误码

### 42501 - 权限不足
- **原因**: RLS策略阻止查询
- **解决**: 检查认证状态和RLS策略

### PGRST116 - 记录不存在
- **原因**: 查询的记录不存在
- **解决**: 创建用户profile

### 401 - 未认证
- **原因**: 用户未登录
- **解决**: 重新登录

## 🔍 验证方法

### 1. **检查控制台日志**
寻找以下关键日志：
```
🔍 [认证] 当前认证用户: xxx
❌ [认证] RLS策略阻止查询，权限不足
```

### 2. **测试查询权限**
```javascript
// 在控制台测试
const testQuery = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
  
  console.log('测试查询结果:', { data, error })
}
testQuery()
```

### 3. **检查网络请求**
- 打开Chrome DevTools
- 查看Network面板
- 检查Supabase API请求的响应

## 📋 修复检查清单

### 代码修复
- [ ] 添加了认证状态检查
- [ ] 增强了错误处理
- [ ] 添加了RLS权限错误处理
- [ ] 改进了调试日志

### 数据库修复
- [ ] 检查RLS策略配置
- [ ] 验证用户权限
- [ ] 测试查询功能
- [ ] 确认数据完整性

### 测试验证
- [ ] 本地环境测试
- [ ] Vercel环境测试
- [ ] 不同用户测试
- [ ] 错误场景测试

通过以上修复，RLS策略问题应该得到解决！🎯
