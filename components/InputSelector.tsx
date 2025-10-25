import React from 'react';
import type { InputMode } from '../types.ts';
import { CameraIcon, UploadIcon } from './IconComponents.tsx';

import './InputSelector.css';

interface InputSelectorProps {
  onSelect: (mode: InputMode) => void;
}

export const InputSelector: React.FC<InputSelectorProps> = ({ onSelect }) => (
  <div className="selector">
    <h2 className="section-title">How would you like to start?</h2>
    <p className="selector__hint">
      Choose to upload an existing photo or capture one live with your camera.
    </p>
    <div className="selector__options">
      <button type="button" className="selector__option" onClick={() => onSelect('upload')}>
        <span className="selector__icon" aria-hidden>
          <UploadIcon />
        </span>
        <span className="selector__label">Upload a photo</span>
        <span className="selector__description">
          Perfect if you already have a picture of your room on your device.
        </span>
      </button>
      <button type="button" className="selector__option" onClick={() => onSelect('live')}>
        <span className="selector__icon" aria-hidden>
          <CameraIcon />
        </span>
        <span className="selector__label">Use live capture</span>
        <span className="selector__description">
          Open your webcam to grab a snapshot on the spot.
        </span>
      </button>
    </div>
  </div>
);
