import React, { useEffect, useRef, useState } from 'react';

type LiveCaptureProps = {
  onImageReady: (dataUrl: string) => void;
};

const LiveCapture: React.FC<LiveCaptureProps> = ({ onImageReady }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    let stream: MediaStream;

    const enableCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setError(null);
        }
      } catch (cameraError) {
        console.error('Unable to access camera', cameraError);
        setError('We could not access your camera. Check permissions and try again.');
      }
    };

    enableCamera();

    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) {
      setError('Camera is not ready yet.');
      return;
    }

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) {
      setError('Could not capture frame.');
      return;
    }

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg');
    onImageReady(dataUrl);
    setIsCapturing(true);
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800">Capture a live photo</h2>
      <p className="mt-2 text-sm text-gray-600">
        Allow camera access and position your room within the frame, then capture a still image.
      </p>
      <div className="mt-4 aspect-video bg-black rounded-lg overflow-hidden">
        <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
      </div>
      <button
        type="button"
        onClick={handleCapture}
        className="mt-4 w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition"
      >
        Capture photo
      </button>
      {isCapturing && (
        <p className="mt-3 text-sm text-indigo-600">Frame captured! You can proceed to describe your ideal style.</p>
      )}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export { LiveCapture };
