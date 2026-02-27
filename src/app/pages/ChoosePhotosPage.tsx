import { useNavigate } from 'react-router';
import { usePhotobooth } from '../context/PhotoboothContext';

/*
  Guide specs (real print):
  ─────────────────────────────────────
  All strips: 15 cm tall
  1×3 (3 foto): 5 cm wide,  photos ratio 3:4
  1×4 (4 foto): 5 cm wide,  photos ratio 1:1
  2×3 (6 foto): 9.5 cm wide, photos ratio 1:1
  Gap between photos: 0.5 cm
  Padding top/bottom: 0.5 cm
  ─────────────────────────────────────
  We use a fixed pixel height for all strips so they align.
  Ratio  5 cm : 15 cm  = 1 : 3   → single-column strip
  Ratio 9.5 cm : 15 cm ≈ 1 : 1.58 → 2×3 strip
*/

const STRIP_H = 420; // px – shared height for all strips
const GAP = 8;       // px – gap between photo slots (~0.5 cm proportional)
const PAD = 10;      // px – inner padding
const FOOTER_H = 24; // px – "by fotoKAN" text area

export default function ChoosePhotosPage() {
  const navigate = useNavigate();
  const { setPhotoCount } = usePhotobooth();

  const handleSelect = (count: number) => {
    setPhotoCount(count);
    navigate('/disclaimer');
  };

  const options = [
    { count: 3, label: '3 foto', layout: '1x3' as const },
    { count: 4, label: '4 foto', layout: '1x4' as const },
    { count: 6, label: '6 foto', layout: '2x3' as const },
  ];

  const renderStripPreview = (count: number, layout: '1x3' | '1x4' | '2x3') => {
    // Compute slot height so all strips fill the same total height
    const rows = layout === '2x3' ? 3 : count;
    const totalGaps = (rows - 1) * GAP;
    const availableH = STRIP_H - PAD * 2 - FOOTER_H - totalGaps;
    const slotH = availableH / rows;

    // Determine aspect ratio for the slot
    const aspectRatio = layout === '1x4' ? '4 / 3' : '1 / 1';

    // Width based on guide proportions (9.5 : 5 ≈ 1.9)
    const stripWidth = layout === '2x3' ? 260 : 140;

    const PhotoSlot = ({ h }: { h: number }) => (
      <div
        className="bg-gray-500/60 w-full"
        style={{ height: h, aspectRatio }}
      />
    );

    if (layout === '2x3') {
      return (
        <div
          className="bg-[#5a1a1a] shadow-xl border-4 border-[#3a0a0a] flex flex-col"
          style={{ width: stripWidth, height: STRIP_H, padding: PAD }}
        >
          <div
            className="grid grid-cols-2 flex-1"
            style={{ gap: GAP }}
          >
            {Array.from({ length: count }).map((_, i) => (
              <PhotoSlot key={i} h={slotH} />
            ))}
          </div>
          <div
            className="text-center text-white text-[10px] font-semibold tracking-wide opacity-80 flex items-center justify-center"
            style={{ height: FOOTER_H }}
          >
            by fotoKAN
          </div>
        </div>
      );
    }

    // Single column (1×3 or 1×4)
    return (
      <div
        className="bg-[#5a1a1a] shadow-xl border-4 border-[#3a0a0a] flex flex-col"
        style={{ width: stripWidth, height: STRIP_H, padding: PAD }}
      >
        <div className="flex flex-col flex-1" style={{ gap: GAP }}>
          {Array.from({ length: count }).map((_, i) => (
            <PhotoSlot key={i} h={slotH} />
          ))}
        </div>
        <div
          className="text-center text-white text-[10px] font-semibold tracking-wide opacity-80 flex items-center justify-center"
          style={{ height: FOOTER_H }}
        >
          by fotoKAN
        </div>
      </div>
    );
  };

  return (
    <div className="size-full flex flex-col items-center bg-[#1a1aff] text-white px-4 sm:px-6 md:px-8 py-6 sm:py-8 overflow-auto">
      {/* Header bar */}
      <div className="w-full flex items-center gap-3 mb-6 sm:mb-8">
        <div className="bg-[#ffffff] rounded-sm px-1 py-1 flex items-center justify-center shadow-2xl">
          <img src="/logo.png" className="w-18 h-10" alt="Logo" />
        </div>
        <p className="text-sm sm:text-base text-white/80" style={{ fontFamily: "'Poppins', sans-serif" }}>
          Photobooth by <span className="text-[#FFD700] font-bold">fotoKAN</span> – bring the moment with you
        </p>
      </div>

      {/* Title */}
      <h2 className="text-3xl sm:text-5xl md:text-6xl font-normal mb-8 sm:mb-10 md:mb-12 text-center" style={{ fontFamily: "'Oilvare Base', sans-serif" }}>
        Choose your template
      </h2>

      {/* Strip previews & buttons – all strips same height, aligned at top */}
      <div className="flex flex-col sm:flex-row gap-8 sm:gap-8 md:gap-12 lg:gap-16 items-start justify-center flex-1">
        {options.map((option) => (
          <div key={option.count} className="flex flex-col items-center gap-5 sm:gap-6">
            {renderStripPreview(option.count, option.layout)}
            <button
              onClick={() => handleSelect(option.count)}
              className="px-10 sm:px-12 md:px-16 py-3 sm:py-4 md:py-5 text-xl sm:text-2xl md:text-3xl font-bold text-white border-3 sm:border-4 border-[#FFD700] rounded-full hover:bg-[#FFD700] hover:text-[#1a1aff] transition-colors"
            >
              {option.label}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}