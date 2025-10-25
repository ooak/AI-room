import React, { useState, useCallback } from 'react';
import './App.css';
import { Header } from './components/Header.tsx';
import { InputSelector } from './components/InputSelector.tsx';
import { FileUpload } from './components/FileUpload.tsx';
import { LiveCapture } from './components/LiveCapture.tsx';
import { ResultDisplay } from './components/ResultDisplay.tsx';
import { Loader } from './components/Loader.tsx';
import { redesignRoomAndFindProducts } from './services/geminiService.ts';
import type { AppState, InputMode } from './types.ts';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    step: 'SELECT_MODE',
    inputMode: undefined,
    prompt: '',
    originalImage: null,
    redesignedImage: null,
    products: [],
    isLoading: false,
    error: null,
    estimatedDimensions: null,
  });

  const handleModeSelect = (mode: InputMode) => {
    setAppState(prev => ({ ...prev, step: 'PROVIDE_INPUT', inputMode: mode, error: null }));
  };

  const handleImageReady = (imageDataUrl: string) => {
    setAppState(prev => ({ ...prev, step: 'PROVIDE_PROMPT', originalImage: imageDataUrl, error: null }));
  };

  const handlePromptChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    setAppState(prev => ({ ...prev, prompt: value }));
  };

  const handleSubmit = useCallback(async () => {
    if (!appState.originalImage || !appState.prompt.trim()) {
      setAppState(prev => ({ ...prev, error: 'Please provide an image and a style prompt.' }));
      return;
    }

    setAppState(prev => ({ ...prev, isLoading: true, error: null, step: 'GENERATING' }));

    try {
      const [metadataPart] = appState.originalImage.split(',');
      const mimeType = metadataPart?.split(':')[1]?.split(';')[0] ?? 'image/jpeg';
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
      console.error('Error during redesign process:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      setAppState(prev => ({
        ...prev,
        isLoading: false,
        error: `Failed to generate redesign. ${errorMessage}`,
        step: 'PROVIDE_PROMPT',
      }));
    }
  }, [appState.originalImage, appState.prompt]);

  const handleStartOver = () => {
    setAppState({
      step: 'SELECT_MODE',
      inputMode: undefined,
      prompt: '',
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
        return appState.inputMode === 'upload' ? (
          <FileUpload onImageReady={handleImageReady} />
        ) : (
          <LiveCapture onImageReady={handleImageReady} />
        );
      case 'PROVIDE_PROMPT':
        return (
          <div className="prompt-step">
            <h2 className="section-title">Your Room</h2>
            {appState.originalImage && (
              <img
                src={appState.originalImage}
                alt="Your room"
                className="prompt-step__preview"
              />
            )}
            <label className="prompt-step__label" htmlFor="style-prompt">
              Tell us how you want the room to feel
            </label>
            <textarea
              id="style-prompt"
              value={appState.prompt}
              onChange={handlePromptChange}
              placeholder="e.g. Make it modern minimalist with warm woods and neutral fabrics"
              className="prompt-step__textarea"
              rows={4}
            />
            <button
              onClick={handleSubmit}
              disabled={!appState.prompt.trim() || appState.isLoading}
              className="primary-button"
            >
              Redesign my room
            </button>
            {appState.error && <p className="error-message">{appState.error}</p>}
          </div>
        );
      case 'GENERATING':
        return <Loader label="Creating your new room" />;
      case 'SHOW_RESULT':
        if (!appState.originalImage || !appState.redesignedImage) {
          return <p className="error-message">We could not display the result.</p>;
        }
        return (
          <ResultDisplay
            originalImage={appState.originalImage}
            redesignedImage={appState.redesignedImage}
            products={appState.products}
            estimatedDimensions={appState.estimatedDimensions}
            onStartOver={handleStartOver}
          />
        );
      default:
        return <p className="error-message">Something went wrong.</p>;
    }
  };

  return (
    <div className="app">
      <Header />
      <main className="app__main">
        <div className="app__content">
          {appState.isLoading && appState.step === 'GENERATING' ? <Loader label="Creating your new room" /> : renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
