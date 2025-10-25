import React, { useEffect, useRef, useState } from 'react';

import './LiveCapture.css';

interface LiveCaptureProps {
  onImageReady: (dataUrl: string) => void;
}

export const LiveCapture: React.FC<LiveCaptureProps> = ({ onImageReady }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<string | null>(null);

  useEffect(() => {
    let activeStream: MediaStream | null = null;

    const startStream = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('Camera access is not supported in this browser.');
        return;
      }

      try {
        activeStream = await navigator.mediaDevices.getUserMedia({ video: true });
        const video = videoRef.current;
        if (video) {
          video.srcObject = activeStream;
          await video.play();
          setIsStreaming(true);
        }
      } catch (streamError) {
        console.error(streamError);
        setError('We could not start the camera. Please check your permissions.');
      }
    };

    void startStream();

    return () => {
      activeStream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) {
      return;
    }

    const { videoWidth, videoHeight } = video;
    canvas.width = videoWidth;
    canvas.height = videoHeight;
    const context = canvas.getContext('2d');
    if (!context) {
      setError('We could not take a snapshot.');
      return;
    }

    context.drawImage(video, 0, 0, videoWidth, videoHeight);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setSnapshot(dataUrl);
    onImageReady(dataUrl);
  };

  return (
    <div className="capture">
      <h2 className="section-title">Capture a fresh photo</h2>
      <p className="capture__hint">
        Position your camera toward the room and make sure the frame is well lit before snapping a photo.
      </p>
      <div className="capture__viewport">
        {isStreaming ? (
          <video ref={videoRef} playsInline muted />
        ) : (
          <div className="capture__placeholder">Waiting for camera…</div>
        )}
        <canvas ref={canvasRef} className="capture__canvas" aria-hidden />
      </div>
      <button type="button" className="primary-button" onClick={handleCapture} disabled={!isStreaming}>
        Capture photo
      </button>
      {error && <p className="error-message">{error}</p>}
      {snapshot && (
        <figure className="capture__preview">
          <img src={snapshot} alt="Captured room" />
          <figcaption>Snapshot saved. Next, describe your ideal makeover.</figcaption>
        </figure>
      )}
    </div>
  );
};
