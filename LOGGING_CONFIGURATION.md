# 日志配置说明

## 📋 概述

本文档说明 MochiFace 应用的日志系统配置和使用方法。系统已优化为只记录关键步骤的用时信息，移除了冗余的调试日志。

## 🔧 日志系统特性

### ✅ 已清理的日志
- 移除了所有调试用的 `console.log` 语句
- 保留了错误日志 `console.error` 和警告日志 `console.warn`
- 优化了日志的可读性和性能

### 📊 关键步骤用时日志

#### 1. Google API 调用日志
**位置**: `lib/image-gen/nano-banana.ts`

```typescript
// 开始调用 Google API
console.log(`🚀 [${userId}] 开始调用 Google API 生成图片，样式: ${style}`)

// API 调用完成
console.log(`✅ [${userId}] Google API 图片生成完成，耗时: ${duration}ms`)

// API 调用失败
console.error(`❌ [${userId}] Google API 生成失败:`, error)
```

**日志格式**:
- `🚀` - 开始调用
- `✅` - 成功完成
- `❌` - 失败错误
- `[userId]` - 用户标识符
- `耗时: XXXms` - 执行时间（毫秒）

#### 2. 数据库操作日志
**位置**: `app/api/image/generate/route.ts`

```typescript
// 开始数据库操作
console.log(`💾 [${userId}] 开始数据库操作，生成ID: ${generationId}`)

// 数据库操作完成
console.log(`✅ [${userId}] 数据库操作完成，耗时: ${duration}ms`)

// 数据库操作失败
console.error(`❌ [${userId}] 图片生成处理错误:`, error)
```

**日志格式**:
- `💾` - 数据库操作
- `✅` - 操作成功
- `❌` - 操作失败
- `[userId]` - 用户标识符
- `生成ID: XXX` - 生成任务标识符
- `耗时: XXXms` - 执行时间（毫秒）

## 📈 性能监控

### 关键指标

1. **Google API 响应时间**
   - 测量从调用 Google Gemini API 到返回图片的时间
   - 帮助监控 API 性能和稳定性
   - 识别网络延迟或 API 限制问题

2. **数据库操作时间**
   - 测量图片上传到 Supabase Storage 的时间
   - 测量数据库记录更新的时间
   - 帮助优化存储和数据库性能

### 日志示例

```
🚀 [user123] 开始调用 Google API 生成图片，样式: professional
✅ [user123] Google API 图片生成完成，耗时: 3247ms
💾 [user123] 开始数据库操作，生成ID: gen_456
✅ [user123] 数据库操作完成，耗时: 156ms
```

## 🔍 日志分析

### 性能基准

**Google API 调用时间**:
- 正常范围: 2-5 秒
- 警告阈值: > 10 秒
- 错误阈值: > 30 秒

**数据库操作时间**:
- 正常范围: 100-500ms
- 警告阈值: > 2 秒
- 错误阈值: > 5 秒

### 监控建议

1. **实时监控**
   - 关注超过阈值的日志
   - 监控错误率变化
   - 分析性能趋势

2. **性能优化**
   - 识别慢查询
   - 优化 API 调用
   - 调整超时设置

3. **故障排查**
   - 通过用户 ID 追踪问题
   - 分析错误模式
   - 定位性能瓶颈

## 🛠️ 配置选项

### 环境变量

```bash
# 日志级别控制（可选）
LOG_LEVEL=info  # debug, info, warn, error

# 性能监控开关（可选）
ENABLE_PERFORMANCE_LOGGING=true
```

### 日志格式自定义

如需修改日志格式，可以更新以下文件：

1. **Google API 日志**: `lib/image-gen/nano-banana.ts`
2. **数据库日志**: `app/api/image/generate/route.ts`

## 📊 日志收集

### 开发环境
- 日志直接输出到控制台
- 便于调试和开发

### 生产环境
- 建议使用日志收集服务
- 如 Vercel 的日志系统
- 或第三方服务如 LogRocket, Sentry

### 日志存储建议

1. **结构化日志**
   ```json
   {
     "timestamp": "2024-12-01T10:30:00Z",
     "level": "info",
     "userId": "user123",
     "operation": "google_api_call",
     "duration": 3247,
     "style": "professional"
   }
   ```

2. **日志聚合**
   - 使用 ELK Stack (Elasticsearch, Logstash, Kibana)
   - 或云服务如 AWS CloudWatch
   - 或 Datadog, New Relic 等

## 🔧 故障排除

### 常见问题

1. **日志不显示**
   - 检查控制台设置
   - 确认日志级别配置
   - 验证环境变量

2. **性能数据不准确**
   - 检查系统时间同步
   - 验证计时逻辑
   - 确认时区设置

3. **日志过多**
   - 调整日志级别
   - 过滤非关键日志
   - 使用日志采样

## 📚 相关文档

- [Google Gemini API 文档](https://ai.google.dev/docs)
- [Supabase 日志文档](https://supabase.com/docs/guides/logs)
- [Vercel 日志文档](https://vercel.com/docs/concepts/functions/serverless-functions/logs)

---

**最后更新**: 2024年12月
**版本**: 1.0
