import { forwardRef } from 'react';
import { usePhotobooth } from '../context/PhotoboothContext';
import { Star, Heart, Cloud } from 'lucide-react';

interface SpecialFrame {
  id: string;
  name: string;
  slot: number;
  design_1x3: string;
  design_1x4: string;
  design_2x3: string;
}

interface SpecialSticker {
  id: string;
  name: string;
  slot: number;
  design_1x3: string;
  design_1x4: string;
  design_2x3: string;
}

interface PhotoStripProps {
  background: string;
  sticker: string;
  specialFrames?: SpecialFrame[];
  specialStickers?: SpecialSticker[];
}

/*
  Layout guide (matches ChoosePhotosPage proportions):
  ─────────────────────────────────────
  1×3 (3 photos): narrow strip, photos 1:1
  1×4 (4 photos): narrow strip, photos 4:3 (landscape)
  2×3 (6 photos): wide strip, 2-col grid, photos 1:1
  ─────────────────────────────────────
*/

const PhotoStrip = forwardRef<HTMLDivElement, PhotoStripProps>(function PhotoStrip({ background, sticker, specialFrames = [], specialStickers = [] }, ref) {
  const { capturedPhotos, photoCount } = usePhotobooth();

  const backgroundColors: Record<string, string> = {
    yellow: '#FFA500',
    blue: '#87CEEB',
    maroon: '#800000',
    black: '#1a1a1a',
    white: '#F5F5F5',
    babypink: '#FFB6C1',
  };

  const is2x3 = photoCount === 6;
  const stripWidth = is2x3 ? 380 : 220;
  // Enforce print-correct proportions:
  // 1x3, 1x4: 5cm × 15cm → ratio 1:3
  // 2x3: 9.5cm × 15cm → ratio 19:30
  const stripHeight = is2x3 ? Math.round(stripWidth * (15 / 9.5)) : stripWidth * 3;

  // Unified content padding (must be identical for both frame types)
  // Standard frame: border 10px + padding 12px = 22px
  // Special frame: no border, so padding = 22px
  const FRAME_BORDER = 10;
  const INNER_PAD = 12;
  const CONTENT_PAD = FRAME_BORDER + INNER_PAD; // 22px total from edge to photo area

  // Determine if using a special frame (background image)
  const isSpecialFrame = background.startsWith('special');
  const specialSlot = isSpecialFrame ? parseInt(background.replace('special', ''), 10) : 0;
  const activeFrame = specialFrames.find((f) => f.slot === specialSlot);

  const getFrameDesignUrl = () => {
    if (!activeFrame) return '';
    if (photoCount === 3) return activeFrame.design_1x3;
    if (photoCount === 4) return activeFrame.design_1x4;
    return activeFrame.design_2x3;
  };

  const bgColor = isSpecialFrame ? '#333' : (backgroundColors[background] || '#FFA500');
  const frameDesignUrl = getFrameDesignUrl();

  // Determine if using a special sticker (full-strip overlay)
  const isSpecialSticker = sticker.startsWith('special');
  const stickerSlot = isSpecialSticker ? parseInt(sticker.replace('special', ''), 10) : 0;
  const activeSticker = specialStickers.find((s) => s.slot === stickerSlot);

  const getStickerDesignUrl = () => {
    if (!activeSticker) return '';
    if (photoCount === 3) return activeSticker.design_1x3;
    if (photoCount === 4) return activeSticker.design_1x4;
    return activeSticker.design_2x3;
  };
  const stickerDesignUrl = getStickerDesignUrl();

  // Built-in sticker rendering (per-photo decorations)
  const isBuiltinSticker = !isSpecialSticker && sticker !== 'none';

  const renderSticker = (index: number) => {
    // Only render built-in stickers here; special stickers are full-strip overlays
    if (!isBuiltinSticker) return null;

    const stickerSize = is2x3 ? 28 : 36;
    const offset = is2x3 ? '4px' : '8px';

    const positions = [
      { top: offset, right: offset },
      { top: offset, left: offset },
      { bottom: offset, right: offset },
      { bottom: offset, left: offset },
    ];
    const position = positions[index % positions.length];

    const style: React.CSSProperties = {
      position: 'absolute',
      ...position,
      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
    };

    switch (sticker) {
      case 'star':
        return <Star style={style} size={stickerSize} fill="white" stroke="white" />;
      case 'heart':
        return <Heart style={style} size={stickerSize} fill="#ff69b4" stroke="white" strokeWidth={2} />;
      case 'bubble':
        return (
          <div style={{ ...style, width: stickerSize, height: stickerSize, borderRadius: '50%', backgroundColor: 'white', border: '3px solid #87CEEB', opacity: 0.9 }} />
        );
      case 'ribbon':
        return (
          <div style={{ ...style, width: stickerSize + 10, height: Math.round(stickerSize * 0.4), backgroundColor: '#ff69b4', borderRadius: '4px', border: '2px solid white' }} />
        );
      case 'cloud':
        return <Cloud style={style} size={stickerSize} fill="white" stroke="white" />;
      default:
        return null;
    }
  };

  const PhotoCellFlex = ({ photo, index }: { photo: string; index: number }) => (
    <div className="relative flex-1 min-h-0">
      <div
        className="border-[4px] border-white/90 overflow-hidden shadow-lg h-full"
        style={{ backgroundColor: 'black' }}
      >
        <img
          src={photo}
          alt={`Photo ${index + 1}`}
          className="w-full h-full object-cover"
        />
      </div>
      {sticker !== 'none' && renderSticker(index)}
    </div>
  );

  // Special sticker overlay — full-strip transparent PNG on top
  const StickerOverlay = () => {
    if (!isSpecialSticker || !activeSticker || !stickerDesignUrl) return null;
    return (
      <img
        src={stickerDesignUrl}
        alt={activeSticker.name}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 10, objectFit: 'fill' }}
      />
    );
  };

  const StripContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-1 px-1 flex-shrink-0">
        <div className="flex gap-1.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={`top-${i}`} className="w-2.5 h-2.5 rounded-sm bg-white/80" />
          ))}
        </div>
        <span className="text-[8px] text-white/70 font-mono">KODAK PORTRA 400</span>
      </div>
      {is2x3 ? (
        <div className="grid grid-cols-2 gap-2 flex-1" style={{ gridAutoRows: '1fr' }}>
          {capturedPhotos.map((photo, index) => (
            <PhotoCellFlex key={index} photo={photo} index={index} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2 flex-1">
          {capturedPhotos.map((photo, index) => (
            <PhotoCellFlex key={index} photo={photo} index={index} />
          ))}
        </div>
      )}
      <div className="flex items-center justify-between mt-1 px-1 flex-shrink-0">
        <div className="flex gap-1.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={`bottom-${i}`} className="w-2.5 h-2.5 rounded-sm bg-white/80" />
          ))}
        </div>
      </div>
      <div className="mt-1 text-center bg-white/10 backdrop-blur-sm rounded py-0.5 flex-shrink-0">
        <p className="text-white text-[10px] font-bold tracking-wide">by fotoKAN</p>
      </div>
    </div>
  );

  // Special frame with background design image
  if (isSpecialFrame && activeFrame && frameDesignUrl) {
    return (
      <div
        ref={ref}
        className="relative overflow-hidden shadow-2xl"
        style={{ width: stripWidth, height: stripHeight }}
      >
        <img
          src={frameDesignUrl}
          alt="Frame design"
          className="absolute inset-0 w-full h-full"
          style={{ zIndex: 0, objectFit: 'fill' }}
        />
        <div className="relative h-full" style={{ zIndex: 1, padding: CONTENT_PAD }}>
          <StripContent />
        </div>
        <StickerOverlay />
      </div>
    );
  }

  // Standard solid-color background
  return (
    <div
      ref={ref}
      className="relative overflow-hidden shadow-2xl"
      style={{
        width: stripWidth,
        height: stripHeight,
        backgroundColor: bgColor,
        border: `${FRAME_BORDER}px solid`,
        borderColor: bgColor,
      }}
    >
      <div className="h-full" style={{ padding: INNER_PAD }}>
        <StripContent />
      </div>
      <StickerOverlay />
    </div>
  );
});

export default PhotoStrip;