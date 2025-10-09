# Vercel 部署性能优化指南

## 🚀 问题分析

在Vercel上Google API调用慢的主要原因：

### 1. **Vercel Serverless限制**
- **执行时间**: Hobby计划10秒，Pro计划60秒
- **冷启动**: 函数首次调用需要初始化时间
- **内存限制**: 可能影响图片处理性能
- **网络延迟**: 服务器到Google API的地理距离

### 2. **资源竞争**
- 共享服务器资源
- 并发请求限制
- 网络带宽限制

## 🔧 优化措施

### 1. **Vercel配置优化**

#### vercel.json 配置
```json
{
  "functions": {
    "app/api/image/generate/route.ts": {
      "maxDuration": 60
    },
    "app/api/upload-image/route.ts": {
      "maxDuration": 30
    }
  }
}
```

#### 环境变量配置
```bash
# Vercel环境变量
VERCEL=true
IMAGE_GEN_API_TIMEOUT=20000
IMAGE_GEN_MAX_RETRIES=1
IMAGE_GEN_MAX_IMAGE_SIZE=3145728
SLOW_REQUEST_THRESHOLD=3000
```

### 2. **API调用优化**

#### 超时时间调整
- **本地环境**: 30秒超时
- **Vercel环境**: 20秒超时
- **图片下载**: 15秒超时

#### 重试策略优化
- **本地环境**: 最多重试2次，1秒延迟
- **Vercel环境**: 最多重试1次，0.5秒延迟

#### 图片大小限制
- **本地环境**: 5MB限制
- **Vercel环境**: 3MB限制

### 3. **缓存策略**

#### 内存缓存
- **本地环境**: 100MB缓存
- **Vercel环境**: 50MB缓存
- **缓存时间**: 24小时

#### 缓存键优化
```typescript
// 使用更精确的缓存键
const cacheKey = `${style}:${imageHash}:${userId}`
```

## 📊 性能监控

### 关键指标
- **API调用时间**: 目标 < 10秒
- **图片下载时间**: 目标 < 2秒
- **Base64转换时间**: 目标 < 1秒
- **总处理时间**: 目标 < 15秒

### 日志监控
```typescript
console.log(`🚀 [${userId}] 开始调用 Google API 生成图片，样式: ${style}`)
console.log(`📥 [${userId}] 图片下载完成，耗时: ${downloadTime}ms`)
console.log(`🤖 [${userId}] Google API调用完成，耗时: ${apiTime}ms`)
console.log(`✅ [${userId}] 图片生成完成，总耗时: ${totalTime}ms`)
```

## 🎯 部署建议

### 1. **Vercel计划选择**
- **Hobby计划**: 10秒限制，适合测试
- **Pro计划**: 60秒限制，适合生产
- **Enterprise计划**: 无限制，适合高负载

### 2. **环境变量设置**
1. 在Vercel项目设置中添加环境变量
2. 使用 `env.vercel.example` 作为参考
3. 确保所有必要的API密钥已配置

### 3. **监控和调试**
1. 查看Vercel函数日志
2. 监控API调用时间
3. 检查错误率和成功率

## 🔍 故障排除

### 常见问题

#### 1. **超时错误**
```
Error: Function execution timed out
```
**解决方案**: 增加 `maxDuration` 或优化API调用

#### 2. **内存不足**
```
Error: Function exceeded memory limit
```
**解决方案**: 减少图片大小或优化内存使用

#### 3. **网络错误**
```
Error: fetch failed
```
**解决方案**: 检查网络连接和API密钥

### 调试步骤

1. **检查Vercel日志**
   ```bash
   vercel logs --follow
   ```

2. **本地测试**
   ```bash
   npm run dev
   ```

3. **性能分析**
   - 使用Chrome DevTools
   - 检查Network面板
   - 分析API调用时间

## 📈 进一步优化

### 1. **CDN优化**
- 使用Vercel Edge Functions
- 配置CDN缓存策略
- 优化静态资源加载

### 2. **数据库优化**
- 使用连接池
- 优化查询性能
- 添加数据库索引

### 3. **缓存优化**
- 实现Redis缓存
- 使用Vercel KV存储
- 优化缓存策略

## 🚀 快速部署

1. **更新代码**
   ```bash
   git add .
   git commit -m "Optimize for Vercel deployment"
   git push
   ```

2. **设置环境变量**
   - 在Vercel项目设置中添加环境变量
   - 参考 `env.vercel.example`

3. **部署**
   ```bash
   vercel --prod
   ```

4. **监控**
   - 查看Vercel仪表板
   - 监控函数性能
   - 检查错误日志

通过以上优化措施，您的Google API调用在Vercel上的性能应该会有显著提升！🎯
