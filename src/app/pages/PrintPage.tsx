import { useNavigate } from 'react-router';
import { usePhotobooth } from '../context/PhotoboothContext';
import PhotoStrip from '../components/PhotoStrip';

export default function PrintPage() {
  const navigate = useNavigate();
  const { printQuantity, setPrintQuantity, selectedBackground, selectedSticker } = usePhotobooth();

  const handlePrint = () => {
    // Mock print functionality
    console.log(`Printing ${printQuantity} copies...`);
    // In a real implementation, this would send to the printer driver
    alert(`Printing ${printQuantity} copies...`);
    navigate('/send-email');
  };

  const increment = () => {
    setPrintQuantity(printQuantity + 1);
  };

  const decrement = () => {
    if (printQuantity > 0) {
      setPrintQuantity(printQuantity - 1);
    }
  };

  return (
    <div className="size-full flex flex-col lg:flex-row bg-[#1a1aff] text-white p-4 sm:p-6 md:p-8 gap-6 md:gap-8 overflow-auto">
      <div className="flex-1 flex items-center justify-center min-h-[300px] lg:min-h-0">
        <PhotoStrip background={selectedBackground} sticker={selectedSticker} />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-8 sm:gap-10 md:gap-12 py-6 sm:py-8">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center px-4">Mau print berapa lembar?</h2>
        <div className="flex items-center gap-4 sm:gap-6 md:gap-8">
          <button
            onClick={decrement}
            disabled={printQuantity === 0}
            className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 text-4xl sm:text-5xl md:text-6xl font-bold text-white border-3 sm:border-4 border-[#FFD700] rounded-full hover:bg-[#FFD700] hover:text-[#1a1aff] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            -
          </button>
          <div className="w-28 h-20 sm:w-32 sm:h-24 md:w-40 md:h-28 text-5xl sm:text-6xl md:text-7xl font-bold flex items-center justify-center border-3 sm:border-4 border-[#FFD700] rounded-xl sm:rounded-2xl bg-white/10">
            {printQuantity}
          </div>
          <button
            onClick={increment}
            className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 text-4xl sm:text-5xl md:text-6xl font-bold text-white border-3 sm:border-4 border-[#FFD700] rounded-full hover:bg-[#FFD700] hover:text-[#1a1aff] transition-all active:scale-95"
          >
            +
          </button>
        </div>
        <button
          onClick={handlePrint}
          className="px-16 sm:px-20 md:px-24 py-6 sm:py-7 md:py-8 text-3xl sm:text-4xl md:text-5xl font-bold text-white border-3 sm:border-4 border-[#FFD700] rounded-full hover:bg-[#FFD700] hover:text-[#1a1aff] transition-all active:scale-95 shadow-lg"
        >
          Print!!!
        </button>
      </div>
    </div>
  );
}