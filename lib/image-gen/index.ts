export interface ImageGenService {
  generate(input: {
    sourceImageUrl: string;
    style: string;
    userId: string;
  }): Promise<{ resultImageBuffer: Buffer }>;
}

export interface ImageStyle {
  id: string;
  name: string;
  description: string;
  preview?: string;
}

export const IMAGE_STYLES: ImageStyle[] = [
  {
    id: 'cute_cartoon',
    name: '可爱卡通',
    description: '将头像转换为可爱的卡通风格'
  },
  {
    id: 'anime',
    name: '动漫风格',
    description: '日式动漫风格的头像'
  },
  {
    id: 'watercolor',
    name: '水彩画',
    description: '水彩画风格的艺术效果'
  },
  {
    id: 'retro_pop',
    name: '复古流行',
    description: '80年代复古流行艺术风格'
  },
  {
    id: 'flat',
    name: '扁平化',
    description: '现代扁平化设计风格'
  },
  {
    id: '3d_cute',
    name: '3D可爱',
    description: '立体可爱的3D风格'
  },
  {
    id: 'graffiti',
    name: '涂鸦风格',
    description: '街头涂鸦艺术风格'
  },
  {
    id: 'steampunk',
    name: '蒸汽朋克',
    description: '蒸汽朋克科幻风格'
  },
  {
    id: 'papercut',
    name: '剪纸艺术',
    description: '传统剪纸艺术风格'
  }
];
