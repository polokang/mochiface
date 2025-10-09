# Google API 调试日志指南

## 🔍 问题分析

根据Vercel日志，图片生成任务启动后没有看到Google API调用的日志，需要添加更详细的调试信息来跟踪整个流程。

## 📊 添加的详细日志

### 1. **NanoBanana服务初始化日志**
```
🔧 [NanoBanana] 初始化Google Gemini API客户端...
🔑 [NanoBanana] API密钥检查: 存在 (长度: XX)
✅ [NanoBanana] Google Gemini API客户端初始化成功
```

### 2. **图片生成流程开始日志**
```
🚀 [用户ID] 开始图片生成流程
📝 [用户ID] 输入参数: { sourceImageUrl, style, userId }
🔍 [用户ID] 检查图片缓存...
❌ [用户ID] 缓存未命中，开始生成
```

### 3. **Google API配置验证日志**
```
🔧 [用户ID] 验证Google API配置...
🔧 [用户ID] 配置验证结果: 有效/无效
⚠️ [用户ID] Google API配置无效，返回模拟图片
```

### 4. **图片下载详细日志**
```
📥 [用户ID] 开始下载源图片: URL
📥 [图片下载] 开始下载图片: URL
📥 [图片下载] 最大重试次数: 5, 基础超时: 5000ms
📥 [下载尝试 1/5] 超时时间: 5000ms
📥 [下载尝试 1/5] 开始fetch请求...
📥 [下载尝试 1/5] fetch完成，耗时: XXXms
📥 [下载尝试 1/5] 响应状态: 200 OK
📥 [下载尝试 1/5] 响应头: Content-Type: image/jpeg, Content-Length: XXX
📥 [下载尝试 1/5] 开始读取响应数据...
📥 [下载尝试 1/5] 数据读取完成，耗时: XXXms
✅ [下载成功] 大小: XXKB
✅ [图片下载] 下载完成，总耗时: XXXms
```

### 5. **Base64转换日志**
```
🔄 [用户ID] 开始Base64转换，图片大小: XXX 字节
✅ [用户ID] Base64转换完成，耗时: XXXms，Base64长度: XXX 字符
📄 [用户ID] 检测到MIME类型: image/jpeg
```

### 6. **提示词构建日志**
```
📝 [用户ID] 构建提示词...
📝 [用户ID] 提示词构建完成: [前200字符]...
```

### 7. **Google API调用详细日志**
```
🤖 [用户ID] 开始初始化Gemini模型: gemini-2.5-flash-image
✅ [用户ID] Gemini模型初始化完成
🚀 [用户ID] 开始调用Google API生成图片...
📝 [用户ID] 使用的提示词: [前100字符]...
🖼️ [用户ID] 图片数据大小: XXX 字符
📄 [用户ID] 图片MIME类型: image/jpeg
🔄 [重试机制] 最大重试次数: 1, 基础延迟: 500ms
🚀 [API调用] 第 1 次尝试调用...
🔄 [用户ID] 执行generateContent调用...
📤 [用户ID] 发送到Google API的请求数据:
📤 [用户ID] - 文本部分长度: XXX 字符
📤 [用户ID] - 图片数据长度: XXX 字符
📤 [用户ID] - 图片MIME类型: image/jpeg
📤 [用户ID] - 模型配置: { model, temperature, topK, topP, maxOutputTokens }
✅ [用户ID] generateContent调用成功
✅ [首次成功] API调用成功
🤖 [用户ID] Google API调用完成，耗时: XXXms
```

### 8. **响应处理日志**
```
📊 [用户ID] 收到Google API响应
📋 [用户ID] 响应候选数量: X
📝 [用户ID] 文本响应部分数量: X
🖼️ [用户ID] 图片响应部分: 存在/不存在
✅ [用户ID] 主模型成功生成图片，大小: XXX 字节
```

## 🔍 关键监控点

### **如果看到以下日志，说明流程正常：**
1. `🔧 [NanoBanana] Google Gemini API客户端初始化成功`
2. `🔧 [用户ID] 配置验证结果: 有效`
3. `✅ [用户ID] 图片下载完成`
4. `✅ [用户ID] Base64转换完成`
5. `✅ [用户ID] Gemini模型初始化完成`
6. `📤 [用户ID] 发送到Google API的请求数据`
7. `✅ [用户ID] generateContent调用成功`

### **如果卡在某个步骤，可能的原因：**
1. **卡在初始化**: API密钥问题
2. **卡在配置验证**: genAI对象为null
3. **卡在图片下载**: 网络超时或URL问题
4. **卡在Base64转换**: 图片数据问题
5. **卡在模型初始化**: Google API配置问题
6. **卡在API调用**: 网络或API限制问题

## 📋 调试步骤

1. **检查API密钥**: 查看 `🔑 [NanoBanana] API密钥检查` 日志
2. **检查配置验证**: 查看 `🔧 [用户ID] 配置验证结果` 日志
3. **检查图片下载**: 查看 `📥 [图片下载]` 相关日志
4. **检查API调用**: 查看 `📤 [用户ID] 发送到Google API` 日志
5. **检查响应**: 查看 `📊 [用户ID] 收到Google API响应` 日志

## 🎯 预期效果

现在您可以在Vercel日志中看到完整的图片生成流程，包括：
- Google API客户端的初始化状态
- 图片下载的详细过程
- Base64转换的进度
- Google API调用的完整请求信息
- 响应处理的详细步骤

这样就能快速定位问题出现在哪个环节！🎉
