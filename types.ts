export interface Point {
  x: number;
  y: number;
}

export interface Product {
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
  silhouette?: Point[];
}

export type RoomDimensions = {
  length: number;
  width: number;
  height: number;
};

export type InputMode = 'upload' | 'live';

export type AppStep = 'SELECT_MODE' | 'PROVIDE_INPUT' | 'PROVIDE_PROMPT' | 'GENERATING' | 'SHOW_RESULT';

export interface AppState {
  step: AppStep;
  inputMode?: InputMode;
  prompt: string;
  originalImage: string | null;
  redesignedImage: string | null;
  products: Product[];
  isLoading: boolean;
  error: string | null;
  estimatedDimensions: RoomDimensions | null;
}