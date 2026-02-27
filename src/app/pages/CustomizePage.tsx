import { useNavigate } from 'react-router';
import { usePhotobooth } from '../context/PhotoboothContext';
import PhotoStrip from '../components/PhotoStrip';

export default function CustomizePage() {
  const navigate = useNavigate();
  const { selectedBackground, setSelectedBackground, selectedSticker, setSelectedSticker } = usePhotobooth();

  const backgrounds = [
    { name: 'special1', label: 'Special\nevent 1' },
    { name: 'special2', label: 'Special\nevent 2' },
    { name: 'special3', label: 'Special\nevent 3' },
    { name: 'yellow', label: 'Yellow' },
    { name: 'blue', label: 'Blue' },
    { name: 'maroon', label: 'Maroon' },
    { name: 'black', label: 'Black' },
    { name: 'white', label: 'White' },
    { name: 'babypink', label: 'Baby Pink' },
  ];

  const stickers = [
    { name: 'special1', label: 'Special\nevent 1' },
    { name: 'special2', label: 'Special\nevent 2' },
    { name: 'special3', label: 'Special\nevent 3' },
    { name: 'star', label: 'Star' },
    { name: 'heart', label: 'Heart' },
    { name: 'bubble', label: 'Bubble' },
    { name: 'ribbon', label: 'Ribbon' },
    { name: 'cloud', label: 'Cloud' },
    { name: 'none', label: 'No sticker' },
  ];

  const OptionButton = ({
    selected,
    label,
    onClick,
  }: {
    selected: boolean;
    label: string;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`py-2.5 sm:py-3 text-sm sm:text-base font-semibold rounded-xl border-[3px] transition-all active:scale-95 whitespace-pre-line leading-tight ${
        selected
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
        <div className="bg-[#FFD700] rounded-lg px-2.5 py-1.5 flex items-center justify-center">
          <span className="text-sm font-bold text-[#1a1aff]">📷 fKa</span>
        </div>
        <p className="text-sm sm:text-base text-white/80" style={{ fontFamily: "'Poppins', sans-serif" }}>
          Photobooth by <span className="text-[#FFD700] font-bold">fotoKAN</span> – bring the moment with you
        </p>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row items-center lg:items-stretch gap-6 md:gap-8 lg:gap-10 px-4 sm:px-6 md:px-8 pb-6 overflow-auto">
        {/* Left: Photo Strip Preview */}
        <div className="flex items-center justify-center lg:w-[35%] xl:w-[30%] flex-shrink-0">
          <PhotoStrip background={selectedBackground} sticker={selectedSticker} />
        </div>

        {/* Center: Frame Color & Sticker options */}
        <div className="flex-1 flex flex-col gap-4 sm:gap-5 min-w-0 overflow-y-auto">
          {/* Frame Color */}
          <div>
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-normal mb-3 sm:mb-4 text-center lg:text-left"
              style={{ fontFamily: "'Oilvare Base', sans-serif" }}
            >
              Frame Color
            </h2>
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3 max-w-md mx-auto lg:mx-0">
              {backgrounds.map((bg) => (
                <OptionButton
                  key={bg.name}
                  selected={selectedBackground === bg.name}
                  label={bg.label}
                  onClick={() => setSelectedBackground(bg.name)}
                />
              ))}
            </div>
          </div>

          {/* Sticker */}
          <div>
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-normal mb-3 sm:mb-4 text-center lg:text-left"
              style={{ fontFamily: "'Oilvare Base', sans-serif" }}
            >
              Sticker
            </h2>
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3 max-w-md mx-auto lg:mx-0">
              {stickers.map((sticker) => (
                <OptionButton
                  key={sticker.name}
                  selected={selectedSticker === sticker.name}
                  label={sticker.label}
                  onClick={() => setSelectedSticker(sticker.name)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right: Next button */}
        <div className="flex items-center justify-center lg:w-auto flex-shrink-0">
          <button
            onClick={() => navigate('/print')}
            className="px-12 sm:px-14 md:px-16 py-4 sm:py-5 text-xl sm:text-2xl md:text-3xl font-semibold text-white border-[3px] sm:border-4 border-[#FFD700] rounded-2xl hover:bg-[#FFD700] hover:text-[#1a1aff] transition-all active:scale-95"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}