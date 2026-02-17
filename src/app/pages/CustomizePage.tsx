import { useNavigate } from 'react-router';
import { usePhotobooth } from '../context/PhotoboothContext';
import PhotoStrip from '../components/PhotoStrip';

export default function CustomizePage() {
  const navigate = useNavigate();
  const { selectedBackground, setSelectedBackground, selectedSticker, setSelectedSticker } = usePhotobooth();

  const backgrounds = [
    { name: 'yellow', label: 'Yellow', color: '#FFD700' },
    { name: 'blue', label: 'Blue', color: '#1E90FF' },
    { name: 'maroon', label: 'Maroon', color: '#800000' },
    { name: 'black', label: 'Black', color: '#000000' },
    { name: 'white', label: 'White', color: '#FFFFFF' },
    { name: 'babypink', label: 'Baby Pink', color: '#FFB6C1' },
  ];

  const stickers = [
    { name: 'star', label: 'Star' },
    { name: 'heart', label: 'Heart' },
    { name: 'bubble', label: 'Bubble' },
    { name: 'ribbon', label: 'Ribbon' },
    { name: 'cloud', label: 'Cloud' },
    { name: 'none', label: 'No sticker' },
  ];

  return (
    <div className="size-full flex flex-col lg:flex-row bg-[#1a1aff] text-white p-4 sm:p-6 md:p-8 gap-6 md:gap-8 lg:gap-12 overflow-auto">
      <div className="flex-1 flex items-center justify-center min-h-[300px] lg:min-h-0">
        <div className="flex flex-col items-center gap-4 sm:gap-6">
          <h2 className="text-2xl sm:text-3xl font-bold">Live Preview</h2>
          <PhotoStrip background={selectedBackground} sticker={selectedSticker} />
        </div>
      </div>
      <div className="w-full lg:w-[450px] xl:w-[550px] flex flex-col gap-6 sm:gap-8 md:gap-10 py-6 sm:py-8 md:py-12 overflow-y-auto">
        <div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-3">Background</h2>
          <p className="text-xl sm:text-2xl text-[#FFD700] mb-6 sm:mb-8">Special event</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {backgrounds.map((bg) => (
              <button
                key={bg.name}
                onClick={() => setSelectedBackground(bg.name)}
                className={`px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 text-base sm:text-lg md:text-xl font-bold rounded-xl sm:rounded-2xl border-3 sm:border-4 transition-all active:scale-95 ${
                  selectedBackground === bg.name
                    ? 'bg-[#FFD700] text-[#1a1aff] border-[#FFD700] scale-105 shadow-lg'
                    : 'text-white border-[#FFD700] hover:bg-[#FFD700]/20'
                }`}
              >
                {bg.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-3">Sticker</h2>
          <p className="text-xl sm:text-2xl text-[#FFD700] mb-6 sm:mb-8">Special event</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {stickers.map((sticker) => (
              <button
                key={sticker.name}
                onClick={() => setSelectedSticker(sticker.name)}
                className={`px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 text-base sm:text-lg md:text-xl font-bold rounded-xl sm:rounded-2xl border-3 sm:border-4 transition-all active:scale-95 ${
                  selectedSticker === sticker.name
                    ? 'bg-[#FFD700] text-[#1a1aff] border-[#FFD700] scale-105 shadow-lg'
                    : 'text-white border-[#FFD700] hover:bg-[#FFD700]/20'
                }`}
              >
                {sticker.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end mt-2 sm:mt-4">
          <button
            onClick={() => navigate('/print')}
            className="px-12 sm:px-16 md:px-20 py-5 sm:py-6 md:py-7 text-2xl sm:text-3xl md:text-4xl font-bold text-white border-4 sm:border-5 md:border-[6px] border-[#FFD700] rounded-full hover:bg-[#FFD700] hover:text-[#1a1aff] transition-all active:scale-95 shadow-xl"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}