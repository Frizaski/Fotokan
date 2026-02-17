import { usePhotobooth } from '../context/PhotoboothContext';
import { Star, Heart, Cloud } from 'lucide-react';

interface PhotoStripProps {
  background: string;
  sticker: string;
}

export default function PhotoStrip({ background, sticker }: PhotoStripProps) {
  const { capturedPhotos } = usePhotobooth();

  const backgroundColors: Record<string, string> = {
    yellow: '#FFA500',
    blue: '#87CEEB',
    maroon: '#800000',
    black: '#1a1a1a',
    white: '#F5F5F5',
    babypink: '#FFB6C1',
  };

  const renderSticker = (index: number) => {
    const positions = [
      { top: '8px', right: '8px' },
      { top: '8px', left: '8px' },
      { bottom: '8px', right: '8px' },
      { bottom: '8px', left: '8px' },
    ];
    const position = positions[index % positions.length];

    const style: React.CSSProperties = {
      position: 'absolute',
      ...position,
      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
    };

    switch (sticker) {
      case 'star':
        return <Star style={style} size={40} fill="white" stroke="white" />;
      case 'heart':
        return <Heart style={style} size={40} fill="#ff69b4" stroke="white" strokeWidth={2} />;
      case 'bubble':
        return (
          <div style={{ ...style, width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'white', border: '3px solid #87CEEB', opacity: 0.9 }} />
        );
      case 'ribbon':
        return (
          <div style={{ ...style, width: '50px', height: '15px', backgroundColor: '#ff69b4', borderRadius: '4px', border: '2px solid white' }} />
        );
      case 'cloud':
        return <Cloud style={style} size={40} fill="white" stroke="white" />;
      default:
        return null;
    }
  };

  return (
    <div 
      className="relative w-[380px] rounded-xl overflow-hidden shadow-2xl"
      style={{ 
        backgroundColor: backgroundColors[background] || '#FFA500',
        border: '12px solid #1a1a1a',
      }}
    >
      <div className="p-4">
        {/* Film strip header with perforations */}
        <div className="flex items-center justify-between mb-3 px-2">
          <div className="flex gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={`top-${i}`} className="w-3 h-3 rounded-sm bg-white/80" />
            ))}
          </div>
          <span className="text-[10px] text-white/70 font-mono">KODAK PORTRA 400</span>
        </div>

        {/* Photos */}
        <div className="flex flex-col gap-3">
          {capturedPhotos.map((photo, index) => (
            <div key={index} className="relative">
              <div className="border-[6px] border-white/90 rounded overflow-hidden shadow-lg" style={{ backgroundColor: 'black' }}>
                <img 
                  src={photo} 
                  alt={`Photo ${index + 1}`} 
                  className="w-full aspect-[4/3] object-cover"
                />
              </div>
              {sticker !== 'none' && renderSticker(index)}
            </div>
          ))}
        </div>

        {/* Film strip footer */}
        <div className="flex items-center justify-between mt-3 px-2">
          <div className="flex gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={`bottom-${i}`} className="w-3 h-3 rounded-sm bg-white/80" />
            ))}
          </div>
        </div>

        {/* Branding */}
        <div className="mt-3 text-center bg-white/10 backdrop-blur-sm rounded py-1">
          <p className="text-white text-xs font-bold tracking-wide">by fotoKAN</p>
        </div>
      </div>
    </div>
  );
}