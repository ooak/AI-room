import type { Product, RoomDimensions } from '../types.ts';

interface RedesignResponse {
  redesignedImage: string;
  products: Product[];
  estimatedDimensions: RoomDimensions;
}

const SAMPLE_PRODUCTS: Product[] = [
  {
    name: 'Oaken Horizon Sofa',
    description: 'Low-profile three-seater with plush performance fabric and warm oak legs.',
    url: 'https://example.com/products/oaken-horizon-sofa',
    store: 'FurnishNow',
    price: '$1,499',
    boundingBox: { x_min: 0.1, y_min: 0.55, x_max: 0.58, y_max: 0.88 },
  },
  {
    name: 'Nebula Arc Floor Lamp',
    description: 'Brushed brass floor lamp with diffused dome shade for soft ambient lighting.',
    url: 'https://example.com/products/nebula-arc-lamp',
    store: 'GlowHaus',
    price: '$289',
    boundingBox: { x_min: 0.68, y_min: 0.25, x_max: 0.85, y_max: 0.78 },
  },
  {
    name: 'Stratus Wool Rug',
    description: 'Hand-loomed ivory rug with subtle geometric pattern for a cozy anchor.',
    url: 'https://example.com/products/stratus-wool-rug',
    store: 'Loom & Co.',
    price: '$599',
    boundingBox: { x_min: 0.18, y_min: 0.78, x_max: 0.85, y_max: 0.98 },
  },
];

const SAMPLE_DIMENSIONS: RoomDimensions = {
  length: 5.6,
  width: 4.3,
  height: 2.7,
};

const SAMPLE_REDESIGNED_IMAGE =
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80';

export async function redesignRoomAndFindProducts(
  imageBase64: string,
  mimeType: string,
  prompt: string
): Promise<RedesignResponse> {
  if (!imageBase64 || !prompt) {
    throw new Error('Missing image or prompt.');
  }

  console.info('Sending makeover request to Gemini mock service', {
    imageBytesLength: imageBase64.length,
    mimeType,
    prompt,
  });

  await new Promise(resolve => setTimeout(resolve, 1200));

  return {
    redesignedImage: SAMPLE_REDESIGNED_IMAGE,
    products: SAMPLE_PRODUCTS,
    estimatedDimensions: SAMPLE_DIMENSIONS,
  };
}
