# Profile Email列错误修复指南

## 🔍 问题诊断

**错误信息**:
```
Error creating user profile: {
  code: 'PGRST204',
  details: null,
  hint: null,
  message: "Could not find the 'email' column of 'profiles' in the schema cache"
}
```

## 📊 问题分析

### 1. **Profiles表结构**
当前profiles表的列：
- `user_id` (uuid, primary key)
- `username` (text, unique)
- `points` (integer, default: 3)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)
- `last_login_at` (timestamptz, nullable)

**✅ 确认：profiles表中没有email列**

### 2. **数据库触发器**
- `on_auth_user_created` 触发器会在用户注册时自动调用`handle_new_user()`函数
- `handle_new_user()`函数只插入`user_id, username, points`字段

**✅ 确认：触发器和函数代码正确，没有尝试访问email列**

### 3. **可能的原因**
- **Schema Cache过期**: Supabase的PostgREST层可能缓存了旧的表结构
- **之前的迁移**: 之前可能有email列，后来被删除了，但缓存没有更新

## 🔧 解决方案

### 方案1: 刷新Schema Cache（推荐）

通过Supabase Dashboard刷新schema cache：

1. 登录Supabase Dashboard
2. 进入项目设置 (Project Settings)
3. 进入API设置 (API Settings)
4. 点击"Reload schema cache"按钮

### 方案2: 通过SQL刷新Cache

执行以下SQL命令：

```sql
NOTIFY pgrst, 'reload schema';
```

### 方案3: 重启PostgREST服务

如果上述方法不work，尝试重启PostgREST服务：

1. 进入Supabase Dashboard
2. 进入Database设置
3. 找到PostgREST服务并重启

### 方案4: 添加email列到profiles表（不推荐）

如果确实需要email列，可以添加：

```sql
ALTER TABLE profiles 
ADD COLUMN email text;

-- 更新现有记录的email
UPDATE profiles p
SET email = u.email
FROM auth.users u
WHERE p.user_id = u.id;
```

## 🎯 验证修复

修复后，测试Google SSO登录：

1. 清除浏览器缓存
2. 尝试使用Google SSO登录
3. 检查浏览器控制台是否有错误
4. 检查Supabase Dashboard中profiles表是否有新记录

## 📋 检查清单

- [ ] 刷新Supabase schema cache
- [ ] 测试Google SSO登录
- [ ] 确认profiles表中有新用户记录
- [ ] 确认credit_transactions表中有signup_bonus记录
- [ ] 检查浏览器控制台无错误

## 🚨 注意事项

1. **不要手动修改profiles表结构**，除非确实需要
2. **Schema cache刷新可能需要几分钟**生效
3. **测试时使用新的Google账号**，避免缓存问题

## 💡 预防措施

1. 定期检查schema cache是否需要刷新
2. 在修改表结构后，主动刷新cache
3. 使用版本控制管理数据库迁移

修复后应该能够正常使用Google SSO登录！🎉
