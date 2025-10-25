import React from 'react';

import './Loader.css';

interface LoaderProps {
  label?: string;
}

export const Loader: React.FC<LoaderProps> = ({ label = 'Loading…' }) => (
  <div className="loader" role="status" aria-live="polite">
    <span className="loader__spinner" aria-hidden />
    <span className="loader__text">{label}</span>
  </div>
);
