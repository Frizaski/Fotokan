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

  // Camera aspect ratio matching photo cell ratio in the strip
  // 1x3: ~1:1 (square), 1x4: ~4:3 (landscape), 2x3: ~1:1 (square)
  const photoCellRatio = photoCount === 4 ? 4 / 3 : 1;

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
      // Capture from camera, cropped to match strip cell ratio
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const videoW = video.videoWidth;
      const videoH = video.videoHeight;

      // Center-crop video frame to target aspect ratio
      const videoRatio = videoW / videoH;
      let srcX: number, srcY: number, srcW: number, srcH: number;
      if (videoRatio > photoCellRatio) {
        // Video wider than target → crop left/right
        srcH = videoH;
        srcW = Math.round(videoH * photoCellRatio);
        srcX = Math.round((videoW - srcW) / 2);
        srcY = 0;
      } else {
        // Video taller than target → crop top/bottom
        srcW = videoW;
        srcH = Math.round(videoW / photoCellRatio);
        srcX = 0;
        srcY = Math.round((videoH - srcH) / 2);
      }

      canvas.width = srcW;
      canvas.height = srcH;
      const ctx = canvas.getContext('2d');
      if (ctx && videoW > 0) {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(video, srcX, srcY, srcW, srcH, -canvas.width, 0, canvas.width, canvas.height);
        ctx.restore();
        photoDataUrl = canvas.toDataURL('image/jpeg');
      } else {
        // Fallback to placeholder
        photoDataUrl = generatePlaceholderPhoto(currentPhotoIndex, photoCount);
      }
    } else {
      // Use placeholder when camera not available
      photoDataUrl = generatePlaceholderPhoto(currentPhotoIndex, photoCount);
    }
    
    setCapturedPhotos((prev) => [...prev, photoDataUrl]);
    setCurrentPhotoIndex(prev => prev + 1);
  }, [stream, currentPhotoIndex, setCapturedPhotos, photoCellRatio, photoCount]);

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
        <div
          className={`relative w-full ${photoCount === 4 ? 'max-w-5xl' : 'max-w-3xl'} bg-black rounded-lg overflow-hidden border-3 sm:border-4 border-[#FFD700]`}
          style={{ aspectRatio: photoCellRatio }}
        >
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
      {/* Photo strip preview */}
      <div className="flex items-center justify-center py-4 sm:py-6 md:py-8">
        {(() => {
          const is2x3 = photoCount === 6;
          const stripW = is2x3 ? 260 : 160;
          const stripH = is2x3 ? Math.round(stripW * (15 / 9.5)) : stripW * 3;
          const PAD = 10;
          const GAP = 6;
          const FOOTER_H = 20;

          const allSlots = Array.from({ length: photoCount }, (_, i) =>
            i < capturedPhotos.length ? capturedPhotos[i] : null
          );

          const PhotoSlot = ({ photo, idx }: { photo: string | null; idx: number }) => (
            <div className="flex-1 min-h-0">
              {photo ? (
                <div className="border-[3px] border-white/90 overflow-hidden h-full bg-black">
                  <img src={photo} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="border-[3px] border-white/30 h-full bg-gray-600/40 flex items-center justify-center">
                  <span className="text-white/30 text-xs font-medium">{idx + 1}</span>
                </div>
              )}
            </div>
          );

          return (
            <div
              className="overflow-hidden shadow-2xl flex flex-col"
              style={{
                width: stripW,
                height: stripH,
                backgroundColor: '#5a1a1a',
                border: '8px solid #3a0a0a',
                padding: PAD,
              }}
            >
              {is2x3 ? (
                <div className="grid grid-cols-2 flex-1" style={{ gap: GAP }}>
                  {allSlots.map((photo, i) => (
                    <PhotoSlot key={i} photo={photo} idx={i} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col flex-1" style={{ gap: GAP }}>
                  {allSlots.map((photo, i) => (
                    <PhotoSlot key={i} photo={photo} idx={i} />
                  ))}
                </div>
              )}
              <div
                className="text-center text-white text-[10px] font-semibold tracking-wide opacity-80 flex items-center justify-center flex-shrink-0"
                style={{ height: FOOTER_H }}
              >
                by fotoKAN
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}