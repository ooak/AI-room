import React from 'react';

import type { InputMode } from '../types.ts';
import { CameraIcon, UploadIcon } from './IconComponents.tsx';

type InputSelectorProps = {
  onSelect: (mode: InputMode) => void;
};

const InputSelector: React.FC<InputSelectorProps> = ({ onSelect }) => (
  <div className="w-full max-w-3xl mx-auto grid gap-6 md:grid-cols-2">
    <button
      type="button"
      onClick={() => onSelect('upload')}
      className="border border-indigo-200 rounded-xl p-6 bg-white shadow hover:border-indigo-400 transition"
    >
      <div className="flex items-center gap-3 text-indigo-600">
        <UploadIcon />
        <h2 className="text-xl font-semibold">Upload a Photo</h2>
      </div>
      <p className="mt-3 text-sm text-gray-600">
        Use an existing room photo to get instant makeover ideas.
      </p>
    </button>
    <button
      type="button"
      onClick={() => onSelect('live')}
      className="border border-indigo-200 rounded-xl p-6 bg-white shadow hover:border-indigo-400 transition"
    >
      <div className="flex items-center gap-3 text-indigo-600">
        <CameraIcon />
        <h2 className="text-xl font-semibold">Capture Live</h2>
      </div>
      <p className="mt-3 text-sm text-gray-600">
        Use your device camera to snap a picture of your space.
      </p>
    </button>
  </div>
);

export { InputSelector };
