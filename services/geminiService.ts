import { GoogleGenAI, Modality, Type } from '@google/genai';
import type { Schema } from '@google/genai';

import type { Product, RoomDimensions } from '../types.ts';

type GeminiProduct = {
  name?: unknown;
  description?: unknown;
  url?: unknown;
  store?: unknown;
  price?: unknown;
  boundingBox?: unknown;
  bounding_box?: unknown;
};

type GeminiDimensions = {
  length?: unknown;
  width?: unknown;
  height?: unknown;
};

type StructuredGeminiPayload = {
  imagePrompt?: unknown;
  narrative?: unknown;
  designSummary?: unknown;
  estimatedDimensions?: GeminiDimensions;
  dimensions?: GeminiDimensions;
  products?: GeminiProduct[];
  recommendedProducts?: GeminiProduct[];
};

const redesignSchema: Schema = {
  type: Type.OBJECT,
  required: ['imagePrompt', 'products'],
  properties: {
    imagePrompt: {
      type: Type.STRING,
      description: 'A concise but vivid prompt describing how to render the redesigned room.',
    },
    narrative: {
      type: Type.STRING,
      description: 'One or two sentences describing the refreshed concept to the homeowner.',
    },
    estimatedDimensions: {
      type: Type.OBJECT,
      nullable: true,
      properties: {
        length: { type: Type.NUMBER },
        width: { type: Type.NUMBER },
        height: { type: Type.NUMBER },
      },
      required: ['length', 'width', 'height'],
    },
    products: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        required: ['name', 'description', 'url', 'store', 'price'],
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          url: { type: Type.STRING },
          store: { type: Type.STRING },
          price: { type: Type.STRING },
          boundingBox: {
            type: Type.OBJECT,
            nullable: true,
            properties: {
              x_min: { type: Type.NUMBER },
              y_min: { type: Type.NUMBER },
              x_max: { type: Type.NUMBER },
              y_max: { type: Type.NUMBER },
            },
            required: ['x_min', 'y_min', 'x_max', 'y_max'],
          },
        },
      },
    },
  },
} as const;

const clamp01 = (value: number): number => {
  if (Number.isNaN(value)) {
    return 0;
  }
  return Math.min(Math.max(value, 0), 1);
};

const fallbackBoundingBox: Product['boundingBox'] = {
  x_min: 0,
  y_min: 0,
  x_max: 1,
  y_max: 1,
};

const normaliseBoundingBox = (input: unknown): Product['boundingBox'] | undefined => {
  if (!input || typeof input !== 'object') {
    return undefined;
  }

  const source = input as Record<string, unknown>;
  const toNumber = (key: string): number | undefined => {
    const variants = [
      key,
      key.replace(/_([a-z])/g, (_, char: string) => char.toUpperCase()),
      key.replace(/_/g, ''),
      key.replace(/_/g, '').toLowerCase(),
    ];

    for (const variant of variants) {
      if (variant in source) {
        const parsed = Number(source[variant]);
        if (Number.isFinite(parsed)) {
          return clamp01(parsed);
        }
      }
    }

    return undefined;
  };

  const xMin = toNumber('x_min');
  const yMin = toNumber('y_min');
  const xMax = toNumber('x_max');
  const yMax = toNumber('y_max');

  if ([xMin, yMin, xMax, yMax].every(value => typeof value === 'number')) {
    return {
      x_min: xMin!,
      y_min: yMin!,
      x_max: xMax!,
      y_max: yMax!,
    };
  }

  return undefined;
};

const coercePrice = (value: unknown): string => {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return `$${Math.round(value).toLocaleString()}`;
  }

  return 'See retailer for price';
};

const sanitiseProducts = (products: GeminiProduct[] | undefined): Product[] => {
  if (!Array.isArray(products)) {
    return [];
  }

  return products
    .map((item, index) => {
      const name = typeof item.name === 'string' ? item.name.trim() : '';
      const description = typeof item.description === 'string' ? item.description.trim() : '';
      const rawUrl = typeof item.url === 'string' ? item.url.trim() : '';
      const store = typeof item.store === 'string' ? item.store.trim() : '';
      const price = coercePrice(item.price);

      if (!name && !description && !rawUrl) {
        return undefined;
      }

      const boundingBoxSource = item.boundingBox ?? item.bounding_box;
      const boundingBox = normaliseBoundingBox(boundingBoxSource) ?? fallbackBoundingBox;

      const normalisedUrl = rawUrl && /^https?:\/\//i.test(rawUrl) ? rawUrl : '';

      if (!normalisedUrl) {
        return undefined;
      }

      return {
        name: name || `Design pick ${index + 1}`,
        description: description || 'Curated to complement the redesigned space.',
        url: normalisedUrl,
        store: store || 'Suggested retailer',
        price,
        boundingBox,
      } satisfies Product;
    })
    .filter((product): product is Product => Boolean(product && product.url));
};

