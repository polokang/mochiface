# 样式配置指南

## 📋 概述

本文档说明如何配置和管理 MochiFace 的图片生成样式。通过修改配置文件，您可以轻松添加、删除或修改样式。

## 🔧 配置文件位置

样式配置位于：`lib/image-gen/index.ts`

## 📝 样式配置结构

每个样式包含以下字段：

```typescript
interface ImageStyle {
  id: string;           // 唯一标识符
  name: string;         // 显示名称
  description: string;  // 样式描述
  prompt: string;       // AI 生成提示词
  thumbnail: string;    // 缩略图路径
  preview?: string;     // 预览图路径（可选）
}
```

## 🎨 添加新样式

### 1. 准备缩略图

将缩略图文件放置在 `public/images/` 目录下：

```
public/images/
├── cute_cartoon.png
├── anime.png
├── watercolor.png
├── retro_pop.png
├── flat.png
├── 3d_cute.png
├── graffiti.png
├── steampunk.png
├── papercut.png
└── your_new_style.png  ← 新样式缩略图
```

**缩略图要求：**
- 格式：PNG 或 JPG
- 尺寸：建议 120x120 像素
- 文件大小：建议小于 50KB
- 内容：展示该样式的典型效果

### 2. 更新配置文件

在 `lib/image-gen/index.ts` 的 `IMAGE_STYLES` 数组中添加新样式：

```typescript
export const IMAGE_STYLES: ImageStyle[] = [
  // ... 现有样式 ...
  {
    id: 'your_new_style',
    name: 'Your New Style',
    description: 'Description of your new style',
    prompt: 'Detailed prompt for AI generation',
    thumbnail: '/images/your_new_style.png'
  }
];
```

### 3. 配置字段说明

#### `id` (必需)
- 唯一标识符
- 只能包含字母、数字和下划线
- 用于内部引用和 API 调用

#### `name` (必需)
- 用户界面显示的名称
- 支持多语言
- 建议简洁明了

#### `description` (必需)
- 样式的简短描述
- 帮助用户理解样式特点
- 显示在选择列表中

#### `prompt` (必需)
- AI 生成图片的详细提示词
- 描述期望的视觉效果
- 影响最终生成质量

**提示词编写建议：**
- 使用具体的视觉描述
- 包含颜色、风格、质感等细节
- 避免过于抽象的描述
- 测试并优化效果

#### `thumbnail` (必需)
- 缩略图文件路径
- 相对于 `public` 目录的路径
- 用于样式选择界面

## 🗑️ 删除样式

### 1. 从配置中移除

在 `IMAGE_STYLES` 数组中删除对应的样式对象。

### 2. 删除缩略图文件

从 `public/images/` 目录中删除对应的缩略图文件。

### 3. 清理相关代码

检查是否有其他地方引用了该样式的 ID，并进行相应清理。

## ✏️ 修改现有样式

### 1. 更新配置

修改 `IMAGE_STYLES` 数组中对应样式的字段值。

### 2. 更新缩略图

如果需要，替换 `public/images/` 目录中的缩略图文件。

### 3. 测试效果

重新启动应用并测试修改后的样式效果。

## 🎯 样式配置示例

### 示例 1：添加水彩画风格

```typescript
{
  id: 'watercolor_art',
  name: '水彩艺术',
  description: '柔和的水彩画效果，带有流动感',
  prompt: 'Transform this image into a beautiful watercolor painting with soft, flowing brushstrokes, translucent colors, and artistic texture. The result should have a dreamy, ethereal quality with gentle color blending.',
  thumbnail: '/images/watercolor_art.png'
}
```

### 示例 2：添加赛博朋克风格

```typescript
{
  id: 'cyberpunk_neon',
  name: '赛博朋克霓虹',
  description: '未来主义霓虹灯效果',
  prompt: 'Convert this image to cyberpunk style with neon colors, futuristic elements, high-tech aesthetics, glowing effects, and urban night atmosphere. Include electric blue, hot pink, and bright green color schemes.',
  thumbnail: '/images/cyberpunk_neon.png'
}
```

## 🔍 测试和调试

### 1. 本地测试

```bash
npm run dev
```

访问 `http://localhost:3000/upload` 测试新样式。

### 2. 检查缩略图

确保缩略图正确显示：
- 文件路径正确
- 图片格式支持
- 文件大小合理

### 3. 测试生成效果

上传测试图片，选择新样式，检查生成结果。

## 📋 最佳实践

### 1. 命名规范

- `id`: 使用小写字母和下划线
- `name`: 使用简洁的描述性名称
- 文件名: 与 `id` 保持一致

### 2. 提示词优化

- 使用具体的视觉描述
- 包含关键特征和颜色
- 测试并迭代优化

### 3. 缩略图设计

- 使用代表性的示例图片
- 保持一致的视觉风格
- 确保在小尺寸下清晰可见

### 4. 性能考虑

- 缩略图文件大小控制在 50KB 以内
- 使用适当的图片格式（PNG 用于透明背景，JPG 用于照片）
- 考虑使用 WebP 格式优化加载速度

## 🚀 部署更新

### 1. 提交更改

```bash
git add .
git commit -m "Add new image style: [style_name]"
git push
```

### 2. 部署到生产环境

确保生产环境包含：
- 更新的配置文件
- 新的缩略图文件
- 所有相关更改

## 📞 故障排除

### 常见问题

1. **缩略图不显示**
   - 检查文件路径是否正确
   - 确认文件存在于 `public/images/` 目录
   - 检查文件格式是否支持

2. **样式不生效**
   - 确认 `id` 唯一且正确
   - 检查配置文件语法
   - 重启开发服务器

3. **生成效果不理想**
   - 优化提示词描述
   - 测试不同的参数组合
   - 参考现有样式的成功案例

---

**最后更新**: 2024年12月
**版本**: 1.0
