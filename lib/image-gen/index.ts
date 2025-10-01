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
    name: 'Cute Cartoon',
    description: 'Convert avatar to cute cartoon style'
  },
  {
    id: 'anime',
    name: 'Anime Style',
    description: 'Japanese anime style avatar'
  },
  {
    id: 'watercolor',
    name: 'Watercolor',
    description: 'Watercolor painting style artistic effect'
  },
  {
    id: 'retro_pop',
    name: 'Retro Pop',
    description: '80s retro pop art style'
  },
  {
    id: 'flat',
    name: 'Flat Design',
    description: 'Modern flat design style'
  },
  {
    id: '3d_cute',
    name: '3D Cute',
    description: 'Cute 3D style with depth'
  },
  {
    id: 'graffiti',
    name: 'Graffiti Style',
    description: 'Street graffiti art style'
  },
  {
    id: 'steampunk',
    name: 'Steampunk',
    description: 'Steampunk sci-fi style'
  },
  {
    id: 'papercut',
    name: 'Paper Cut Art',
    description: 'Traditional paper cut art style'
  }
];
