import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { usePhotobooth } from '../context/PhotoboothContext';
import { generatePlaceholderPhoto } from '../utils/placeholders';

export default function PhotoCapturePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { photoCount, capturedPhotos, setCapturedPhotos } = usePhotobooth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [countdown, setCountdown] = useState(5);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [flash, setFlash] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  useEffect(() => {
    async function setupCamera() {
      try {
        const mediaStream = location.state?.stream || await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720, facingMode: 'user' },
          audio: false,
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setCameraError(false);
      } catch (err) {
        // Log as info instead of error - demo mode is a valid fallback
        console.info('Camera not available - using demo mode with placeholder images');
        setCameraError(true);
        // Continue with placeholder mode
      }
    }

    setupCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [location.state?.stream]);

  const capturePhoto = useCallback(() => {
    // Flash effect
    setFlash(true);
    setTimeout(() => setFlash(false), 200);
    
    let photoDataUrl: string;
    
    if (videoRef.current && canvasRef.current && stream) {
      // Capture from camera
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx && video.videoWidth > 0) {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
        ctx.restore();
        photoDataUrl = canvas.toDataURL('image/jpeg');
      } else {
        // Fallback to placeholder
        photoDataUrl = generatePlaceholderPhoto(currentPhotoIndex);
      }
    } else {
      // Use placeholder when camera not available
      photoDataUrl = generatePlaceholderPhoto(currentPhotoIndex);
    }
    
    setCapturedPhotos((prev) => [...prev, photoDataUrl]);
    setCurrentPhotoIndex(prev => prev + 1);
  }, [stream, currentPhotoIndex, setCapturedPhotos]);

  useEffect(() => {
    if (currentPhotoIndex >= photoCount) {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      navigate('/customize');
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          // Use setTimeout to avoid state updates during render
          setTimeout(() => capturePhoto(), 0);
          return 5;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentPhotoIndex, photoCount, navigate, stream, capturePhoto]);

  return (
    <div className="size-full flex flex-col lg:flex-row bg-[#1a1aff] text-white p-4 sm:p-6 md:p-8 gap-4 sm:gap-6 md:gap-8 overflow-auto">
      {/* Flash effect overlay */}
      {flash && (
        <div className="fixed inset-0 bg-white z-50 pointer-events-none" 
          style={{ animation: 'flash 0.2s ease-out' }} 
        />
      )}
      
      <div className="flex-1 flex flex-col items-center justify-center min-h-0">
        {cameraError && (
          <div className="mb-3 md:mb-4 bg-yellow-500/20 border-2 border-[#FFD700] rounded-lg px-4 sm:px-6 py-2 sm:py-3">
            <p className="text-[#FFD700] text-base sm:text-lg md:text-xl font-semibold text-center">📷 Demo Mode - Using Placeholder Images</p>
          </div>
        )}
        <div className="relative w-full max-w-3xl aspect-video bg-black rounded-lg overflow-hidden border-3 sm:border-4 border-[#FFD700]">
          {cameraError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
              <div className="text-center p-4 sm:p-6 md:p-8">
                <div className="text-4xl sm:text-5xl md:text-6xl mb-3 md:mb-4">🎭</div>
                <p className="text-xl sm:text-2xl font-bold text-[#FFD700]">Demo Mode Active</p>
                <p className="text-base sm:text-lg text-gray-400 mt-2">Placeholder photos will be used</p>
              </div>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />
          )}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div 
              className="text-white font-bold drop-shadow-[0_0_30px_rgba(255,255,255,0.9)] transition-all duration-300"
              style={{ 
                fontSize: countdown === 1 ? 'clamp(120px, 20vw, 250px)' : 'clamp(100px, 18vw, 200px)',
                color: countdown <= 2 ? '#FFD700' : 'white',
              }}
            >
              {countdown}
            </div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white mt-2 sm:mt-3 md:mt-4 bg-[#1a1aff]/80 px-4 sm:px-5 md:px-6 py-1.5 sm:py-2 rounded-full">
              Photo {currentPhotoIndex + 1} of {photoCount}
            </div>
          </div>
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>
      <div className="w-full lg:w-80 xl:w-96 flex flex-col gap-3 sm:gap-4 items-center justify-center py-4 sm:py-6 md:py-8">
        <div className="text-2xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 md:mb-4 text-center">
          Captured Photos
        </div>
        <div className="w-full space-y-2 sm:space-y-3 max-h-[40vh] lg:max-h-none overflow-auto">
          {capturedPhotos.map((photo, index) => (
            <div key={index} className="w-full aspect-video bg-white rounded-lg overflow-hidden border-3 sm:border-4 border-[#FFD700] shadow-lg">
              <img src={photo} alt={`Captured ${index + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
          {Array.from({ length: photoCount - capturedPhotos.length }).map((_, index) => (
            <div key={`placeholder-${index}`} className="w-full aspect-video bg-gray-700/50 rounded-lg border-3 sm:border-4 border-gray-500 flex items-center justify-center">
              <span className="text-gray-400 text-lg sm:text-xl">Waiting...</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}