import React from 'react';

import type { Product, RoomDimensions } from '../types.ts';

type ResultDisplayProps = {
  originalImage: string;
  redesignedImage: string;
  products: Product[];
  estimatedDimensions: RoomDimensions | null;
  onStartOver: () => void;
};

const ResultDisplay: React.FC<ResultDisplayProps> = ({
  originalImage,
  redesignedImage,
  products,
  estimatedDimensions,
  onStartOver,
}) => (
  <div className="w-full max-w-6xl mx-auto space-y-10">
    <section className="grid gap-6 lg:grid-cols-2">
      <figure className="bg-white rounded-xl shadow overflow-hidden">
        <img src={originalImage} alt="Original room" className="w-full object-cover" />
        <figcaption className="p-4 text-sm text-gray-600">Original room</figcaption>
      </figure>
      <figure className="bg-white rounded-xl shadow overflow-hidden">
        <img src={redesignedImage} alt="Redesigned room" className="w-full object-cover" />
        <figcaption className="p-4 text-sm text-gray-600">AI redesigned vision</figcaption>
      </figure>
    </section>

    {estimatedDimensions && (
      <section className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800">Estimated room dimensions</h2>
        <p className="mt-2 text-gray-600">
          Approx. {estimatedDimensions.length} ft (L) × {estimatedDimensions.width} ft (W) × {estimatedDimensions.height} ft (H)
        </p>
      </section>
    )}

    <section className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Suggested products</h2>
        <button
          type="button"
          onClick={onStartOver}
          className="text-indigo-600 font-semibold hover:underline"
        >
          Start over
        </button>
      </div>
      {products.length === 0 ? (
        <p className="mt-4 text-gray-600">No product suggestions were generated. Try refining your prompt.</p>
      ) : (
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {products.map(product => (
            <li key={product.url} className="border border-indigo-100 rounded-lg p-4">
              <h3 className="text-base font-semibold text-gray-800">{product.name}</h3>
              <p className="mt-1 text-sm text-gray-600">{product.description}</p>
              <p className="mt-2 text-sm text-gray-500">{product.store}</p>
              <p className="mt-1 text-indigo-600 font-medium">{product.price}</p>
              <a
                href={product.url}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:underline"
              >
                View product
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  </div>
);

export { ResultDisplay };
