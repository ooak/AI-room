import React from 'react';
import type { Product, RoomDimensions } from '../types.ts';

import './ResultDisplay.css';

interface ResultDisplayProps {
  originalImage: string;
  redesignedImage: string;
  products: Product[];
  estimatedDimensions: RoomDimensions | null;
  onStartOver: () => void;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({
  originalImage,
  redesignedImage,
  products,
  estimatedDimensions,
  onStartOver,
}) => (
  <div className="result">
    <h2 className="section-title">Your redesigned space is ready</h2>
    <p className="result__subtitle">
      Explore the makeover and discover curated products that match the new aesthetic.
    </p>
    <div className="result__images">
      <figure className="result__image-card">
        <div className="result__image-wrapper">
          <img src={originalImage} alt="Original room" />
          <figcaption>Original photo</figcaption>
          <div className="result__overlay" aria-hidden>
            {products.map((product, index) => {
              const width = (product.boundingBox.x_max - product.boundingBox.x_min) * 100;
              const height = (product.boundingBox.y_max - product.boundingBox.y_min) * 100;
              const left = product.boundingBox.x_min * 100;
              const top = product.boundingBox.y_min * 100;
              return (
                <span
                  key={product.name}
                  className="result__tag"
                  style={{ width: `${width}%`, height: `${height}%`, left: `${left}%`, top: `${top}%` }}
                >
                  {index + 1}
                </span>
              );
            })}
          </div>
        </div>
      </figure>
      <figure className="result__image-card">
        <div className="result__image-wrapper">
          <img src={redesignedImage} alt="Redesigned room" />
          <figcaption>AI crafted makeover</figcaption>
        </div>
      </figure>
    </div>

    <section className="result__details" aria-label="Recommended products">
      <h3>Shopping list</h3>
      <ul className="result__products">
        {products.map((product, index) => (
          <li key={product.name} className="result__product">
            <span className="result__product-index">{index + 1}</span>
            <div className="result__product-body">
              <h4>{product.name}</h4>
              <p>{product.description}</p>
              <div className="result__product-meta">
                <span>{product.store}</span>
                <span>{product.price}</span>
              </div>
              <a className="result__product-link" href={product.url} target="_blank" rel="noreferrer">
                View product
              </a>
            </div>
          </li>
        ))}
      </ul>
    </section>

    {estimatedDimensions && (
      <section className="result__dimensions" aria-label="Estimated room dimensions">
        <h3>Estimated room size</h3>
        <dl>
          <div>
            <dt>Length</dt>
            <dd>{estimatedDimensions.length.toFixed(1)} m</dd>
          </div>
          <div>
            <dt>Width</dt>
            <dd>{estimatedDimensions.width.toFixed(1)} m</dd>
          </div>
          <div>
            <dt>Height</dt>
            <dd>{estimatedDimensions.height.toFixed(1)} m</dd>
          </div>
        </dl>
      </section>
    )}

    <button type="button" className="secondary-button" onClick={onStartOver}>
      Start over
    </button>
  </div>
);
