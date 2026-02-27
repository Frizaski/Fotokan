import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

export default function CameraPreviewPage() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const [permissionState, setPermissionState] = useState<string>('prompt');
  const [isReady, setIsReady] = useState(false);

  const checkPermissions = async () => {
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
        setPermissionState(result.state);
        
        result.addEventListener('change', () => {
          setPermissionState(result.state);
          if (result.state === 'granted') {
            setupCamera();
          }
        });
        
        return result.state;
      }
    } catch (err) {
      // Permissions API not supported, continue anyway (this is expected in some browsers)
    }
    return 'prompt';
  };

  const setupCamera = async () => {
    setIsRetrying(true);
    setError('');
    setPermissionDenied(false);
    setShowPermissionPrompt(false);
    
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Explicitly play the video to ensure it starts
        try {
          await videoRef.current.play();
          console.log('Video playback started successfully');
        } catch (playErr) {
          console.warn('Video play failed, but continuing:', playErr);
        }
      }
      setError('');
      setPermissionDenied(false);
      setIsReady(true);
    } catch (err) {
      const error = err as DOMException;
      
      // Log camera access issues as info rather than error to avoid alarming console messages
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        console.info('Camera permission not granted - continuing in demo mode');
        setPermissionDenied(true);
        setError('Camera permission denied');
      } else if (error.name === 'NotFoundError') {
        console.info('No camera detected - continuing in demo mode');
        setError('No camera found on this device');
      } else if (error.name === 'NotReadableError') {
        console.info('Camera in use - continuing in demo mode');
        setError('Camera is already in use by another application');
      } else if (error.name === 'NotSupportedError') {
        console.info('Camera not supported - continuing in demo mode');
        setError('Camera not supported in this browser');
      } else {
        console.info('Camera access issue - continuing in demo mode');
        setError('Unable to access camera');
      }
    } finally {
      setIsRetrying(false);
    }
  };

  useEffect(() => {
    const initCamera = async () => {
      const permState = await checkPermissions();
      
      if (permState === 'granted') {
        // Permission already granted, setup camera immediately
        setupCamera();
      } else if (permState === 'denied') {
        // Permission already denied, show demo mode
        setPermissionDenied(true);
        setError('Camera permission denied');
      } else {
        // Permission prompt needed, show button to request
        setShowPermissionPrompt(true);
      }
    };

    initCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleRequestPermission = () => {
    setupCamera();
  };

  const handleRetry = () => {
    setupCamera();
  };

  const handleStartDemo = () => {
    navigate('/capture', { state: { stream: null } });
  };

  const handleStart = () => {
    console.log('Start button clicked, stream:', stream);
    console.log('Navigating to /capture with stream');
    navigate('/capture', { state: { stream } });
  };

  return (
    <div className="size-full flex flex-col bg-[#1a1aff] text-white overflow-hidden">
      <div className="w-full flex items-center gap-3 px-4 sm:px-6 md:px-8 py-4 sm:py-5 flex-shrink-0">
        <div className="bg-[#ffffff] rounded-sm px-1 py-1 flex items-center justify-center shadow-2xl">
          <img src="/logo.png" className="w-18 h-10" alt="Logo" />
        </div>
        <p className="text-sm sm:text-base text-white/80" style={{ fontFamily: "'Poppins', sans-serif" }}>
          Photobooth by <span className="text-[#FFD700] font-bold">fotoKAN</span> – bring the moment with you
        </p>
      </div>
      <div className="flex-1 flex flex-col lg:flex-row p-4 sm:p-6 md:p-8 gap-6 md:gap-8 lg:gap-12 overflow-auto min-h-0">
      <div className="flex-1 flex flex-col items-center justify-center gap-4 md:gap-6 min-h-0">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center" style={{ fontFamily: "'Oilvare Base', sans-serif" }}>Camera Preview</h2>
        <div className="relative w-full max-w-4xl aspect-video bg-black rounded-lg md:rounded-xl overflow-hidden border-6 md:border-8 border-[#FFD700] shadow-2xl">
          {showPermissionPrompt ? (
            <div className="absolute inset-0 flex items-center justify-center text-white bg-gradient-to-br from-[#1a1aff] to-[#0d0d80] p-4">
              <div className="text-center p-4 sm:p-6 md:p-8 max-w-2xl">
                <div className="text-5xl sm:text-6xl md:text-8xl mb-4 md:mb-6">📸</div>
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6">Camera Access Required</p>
                <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 md:mb-8">
                  fotoKAN needs access to your camera to take photos.<br className="hidden sm:inline"/>
                  Click below to grant permission.
                </p>
                <button
                  onClick={handleRequestPermission}
                  disabled={isRetrying}
                  className="px-8 sm:px-12 md:px-16 py-4 sm:py-5 md:py-6 text-xl sm:text-2xl md:text-3xl font-bold text-white border-6 md:border-8 border-[#FFD700] rounded-full hover:bg-[#FFD700] hover:text-[#1a1aff] transition-all active:scale-95 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed mb-4 md:mb-6"
                >
                  {isRetrying ? 'Requesting...' : 'Enable Camera'}
                </button>
                <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t-4 border-gray-600">
                  <p className="text-base sm:text-lg text-gray-400 mb-3 md:mb-4">Don't have a camera?</p>
                  <button
                    onClick={handleStartDemo}
                    className="px-8 sm:px-10 md:px-12 py-3 sm:py-3.5 md:py-4 text-lg sm:text-xl md:text-2xl font-bold text-[#1a1aff] bg-[#FFD700] rounded-full hover:bg-yellow-400 transition-all active:scale-95 shadow-xl"
                  >
                    Continue with Demo Mode
                  </button>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex items-center justify-center text-white bg-gradient-to-br from-gray-800 to-gray-900 p-4 overflow-auto">
              <div className="text-center p-4 sm:p-6 md:p-8 max-w-2xl">
                <div className="text-4xl sm:text-5xl md:text-6xl mb-4 md:mb-6">⚠️</div>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 md:mb-6">{error}</p>
                
                {permissionDenied ? (
                  <>
                    <div className="text-left bg-gray-700/50 rounded-lg p-4 sm:p-5 md:p-6 mb-4 md:mb-6">
                      <p className="text-lg sm:text-xl font-semibold mb-3 md:mb-4 text-[#FFD700]">To enable camera access:</p>
                      <ol className="text-sm sm:text-base md:text-lg space-y-2 md:space-y-3 list-decimal list-inside">
                        <li>Click the camera icon 🎥 or lock icon 🔒 in your browser's address bar</li>
                        <li>Select "Allow" for camera permissions</li>
                        <li>Reload the page or click "Retry" below</li>
                      </ol>
                    </div>
                    <button
                      onClick={handleRetry}
                      disabled={isRetrying}
                      className="px-8 sm:px-12 md:px-16 py-4 sm:py-5 md:py-6 text-xl sm:text-2xl md:text-3xl font-bold text-white border-6 md:border-8 border-[#FFD700] rounded-full hover:bg-[#FFD700] hover:text-[#1a1aff] transition-all active:scale-95 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed mb-3 md:mb-4"
                    >
                      {isRetrying ? 'Requesting...' : 'Retry Camera Access'}
                    </button>
                    <p className="text-base sm:text-lg text-gray-400 mt-3 md:mt-4 mb-4 md:mb-6">Or</p>
                    <button
                      onClick={handleStartDemo}
                      className="px-8 sm:px-10 md:px-12 py-3 sm:py-3.5 md:py-4 text-lg sm:text-xl md:text-2xl font-bold text-[#1a1aff] bg-[#FFD700] rounded-full hover:bg-yellow-400 transition-all active:scale-95 shadow-xl"
                    >
                      Continue with Demo Mode
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-base sm:text-lg text-gray-400 mb-4 md:mb-6">
                      {error === 'No camera found on this device' 
                        ? 'This device does not have a camera' 
                        : 'There was a problem accessing your camera'}
                    </p>
                    <button
                      onClick={handleRetry}
                      disabled={isRetrying}
                      className="px-8 sm:px-12 md:px-16 py-4 sm:py-5 md:py-6 text-xl sm:text-2xl md:text-3xl font-bold text-white border-6 md:border-8 border-[#FFD700] rounded-full hover:bg-[#FFD700] hover:text-[#1a1aff] transition-all active:scale-95 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed mb-4 md:mb-6"
                    >
                      {isRetrying ? 'Trying...' : 'Try Again'}
                    </button>
                    <button
                      onClick={handleStartDemo}
                      className="px-8 sm:px-10 md:px-12 py-3 sm:py-3.5 md:py-4 text-lg sm:text-xl md:text-2xl font-bold text-[#1a1aff] bg-[#FFD700] rounded-full hover:bg-yellow-400 transition-all active:scale-95 shadow-xl"
                    >
                      Continue with Demo Mode
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : stream ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
              <div className="text-center p-4">
                <div className="text-4xl sm:text-5xl md:text-6xl mb-4 animate-pulse">📷</div>
                <p className="text-lg sm:text-xl md:text-2xl text-gray-400">Initializing camera...</p>
              </div>
            </div>
          )}
        </div>
        <p className="text-base sm:text-lg md:text-xl text-gray-300 text-center px-4">
          {stream ? 'Position yourself in the frame and get ready!' : 'Preparing camera for photo session'}
        </p>
      </div>
      <div className="flex items-center justify-center px-4 sm:px-8 md:px-12 py-4 lg:py-0">
        <button
          onClick={() => {
            console.log('Button clicked! Stream exists:', !!stream);
            if (stream) {
              // Store stream reference globally instead of in navigation state
              (window as any).__photobooth_stream = stream;
              navigate('/capture');
            } else {
              navigate('/capture');
            }
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            console.log('Button touched! Stream exists:', !!stream);
            if (stream) {
              (window as any).__photobooth_stream = stream;
              navigate('/capture');
            } else {
              navigate('/capture');
            }
          }}
          className="px-12 sm:px-16 md:px-20 lg:px-24 py-6 sm:py-8 md:py-10 text-3xl sm:text-4xl md:text-5xl font-bold text-white border-[10px] md:border-[16px] border-[#FFD700] rounded-full hover:bg-[#FFD700] hover:text-[#1a1aff] transition-all active:scale-95 shadow-2xl cursor-pointer touch-manipulation"
        >
          Start
        </button>
      </div>
      </div>
    </div>
  );
}