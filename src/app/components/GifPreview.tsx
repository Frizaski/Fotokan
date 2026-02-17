import { useState, useEffect } from 'react';

interface GifPreviewProps {
  photos: string[];
  isGenerating: boolean;
}

export default function GifPreview({ photos, isGenerating }: GifPreviewProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    if (photos.length === 0 || isGenerating) return;

    // Cycle through photos every 1 second (0.8-1.2 seconds as required)
    const interval = setInterval(() => {
      setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
    }, 1000);

    return () => clearInterval(interval);
  }, [photos, isGenerating]);

  if (isGenerating) {
    return (
      <div className="text-center animate-pulse">
        <div className="text-4xl sm:text-5xl md:text-6xl mb-4">🎬</div>
        <p className="text-base sm:text-lg md:text-xl text-gray-300 font-semibold">Generating GIF...</p>
        <div className="mt-3 flex justify-center gap-1.5">
          <div className="w-2 h-2 bg-[#FFD700] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-[#FFD700] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-[#FFD700] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="text-center">
        <div className="text-4xl sm:text-5xl md:text-6xl mb-4">📸</div>
        <p className="text-base sm:text-lg text-gray-300">No photos captured</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {photos.map((photo, index) => (
        <img
          key={index}
          src={photo}
          alt={`Photo ${index + 1}`}
          className={`absolute inset-0 w-full h-full object-contain rounded-md transition-opacity duration-500 ${
            index === currentPhotoIndex ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ imageRendering: 'auto' }}
        />
      ))}
      {/* Photo counter indicator */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/70 px-3 py-1 rounded-full">
        <p className="text-xs text-white font-semibold">
          {currentPhotoIndex + 1} / {photos.length}
        </p>
      </div>
    </div>
  );
}
