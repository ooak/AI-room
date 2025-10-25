import type { Product, RoomDimensions } from '../types.ts';

type GeminiResponse = {
  redesignedImage: string;
  products: Product[];
  estimatedDimensions: RoomDimensions;
};

const mockProducts: Product[] = [
  {
    name: 'Walnut Mid-Century Sofa',
    description: 'Low-profile three-seater sofa with solid walnut frame and neutral linen upholstery.',
    url: 'https://example.com/products/walnut-sofa',
    store: 'Design Depot',
    price: '$1,299',
    boundingBox: { x_min: 0.1, y_min: 0.55, x_max: 0.55, y_max: 0.95 },
  },
  {
    name: 'Sculptural Arc Floor Lamp',
    description: 'Statement lighting with a marble base and brushed brass arm to brighten cozy corners.',
    url: 'https://example.com/products/arc-lamp',
    store: 'Lumen & Co.',
    price: '$349',
    boundingBox: { x_min: 0.65, y_min: 0.2, x_max: 0.88, y_max: 0.75 },
  },
];

const mockDimensions: RoomDimensions = {
  length: 18,
  width: 14,
  height: 10,
};

export const redesignRoomAndFindProducts = async (
  _imageBase64: string,
  _mimeType: string,
  _prompt: string,
): Promise<GeminiResponse> => {
  await new Promise(resolve => setTimeout(resolve, 1200));

  return {
    redesignedImage: 'https://images.unsplash.com/photo-1505693515633-2ead9939d89c?auto=format&fit=crop&w=1200&q=80',
    products: mockProducts,
    estimatedDimensions: mockDimensions,
  };
};
