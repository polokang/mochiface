/**
 * 图片生成服务接口
 * 定义图片生成服务的标准接口
 */
export interface ImageGenService {
  generate(input: {
    sourceImageUrl: string;
    style: string;
    userId: string;
  }): Promise<{ resultImageBuffer: Buffer }>;
}

/**
 * 图片样式配置接口
 * 定义每个图片生成样式的配置信息
 */
export interface ImageStyle {
  /** 样式唯一标识符 */
  id: string;
  /** 样式显示名称 */
  name: string;
  /** 样式描述 */
  description: string;
  /** AI 生成提示词 */
  prompt: string;
  /** 缩略图路径 */
  thumbnail: string;
  /** 预览图路径（可选） */
  preview?: string;
}

/**
 * 图片样式配置列表
 * 包含所有可用的图片生成样式
 */
export const IMAGE_STYLES: ImageStyle[] = [
  // 专业摄影风格
  {
    id: 'pro-headshot-4x5',
    name: 'Professional Headshot',
    description: 'Corporate portrait: neutral background, soft studio lighting, business attire',
    prompt: `Create a polished corporate headshot from the uploaded portrait.
  
  [Framing & Pose]
  - Head-and-shoulders (or chest-up) composition, 4:5 aspect feel
  - Face centered; eye line ≈ 55% of image height
  - Gentle, confident expression with a natural smile; eyes looking at camera
  - Allow slight body angle (≤ 15°), but keep face mostly frontal
  
  [Background & Lighting]
  - Clean, neutral studio background (light gray #F2F2F2 preferred; subtle soft gradient OK)
  - Soft, even lighting (key + fill); avoid harsh shadows and color casts
  - No distracting elements; smooth, professional backdrop
  
  [Appearance & Wardrobe]
  - Preserve the person’s real identity and facial features (no face reshaping)
  - Subtle grooming: tame flyaway hair, reduce glare/oil, keep skin texture natural
  - Light retouching only: remove temporary blemishes; mild eye/teeth cleanup (realistic)
  - Business attire: plain blazer/suit jacket and simple shirt/blouse; no logos/patterns
  - Colors should be professional (navy, charcoal, black, white, light blue)
  - Glasses allowed if clear lenses with minimal reflections; pupils visible
  - No hats/headphones/masks; no heavy filters or “beauty” effects
  
  [Output]
  - Deliver a clean, studio-style headshot suitable for LinkedIn/Resume/Company profile
  - Solid/soft-gradient neutral background; crisp edges; PNG, sRGB
  - Aim for a 4:5 crop (suggest 1200×1500 px) with ~7–10% headroom above the head`,
    thumbnail: '/pro-headshot.png'
  },

  // 证件照风格
  {
    id: 'idphoto-us-600',
    name: 'US Visa/Passport ID Photo',
    description: '600×600 px, solid white background, frontal face, neutral expression, no glasses',
    prompt: `Generate a compliant U.S. ID/visa/passport-style photo from the uploaded portrait:
  
  [Target Specs]
  - Canvas: exactly 600×600 pixels (1:1)
  - Background: pure white (#FFFFFF), uniform, no gradient or texture
  - File: PNG, sRGB, clean edges, no watermark/text
  
  [Framing & Pose]
  - Frontal face, no tilt or yaw; eyes looking straight at camera
  - Neutral expression, closed mouth
  - Head height (crown to chin) ≈ 50–69% of image height (target ~57%)
  - Eye line around 55% of image height
  - Include head and upper shoulders; center the face precisely
  
  [Appearance Rules]
  - No glasses (remove if present), no sunglasses or colored lenses
  - No hats/headgear/headphones/masks unless religious per spec (omit by default)
  - Hair must not cover eyes/eyebrows; reduce flyaways
  - Clothing clean and neutral; avoid same color as background
  
  [Image Processing]
  - Preserve identity and facial features (no face reshaping/beauty filters)
  - Even lighting, natural skin tone; remove harsh shadows and glare
  - Denoise/deband gently; no pixelation or distortion
  - Cut out and composite cleanly onto pure white; crisp, anti-aliased edges
  
  [Output]
  - Deliver only the final 600×600 image, perfectly centered and cropped, solid white background`,
    thumbnail: '/idphoto-us-600.png'
  },

  // 卡通风格
  {
    id: 'kawaii-manga-from-photo',
    name: 'Cute Manga (Identity Preserved)',
    description: 'Cartoon/manga photo style; preserve facial identity, slightly enlarge eyes; rectangular image',
    prompt: `Convert the uploaded portrait into a cute manga/cartoon **photo** while strictly preserving the person's identity.
  
  [Identity — MUST KEEP]
  - Keep the same facial structure, proportions, skin tone, eye shape/color, hairstyle and parting.
  - No face reshaping or slimming; no change to nose, lips, jawline or hair length/color.
  - Light retouching only (reduce glare/oil, minor blemishes), keep natural texture.
  
  [Stylistic Goals]
  - Kawaii/semi-realistic manga look with **slightly enlarged eyes (~10–15%)**—big and expressive but still recognizably the same person.
  - Clean, consistent outlines; smooth pastel shading; subtle highlights on hair and eyes.
  - Soft, warm mood.
  
  [Appearance Cues from Source Image]
  - Long, wavy **dark-brown hair**, side part, soft strands; add gentle hair gloss, keep natural flow.
  - **Brown eyes** with delicate lashes and small catchlights; natural peachy lips; light blush.
  - Simple dark top; **remove any logos/text**.
  
  [Framing & Background]
  - **Rectangular photo**, head-and-shoulders (or chest-up), subject centered; eye line ≈ 55% image height.
  - Background: soft **warm beige/taupe** studio backdrop; uniform, no patterns/props.
  - No badges, stickers, frames, borders, or drop shadows.
  
  [Rendering Rules]
  - Fully stylized cartoon finish (no photo textures), crisp anti-aliased edges, no banding/noise.
  - Balanced contrast; even lighting; avoid harsh shadows or color casts.
  
  [Output]
  - Deliver a rectangular PNG (suggest 1440×1920 or 1080×1350), sRGB.
  - Clean background, no watermark or text; subject centered with comfortable padding.`,
    thumbnail: '/kawaii-manga-from-photo.png'
  },

  // 蒸汽朋克风格
  {
    id: 'cyberpunk-portrait',
    name: 'Cyberpunk Portrait (Identity Preserved)',
    description: 'Neon-drenched cyberpunk photo style; preserve original facial identity',
    prompt: `Transform the uploaded portrait into a **cyberpunk**-style rectangular photo while strictly preserving the person's facial identity.
  
  [Identity — MUST KEEP]
  - Keep the same facial structure and proportions (eyes/nose/lips/jawline), skin tone, eye color, hairstyle/length/parting.
  - No face reshaping/slimming/beauty filters; allow only light cleanup (reduce glare/oil, minor blemishes).
  
  [Style & Mood]
  - Neo-Tokyo/Blade-Runner vibe: neon magenta/cyan/blue palette, rainy-night ambience, holographic glow.
  - Semi-realistic stylization (not comic outlines). Subtle filmic grain is OK; no heavy noise.
  
  [Lighting]
  - Cinematic **neon rim lighting**: cyan on one side, magenta/pink on the other; soft key to keep skin natural.
  - Preserve natural skin texture; avoid over-saturation and blown highlights.
  
  [Background & Set Dressing]
  - Futuristic city bokeh, holographic signs, scanlines, floating UI glyphs near the frame edges.
  - Optional wet-street reflections or soft neon haze.
  - Keep background **out of focus** so the face remains the focal point.
  
  [Wardrobe & Props]
  - Techwear vibe (dark jacket, minimal trim, subtle reflective details). No helmets/masks that cover the face.
  - Glasses allowed only if from source; if present, use clear lenses with minimal reflection.
  - Optional subtle cyber augmentations (micro-LEDs, fine cheek/temple circuitry) but **do not obscure or alter facial geometry**.
  
  [Composition]
  - Head-and-shoulders (or chest-up), subject centered; eye line ≈ 55% of image height.
  - Rectangular **photo** (not a circular badge/sticker); comfortable padding around the head.
  
  [Rendering Rules]
  - Preserve identity; keep hair dark-brown and wavy as in source.
  - Clean edges, no posterization/banding; sRGB color; balanced contrast.
  
  [Output]
  - Deliver a rectangular PNG (suggest 1440×1920 or 1080×1350), sRGB.
  - No text, watermark, frames, or borders.`,
    thumbnail: '/cyberpunk-portrait.png'
  },

  // 护照风格
  {
    id: 'passport-photo',
    name: 'Passport photo',
    description: 'Passport photo style',
    prompt: `截取图片人像头部，帮我做成2寸证件照，要求:
  1、蓝底
  2、职业正装
  3、正脸
  4、微笑`,
    thumbnail: '/passport.png'
  },
];

/**
 * 根据样式 ID 获取样式配置
 * @param styleId 样式 ID
 * @returns 样式配置对象，如果未找到则返回 undefined
 */
export function getImageStyle(styleId: string): ImageStyle | undefined {
  return IMAGE_STYLES.find(style => style.id === styleId);
}

/**
 * 获取缩略图 URL，处理生产环境的路径问题
 * @param thumbnailPath 缩略图路径
 * @returns 处理后的缩略图 URL
 */
export function getThumbnailUrl(thumbnailPath: string): string {
  // 如果是生产环境且路径以 / 开头，确保正确的前缀
  if (process.env.NODE_ENV === 'production' && thumbnailPath.startsWith('/')) {
    return thumbnailPath;
  }
  return thumbnailPath;
}

/**
 * 获取所有可用的样式 ID 列表
 * @returns 样式 ID 数组
 */
export function getAllStyleIds(): string[] {
  return IMAGE_STYLES.map(style => style.id);
}

/**
 * 检查样式 ID 是否存在
 * @param styleId 样式 ID
 * @returns 是否存在
 */
export function isValidStyleId(styleId: string): boolean {
  return IMAGE_STYLES.some(style => style.id === styleId);
}