const sanitiseDimensions = (value: GeminiDimensions | undefined): RoomDimensions | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const { length, width, height } = value;
  const numericLength = Number(length);
  const numericWidth = Number(width);
  const numericHeight = Number(height);

  if ([numericLength, numericWidth, numericHeight].every(dimension => Number.isFinite(dimension))) {
    return {
      length: Math.round(numericLength as number),
      width: Math.round(numericWidth as number),
      height: Math.round(numericHeight as number),
    };
  }

  return null;
};

const resolveApiKey = (): string => {
  const fromProcess = typeof process !== 'undefined'
    ? process.env?.GEMINI_API_KEY ?? process.env?.API_KEY ?? undefined
    : undefined;

  let fromVite: string | undefined;
  if (typeof import.meta !== 'undefined') {
    const metaEnv = (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};
    fromVite = metaEnv.VITE_GEMINI_API_KEY ?? metaEnv.GEMINI_API_KEY ?? metaEnv.VITE_API_KEY;
  }

  const apiKey = fromProcess ?? fromVite;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured. Add it to your environment or .env.local file.');
  }

  return apiKey;
};

let cachedClient: GoogleGenAI | null = null;

const getClient = (): GoogleGenAI => {
  if (!cachedClient) {
    cachedClient = new GoogleGenAI({ apiKey: resolveApiKey() });
  }

  return cachedClient;
};

const extractImageDataUri = (response: Awaited<ReturnType<GoogleGenAI['models']['generateContent']>>): string => {
  const candidate = response.candidates?.[0];
  const parts = candidate?.content?.parts ?? [];
  const imagePart = parts.find(part => part.inlineData?.data);

  if (!imagePart?.inlineData?.data) {
    throw new Error('The Gemini API did not return an image for the redesigned room.');
  }

  const mimeType = imagePart.inlineData.mimeType ?? 'image/png';
  return `data:${mimeType};base64,${imagePart.inlineData.data}`;
};

export const redesignRoomAndFindProducts = async (
  imageBase64: string,
  mimeType: string,
  prompt: string,
): Promise<{ redesignedImage: string; products: Product[]; estimatedDimensions: RoomDimensions | null; }> => {
  const client = getClient();

  const structuredResponse = await client.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: [
              'You are an expert interior designer working with a homeowner photo. Study the inline image to understand the room layout,',
              ' lighting, and current furnishings. Then craft a refreshed concept that honours the existing architecture while matching the request.',
              ' Respond with rich, shoppable detail.',
              '',
              'Return a JSON object that follows the provided response schema exactly. Each product must be a real, purchasable item from a reputable retailer.',
              ' Include deep links where possible. Normalise all bounding box coordinates between 0 and 1 relative to the redesigned image.',
              '',
              `Homeowner prompt: ${prompt}`,
            ].join(' '),
          },
          { inlineData: { data: imageBase64, mimeType } },
        ],
      },
    ],
    config: {
      temperature: 0.8,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json',
      responseSchema: redesignSchema,
    },
  });

  const rawPayloadText = structuredResponse.text;

  if (!rawPayloadText) {
    throw new Error('The Gemini API did not return design guidance.');
  }

  let parsed: StructuredGeminiPayload;
  try {
    parsed = JSON.parse(rawPayloadText) as StructuredGeminiPayload;
  } catch (error) {
    throw new Error('Unable to parse Gemini response. Please try refining the prompt.');
  }

  const imagePrompt = typeof parsed.imagePrompt === 'string' && parsed.imagePrompt.trim().length > 0
    ? parsed.imagePrompt.trim()
    : `High-resolution interior render that reimagines the supplied room based on this request: ${prompt}.`;

  const products = sanitiseProducts(parsed.products ?? parsed.recommendedProducts);
  const estimatedDimensions = sanitiseDimensions(parsed.estimatedDimensions ?? parsed.dimensions);

  const imageResponse = await client.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: [
      {
        role: 'user',
        parts: [
          { inlineData: { data: imageBase64, mimeType } },
          {
            text: [
              'Create a photorealistic makeover of this exact room from the same camera perspective. Use the homeowners prompt and the design brief to guide style, materials, and layout.',
              ' Avoid adding any text or watermark inside the render. Produce a single image only.',
              '',
              `Design brief: ${imagePrompt}`,
            ].join(' '),
          },
        ],
      },
    ],
    config: {
      temperature: 0.7,
      responseModalities: [Modality.IMAGE],
    },
  });

  const redesignedImage = extractImageDataUri(imageResponse);

  return {
    redesignedImage,
    products,
    estimatedDimensions,
  };
};

