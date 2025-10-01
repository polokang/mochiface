# Nano Banana API 配置指南

## 概述

MochiFace Gemini（又称 Nano Banana）生成图片

Gemini 可以通过对话方式生成和处理图片。你可以通过文字、图片或两者结合的方式向 Gemini 发出提示，从而以前所未有的控制力来创建、修改和迭代视觉内容：

Text-to-Image:：根据简单或复杂的文本描述生成高质量图片。
图片 + Text-to-Image（编辑）：提供图片，并使用文本提示添加、移除或修改元素、更改风格或调整色彩分级。
多图到图（合成和风格迁移）：使用多张输入图片合成新场景，或将一张图片的风格迁移到另一张图片上。
迭代优化：通过对话在多轮互动中逐步优化图片，进行细微调整，直到达到理想效果。
高保真文本渲染：准确生成包含清晰易读且位置合理的文本的图片，非常适合用于徽标、图表和海报。

## 配置步骤

### 1. 配置环境变量

在 `.env.local` 文件中添加以下配置：

```env
# Nano Banana API 配置
GOOGLE_API_KEY=AIzaSyD1tVA9hSSMXkDnJhNqsrScWMe8JFM4RbU
```

### 3. 重启应用

配置完成后，重启 Next.js 开发服务器：

```bash
npm run dev
```
## 代码演示

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

async function generateImage() {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
  
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash-exp",
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    }
  });
  
  const prompt = "Create a picture of a nano banana dish in a fancy restaurant with a Gemini theme";
  
  const result = await model.generateContent([
    {
      text: prompt
    }
  ]);
  
  const response = await result.response;
  const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
  
  if (imagePart?.inlineData) {
    const imageData = imagePart.inlineData.data;
    const buffer = Buffer.from(imageData, "base64");
    // 保存图片
    require('fs').writeFileSync("gemini-generated-image.png", buffer);
    console.log("Image saved as gemini-generated-image.png");
  }
}

generateImage();
```

## 模拟模式

如果没有配置 API，系统会：
- ⚠️ 显示警告信息
- 🖼️ 返回 1x1 像素的模拟图片
- 📝 在控制台记录 "使用模拟图片响应（Google Gemini API 未配置）"

## 故障排除

### 问题：API 调用失败
- 检查 `GOOGLE_API_KEY` 是否正确
- 检查 API 密钥是否有效
- 检查网络连接
- 确认 Gemini API 已启用

### 问题：图片生成质量差
- 调整 `temperature` 参数（当前为 0.7）
- 调整 `topK` 参数（当前为 40）
- 调整 `topP` 参数（当前为 0.95）
- 尝试不同的风格选项
- 优化提示词内容

### 问题：生成速度慢
- 使用 `gemini-2.0-flash-exp` 模型（更快）
- 减少 `maxOutputTokens` 参数
- 检查网络延迟

## 成本说明

Google Gemini API 是付费服务，请查看 [Google AI Studio 定价页面](https://aistudio.google.com/pricing) 了解详细费用。

## 支持的风格

当前支持以下图片风格：
- `anime` - 动漫风格
- `cartoon` - 卡通风格  
- `realistic` - 写实风格
- `oil_painting` - 油画风格
- `watercolor` - 水彩风格
- `sketch` - 素描风格
- `cyberpunk` - 赛博朋克风格
- `vintage` - 复古风格
- `fantasy` - 奇幻风格
- `minimalist` - 极简风格
