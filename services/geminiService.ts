import type { Product, RoomDimensions } from '../types.ts';

type GeminiResponse = {
  redesignedImage: string;
  products: Product[];
  estimatedDimensions: RoomDimensions;
};

export const redesignRoomAndFindProducts = async (
  imageBase64: string,
  mimeType: string,
  prompt: string,
): Promise<GeminiResponse> => {
  // Always use relative URL - works in both dev and production
  const apiUrl = '/api/redesign';

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      imageBase64,
      mimeType,
      prompt,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `API request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data;
};
