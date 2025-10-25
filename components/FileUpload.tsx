import React, { useState } from 'react';

import './FileUpload.css';

interface FileUploadProps {
  onImageReady: (dataUrl: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onImageReady }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }

    setError(null);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        setPreview(result);
        onImageReady(result);
      }
    };
    reader.onerror = () => setError('We could not read that file. Please try again.');
    reader.readAsDataURL(file);
  };

  return (
    <div className="upload">
      <h2 className="section-title">Upload your room</h2>
      <p className="upload__hint">
        Choose a clear photo of the space you want to reinvent. Natural lighting works best!
      </p>
      <label className="upload__dropzone">
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <span className="upload__cta">Click to browse</span>
        <span className="upload__note">PNG, JPG or HEIC, max 15MB</span>
      </label>
      {error && <p className="error-message">{error}</p>}
      {preview && (
        <figure className="upload__preview">
          <img src={preview} alt="Uploaded room" />
          <figcaption>Looks good! Scroll down to describe your dream style.</figcaption>
        </figure>
      )}
    </div>
  );
};
