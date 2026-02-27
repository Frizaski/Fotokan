import { useNavigate } from 'react-router';
import { usePhotobooth } from '../context/PhotoboothContext';
import PhotoStrip from '../components/PhotoStrip';
import { useRef, useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../utils/api';

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

/* ── Helper: load an image URL (data: or http) into an HTMLImageElement ── */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/* ── Render the photo strip to a canvas (pure Canvas2D, no html2canvas) ── */
async function renderStripToCanvas(
  photos: string[],
  photoCount: number,
  background: string,
  specialFrames: SpecialFrame[],
  specialStickers: SpecialSticker[],
  sticker: string,
): Promise<string> {
  const backgroundColors: Record<string, string> = {
    yellow: '#FFA500', blue: '#87CEEB', maroon: '#800000',
    black: '#1a1a1a', white: '#F5F5F5', babypink: '#FFB6C1',
  };

  const is2x3 = photoCount === 6;
  // Print resolution: ~118 DPI → 5cm≈233px, 9.5cm≈443px, 15cm≈700px
  // Use 3x multiplier for quality
  const SCALE = 3;
  const baseW = is2x3 ? 380 : 220;
  const baseH = is2x3 ? Math.round(baseW * (15 / 9.5)) : baseW * 3;
  const W = baseW * SCALE;
  const H = baseH * SCALE;

  const FRAME_BORDER = 10 * SCALE;
  const INNER_PAD = 12 * SCALE;
  const CONTENT_PAD = FRAME_BORDER + INNER_PAD;
  const GAP = 2 * SCALE; // gap between photos (Tailwind gap-2 = 8px at 1x)
  const PHOTO_BORDER = 4 * SCALE; // border-[4px]
  const TOP_BAR_H = 14 * SCALE; // dots + kodak text area
  const BOTTOM_BAR_H = 14 * SCALE;
  const FOOTER_H = 18 * SCALE;

  const isSpecialFrame = background.startsWith('special');
  const specialSlot = isSpecialFrame ? parseInt(background.replace('special', ''), 10) : 0;
  const activeFrame = specialFrames.find(f => f.slot === specialSlot);

  const isSpecialSticker = sticker.startsWith('special');
  const stickerSlot = isSpecialSticker ? parseInt(sticker.replace('special', ''), 10) : 0;
  const activeSticker = specialStickers.find(s => s.slot === stickerSlot);

  const getFrameUrl = () => {
    if (!activeFrame) return '';
    if (photoCount === 3) return activeFrame.design_1x3;
    if (photoCount === 4) return activeFrame.design_1x4;
    return activeFrame.design_2x3;
  };
  const getStickerUrl = () => {
    if (!activeSticker) return '';
    if (photoCount === 3) return activeSticker.design_1x3;
    if (photoCount === 4) return activeSticker.design_1x4;
    return activeSticker.design_2x3;
  };

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // ── 1. Draw background ──
  const pad = isSpecialFrame ? CONTENT_PAD : INNER_PAD;
  const contentX = isSpecialFrame ? CONTENT_PAD : FRAME_BORDER + INNER_PAD;
  const contentY = contentX;
  const contentW = W - contentX * 2;
  const contentH = H - contentY * 2;

  if (isSpecialFrame && activeFrame) {
    // Fill fallback bg
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, W, H);
    // Draw frame design image
    try {
      const frameImg = await loadImage(getFrameUrl());
      ctx.drawImage(frameImg, 0, 0, W, H);
    } catch { /* frame image failed, continue with fallback bg */ }
  } else {
    const bgColor = backgroundColors[background] || '#FFA500';
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, W, H);
  }

  // ── 2. Compute photo cell positions ──
  const photoAreaY = contentY + TOP_BAR_H + GAP;
  const photoAreaH = contentH - TOP_BAR_H - GAP - BOTTOM_BAR_H - GAP - FOOTER_H;
  const cols = is2x3 ? 2 : 1;
  const rows = is2x3 ? 3 : photoCount;
  const cellW = (contentW - (cols - 1) * GAP) / cols;
  const cellH = (photoAreaH - (rows - 1) * GAP) / rows;

  // ── 3. Draw top dots ──
  const dotSize = 2.5 * SCALE;
  const dotGap = 1.5 * SCALE;
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillRect(contentX + 1 * SCALE + i * (dotSize + dotGap), contentY + 4 * SCALE, dotSize, dotSize);
  }
  // KODAK PORTRA 400 text
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = `${8 * SCALE}px monospace`;
  ctx.textAlign = 'right';
  ctx.fillText('KODAK PORTRA 400', contentX + contentW - 1 * SCALE, contentY + 10 * SCALE);
  ctx.textAlign = 'left';

  // ── 4. Draw photos ──
  for (let i = 0; i < photos.length; i++) {
    const col = is2x3 ? (i % 2) : 0;
    const row = is2x3 ? Math.floor(i / 2) : i;
    const x = contentX + col * (cellW + GAP);
    const y = photoAreaY + row * (cellH + GAP);

    // White border
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillRect(x, y, cellW, cellH);

    // Photo inside border
    const px = x + PHOTO_BORDER;
    const py = y + PHOTO_BORDER;
    const pw = cellW - PHOTO_BORDER * 2;
    const ph = cellH - PHOTO_BORDER * 2;

    try {
      const img = await loadImage(photos[i]);
      // object-cover: fill the area, crop if needed
      const imgRatio = img.width / img.height;
      const cellRatio = pw / ph;
      let sx = 0, sy = 0, sw = img.width, sh = img.height;
      if (imgRatio > cellRatio) {
        sw = img.height * cellRatio;
        sx = (img.width - sw) / 2;
      } else {
        sh = img.width / cellRatio;
        sy = (img.height - sh) / 2;
      }
      ctx.drawImage(img, sx, sy, sw, sh, px, py, pw, ph);
    } catch {
      ctx.fillStyle = '#000';
      ctx.fillRect(px, py, pw, ph);
    }
  }

  // ── 5. Draw bottom dots ──
  const bottomDotsY = photoAreaY + photoAreaH + GAP + 4 * SCALE;
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillRect(contentX + 1 * SCALE + i * (dotSize + dotGap), bottomDotsY, dotSize, dotSize);
  }

  // ── 6. Draw footer "by fotoKAN" ──
  const footerY = contentY + contentH - FOOTER_H;
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.fillRect(contentX, footerY, contentW, FOOTER_H);
  ctx.fillStyle = 'white';
  ctx.font = `bold ${10 * SCALE}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('by fotoKAN', W / 2, footerY + FOOTER_H * 0.7);
  ctx.textAlign = 'left';

  // ── 7. Draw special sticker overlay ──
  if (isSpecialSticker && activeSticker) {
    try {
      const stickerImg = await loadImage(getStickerUrl());
      ctx.drawImage(stickerImg, 0, 0, W, H);
    } catch { /* sticker image failed */ }
  }

  return canvas.toDataURL('image/png');
}

export default function CustomizePage() {
  const navigate = useNavigate();
  const { selectedBackground, setSelectedBackground, selectedSticker, setSelectedSticker, capturedPhotos, photoCount, setStripDataUrl } = usePhotobooth();
  const [isSaving, setIsSaving] = useState(false);

  const [specialFrames, setSpecialFrames] = useState<SpecialFrame[]>([]);
  const [specialStickers, setSpecialStickers] = useState<SpecialSticker[]>([]);

  // Fetch special events from backend
  useEffect(() => {
    apiFetch('/api/special-frames').then(r => r.json()).then(setSpecialFrames).catch(() => {});
    apiFetch('/api/special-stickers').then(r => r.json()).then(setSpecialStickers).catch(() => {});
  }, []);

  /* ── auto-scale strip to fit available height ── */
  const containerRef = useRef<HTMLDivElement>(null);
  const stripWrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const recalc = useCallback(() => {
    const container = containerRef.current;
    const strip = stripWrapRef.current;
    if (!container || !strip) return;
    strip.style.transform = 'scale(1)';
    const availH = container.clientHeight;
    const availW = container.clientWidth;
    const naturalH = strip.scrollHeight;
    const naturalW = strip.scrollWidth;
    const s = Math.min(availH / naturalH, availW / naturalW, 1);
    setScale(s);
    strip.style.transform = `scale(${s})`;
  }, []);

  useEffect(() => {
    recalc();
    const ro = new ResizeObserver(recalc);
    if (containerRef.current) ro.observe(containerRef.current);
    if (stripWrapRef.current) ro.observe(stripWrapRef.current);
    return () => ro.disconnect();
  }, [recalc]);

  // Build background options: dynamic special frames + 6 fixed colors
  const backgrounds = [
    ...specialFrames.map((frame) => ({
      name: `special${frame.slot}`,
      label: frame.name,
      available: true,
    })),
    { name: 'yellow', label: 'Yellow', available: true },
    { name: 'blue', label: 'Blue', available: true },
    { name: 'maroon', label: 'Maroon', available: true },
    { name: 'black', label: 'Black', available: true },
    { name: 'white', label: 'White', available: true },
    { name: 'babypink', label: 'Baby Pink', available: true },
  ];

  // Build sticker options: dynamic special stickers + 5 built-in + no sticker
  const stickers = [
    ...specialStickers.map((stk) => ({
      name: `special${stk.slot}`,
      label: stk.name,
      available: true,
    })),
    { name: 'star', label: 'Star', available: true },
    { name: 'heart', label: 'Heart', available: true },
    { name: 'bubble', label: 'Bubble', available: true },
    { name: 'ribbon', label: 'Ribbon', available: true },
    { name: 'cloud', label: 'Cloud', available: true },
    { name: 'none', label: 'No sticker', available: true },
  ];

  const OptionButton = ({
    selected,
    label,
    onClick,
    disabled,
  }: {
    selected: boolean;
    label: string;
    onClick: () => void;
    disabled?: boolean;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`py-2.5 sm:py-3 text-sm sm:text-base font-semibold rounded-xl border-[3px] transition-all active:scale-95 whitespace-pre-line leading-tight ${
        disabled
          ? 'opacity-30 cursor-not-allowed text-white/50 border-white/30'
          : selected
            ? 'bg-[#FFD700] text-[#1a1aff] border-[#FFD700] shadow-lg'
            : 'text-white border-[#FFD700] hover:bg-[#FFD700]/20'
      }`}
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      {label}
    </button>
  );

  return (
    <div className="size-full flex flex-col bg-[#1a1aff] text-white overflow-hidden">
      {/* Header bar */}
      <div className="w-full flex items-center gap-3 px-4 sm:px-6 md:px-8 py-4 sm:py-5 flex-shrink-0">
        <div className="bg-[#ffffff] rounded-sm px-1 py-1 flex items-center justify-center shadow-2xl">
          <img src="/logo.png" className="w-18 h-10" alt="Logo" />
        </div>
        <p className="text-sm sm:text-base text-white/80" style={{ fontFamily: "'Poppins', sans-serif" }}>
          Photobooth by <span className="text-[#FFD700] font-bold">fotoKAN</span> – bring the moment with you
        </p>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row items-center lg:items-stretch gap-6 md:gap-8 lg:gap-12 px-4 sm:px-6 md:px-10 lg:px-16 pb-6 min-h-0">
        {/* Left: Photo Strip Preview */}
        <div
          ref={containerRef}
          className="flex items-center justify-center lg:w-[28%] flex-shrink-0 h-full overflow-hidden"
        >
          <div
            ref={stripWrapRef}
            className="origin-center flex-shrink-0"
            style={{ transform: `scale(${scale})` }}
          >
            <PhotoStrip
              background={selectedBackground}
              sticker={selectedSticker}
              specialFrames={specialFrames}
              specialStickers={specialStickers}
            />
          </div>
        </div>

        {/* Center: Frame Color & Sticker options + Next button */}
        <div className="flex-1 flex flex-col justify-center gap-6 sm:gap-8 min-w-0 overflow-y-auto py-4">
          {/* Frame Color */}
          <div>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-normal mb-4 sm:mb-5 text-center"
              style={{ fontFamily: "'Oilvare Base', sans-serif" }}
            >
              Frame Color
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4 max-w-xl mx-auto">
              {backgrounds.map((bg) => (
                <OptionButton
                  key={bg.name}
                  selected={selectedBackground === bg.name}
                  label={bg.label}
                  disabled={!bg.available}
                  onClick={() => setSelectedBackground(bg.name)}
                />
              ))}
            </div>
          </div>

          {/* Sticker */}
          <div>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-normal mb-4 sm:mb-5 text-center"
              style={{ fontFamily: "'Oilvare Base', sans-serif" }}
            >
              Sticker
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4 max-w-xl mx-auto">
              {stickers.map((sticker) => (
                <OptionButton
                  key={sticker.name}
                  selected={selectedSticker === sticker.name}
                  label={sticker.label}
                  disabled={!sticker.available}
                  onClick={() => setSelectedSticker(sticker.name)}
                />
              ))}
            </div>
          </div>

          {/* Next button */}
          <div className="flex justify-center mt-2 sm:mt-4">
            <button
              disabled={isSaving}
              onClick={async () => {
                setIsSaving(true);
                try {
                  const dataUrl = await renderStripToCanvas(
                    capturedPhotos,
                    photoCount,
                    selectedBackground,
                    specialFrames,
                    specialStickers,
                    selectedSticker,
                  );
                  // Store in context for PrintPage to access
                  setStripDataUrl(dataUrl);
                  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
                  const resp = await apiFetch('/api/photos', {
                    method: 'POST',
                    body: JSON.stringify({ image: dataUrl, name: `strip-${timestamp}` }),
                  });
                  if (!resp.ok) {
                    console.error('Server responded with', resp.status, await resp.text());
                  }
                } catch (err) {
                  console.error('Failed to save photo strip:', err);
                } finally {
                  setIsSaving(false);
                  navigate('/print');
                }
              }}
              className="px-16 sm:px-20 md:px-24 py-4 sm:py-5 text-xl sm:text-2xl md:text-3xl font-semibold text-white border-[3px] sm:border-4 border-[#FFD700] rounded-2xl hover:bg-[#FFD700] hover:text-[#1a1aff] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-wait"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              {isSaving ? 'Saving...' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}