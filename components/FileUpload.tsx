import React, { useState } from 'react';

type FileUploadProps = {
  onImageReady: (dataUrl: string) => void;
};

const FileUpload: React.FC<FileUploadProps> = ({ onImageReady }) => {
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setError('Please choose an image file.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Only image uploads are supported.');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === 'string') {
          setError(null);
          onImageReady(result);
        } else {
          setError('Could not read the selected file.');
        }
      };
      reader.onerror = () => {
        setError('Failed to read the file.');
      };
      reader.readAsDataURL(file);
    } catch (readingError) {
      console.error('Failed to process upload', readingError);
      setError('Something went wrong while reading the file.');
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800">Upload a room photo</h2>
      <p className="mt-2 text-sm text-gray-600">
        Choose a clear, well-lit photo of your room to get the best results.
      </p>
      <label className="mt-4 flex items-center justify-center w-full border-2 border-dashed border-indigo-300 rounded-lg p-6 cursor-pointer hover:border-indigo-500">
        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        <span className="text-indigo-600 font-medium">Click to select an image</span>
      </label>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export { FileUpload };
