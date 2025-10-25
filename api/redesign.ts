import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/genai';

type Product = {
  name: string;
  description: string;
  url: string;
  store: string;
  price: string;
  boundingBox: {
    x_min: number;
    y_min: number;
    x_max: number;
    y_max: number;
  };
};

type RoomDimensions = {
  length: number;
  width: number;
  height: number;
};

type ResponseData = {
  redesignedImage: string;
  products: Product[];
  estimatedDimensions: RoomDimensions;
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageBase64, mimeType, prompt } = req.body;

    if (!imageBase64 || !mimeType || !prompt) {
      return res.status(400).json({ error: 'Missing required fields: imageBase64, mimeType, prompt' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
      console.error('GEMINI_API_KEY not configured properly');
      return res.status(500).json({
        error: 'API key not configured. Please set GEMINI_API_KEY in Vercel environment variables.'
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Step 1: Generate redesigned room image
    const redesignPrompt = `You are an interior design expert. Given this room image, redesign it according to this style: "${prompt}".

Generate a photorealistic image of the redesigned room that matches the user's vision. Make it beautiful and professional.`;

    const redesignResult = await model.generateContent([
      redesignPrompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType: mimeType,
        },
      },
    ]);

    // Get the generated image
    let redesignedImageBase64 = '';
    const response = await redesignResult.response;
    const candidates = response.candidates;

    if (candidates && candidates[0]?.content?.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData) {
          redesignedImageBase64 = part.inlineData.data;
          break;
        }
      }
    }

    if (!redesignedImageBase64) {
      throw new Error('Failed to generate redesigned image');
    }

    const redesignedImageDataUrl = `data:image/png;base64,${redesignedImageBase64}`;

    // Step 2: Analyze the redesigned image for products and dimensions
    const analysisPrompt = `Analyze this redesigned room image and provide:
1. Estimated room dimensions (length, width, height in feet)
2. List of furniture/decor products visible in the room with their approximate positions

For each product, identify:
- Product name and type
- Brief description
- Approximate bounding box coordinates (normalized 0-1 range: x_min, y_min, x_max, y_max)
- Similar product search terms that could find this on shopping sites

Return ONLY a valid JSON object with this exact structure (no markdown, no code blocks):
{
  "dimensions": {
    "length": <number>,
    "width": <number>,
    "height": <number>
  },
  "products": [
    {
      "name": "<product name>",
      "description": "<description>",
      "searchTerms": "<search terms>",
      "boundingBox": {
        "x_min": <0-1>,
        "y_min": <0-1>,
        "x_max": <0-1>,
        "y_max": <0-1>
      }
    }
  ]
}`;

    const analysisResult = await model.generateContent([
      analysisPrompt,
      {
        inlineData: {
          data: redesignedImageBase64,
          mimeType: 'image/png',
        },
      },
    ]);

    const analysisText = analysisResult.response.text();

    // Clean up the response - remove markdown code blocks if present
    let cleanedAnalysis = analysisText.trim();
    if (cleanedAnalysis.startsWith('```json')) {
      cleanedAnalysis = cleanedAnalysis.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (cleanedAnalysis.startsWith('```')) {
      cleanedAnalysis = cleanedAnalysis.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    const analysis = JSON.parse(cleanedAnalysis);

    // Step 3: For each product, generate shopping URLs
    // In a real implementation, you might want to integrate with shopping APIs
    // For now, we'll generate search URLs for popular retailers
    const products: Product[] = analysis.products.map((p: any) => {
      const searchQuery = encodeURIComponent(p.searchTerms || p.name);
      // Generate a search URL - you can customize this to your preferred retailer
      const url = `https://www.wayfair.com/keyword.php?keyword=${searchQuery}`;

      return {
        name: p.name,
        description: p.description,
        url: url,
        store: 'Wayfair',
        price: 'See website',
        boundingBox: p.boundingBox,
      };
    });

    const responseData: ResponseData = {
      redesignedImage: redesignedImageDataUrl,
      products: products,
      estimatedDimensions: analysis.dimensions,
    };

    return res.status(200).json(responseData);

  } catch (error) {
    console.error('Error in redesign handler:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({
      error: 'Failed to process redesign request',
      details: errorMessage
    });
  }
}
