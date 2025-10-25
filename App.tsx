import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { InputSelector } from './components/InputSelector';
import { FileUpload } from './components/FileUpload';
import { LiveCapture } from './components/LiveCapture';
import { ResultDisplay } from './components/ResultDisplay';
import { Loader } from './components/Loader';
import { redesignRoomAndFindProducts } from './services/geminiService';
import type { AppState, InputMode, Product } from './types';
import { CameraIcon, UploadIcon } from './components/IconComponents';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    step: 'SELECT_MODE',
    prompt: '',
    originalImage: null,
    redesignedImage: null,
    products: [],
    isLoading: false,
    error: null,
    estimatedDimensions: null,
  });

  const handleModeSelect = (mode: InputMode) => {
    setAppState(prev => ({ ...prev, step: 'PROVIDE_INPUT', inputMode: mode }));
  };
  
  const handleImageReady = (imageDataUrl: string) => {
    setAppState(prev => ({ ...prev, step: 'PROVIDE_PROMPT', originalImage: imageDataUrl }));
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAppState(prev => ({ ...prev, prompt: e.target.value }));
  };
  
  const handleSubmit = useCallback(async () => {
    if (!appState.originalImage || !appState.prompt) {
      setAppState(prev => ({...prev, error: "Please provide an image and a style prompt."}));
      return;
    }

    setAppState(prev => ({ ...prev, isLoading: true, error: null, step: 'GENERATING' }));

    try {
      const mimeType = appState.originalImage.split(';')[0].split(':')[1];
      const base64Data = appState.originalImage.split(',')[1];
      
      const result = await redesignRoomAndFindProducts(base64Data, mimeType, appState.prompt);
      
      setAppState(prev => ({
        ...prev,
        redesignedImage: result.redesignedImage,
        products: result.products,
        estimatedDimensions: result.estimatedDimensions,
        isLoading: false,
        step: 'SHOW_RESULT',
      }));

    } catch (error) {
      console.error("Error during redesign process:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setAppState(prev => ({ ...prev, isLoading: false, error: `Failed to generate redesign. ${errorMessage}`, step: 'PROVIDE_PROMPT' }));
    }
  }, [appState.originalImage, appState.prompt]);
  
  const handleStartOver = () => {
    setAppState({
      step: 'SELECT_MODE',
      prompt: '',
      inputMode: undefined,
      originalImage: null,
      redesignedImage: null,
      products: [],
      isLoading: false,
      error: null,
      estimatedDimensions: null,
    });
  };

  const renderContent = () => {
    switch (appState.step) {
      case 'SELECT_MODE':
        return <InputSelector onSelect={handleModeSelect} />;
      case 'PROVIDE_INPUT':
        return appState.inputMode === 'upload' ? 
          <FileUpload onImageReady={handleImageReady} /> : 
          <LiveCapture onImageReady={handleImageReady} />;
      case 'PROVIDE_PROMPT':
        return (
          <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Your Room</h2>
            <img src={appState.originalImage!} alt="Your room" className="rounded-lg shadow-lg mb-6 w-full max-w-md object-contain" />
            <textarea
              value={appState.prompt}
              onChange={handlePromptChange}
              placeholder="e.g., 'Make it modern minimalist with oak wood and neutral colors' or 'Give me a cozy, rustic farmhouse vibe.'"
              className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              rows={4}
            />
            <button
              onClick={handleSubmit}
              disabled={!appState.prompt.trim()}
              className="mt-6 w-full flex justify-center items-center gap-2 bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors duration-300"
            >
              Redesign My Room!
            </button>
             {appState.error && <p className="text-red-500 mt-4 text-center">{appState.error}</p>}
          </div>
        );
      case 'GENERATING':
        return <Loader />;
      case 'SHOW_RESULT':
        return (
          <ResultDisplay
            originalImage={appState.originalImage!}
            redesignedImage={appState.redesignedImage!}
            products={appState.products}
            estimatedDimensions={appState.estimatedDimensions}
            onStartOver={handleStartOver}
          />
        );
      default:
        return <p className="text-white">Something went wrong.</p>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4 md:p-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
