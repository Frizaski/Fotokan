import { useNavigate } from 'react-router';
import { usePhotobooth } from '../context/PhotoboothContext';

export default function ChoosePhotosPage() {
  const navigate = useNavigate();
  const { setPhotoCount } = usePhotobooth();

  const handleSelect = (count: number) => {
    setPhotoCount(count);
    navigate('/camera-preview');
  };

  const options = [
    { count: 3, label: '3 foto' },
    { count: 4, label: '4 foto' },
    { count: 6, label: '6 foto' },
  ];

  const renderStripPreview = (count: number) => {
    return (
      <div className="w-48 h-56 sm:w-64 sm:h-72 md:w-80 md:h-96 bg-gray-800 rounded-lg p-3 sm:p-4 flex flex-col justify-between border-3 sm:border-4 border-white shadow-xl">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex-1 bg-gray-600 rounded border-2 border-white mx-1 sm:mx-2 my-0.5 sm:my-1" />
        ))}
        <div className="text-center text-white text-xs mt-1 sm:mt-2">by fotoKAN</div>
      </div>
    );
  };

  return (
    <div className="size-full flex flex-col items-center justify-center bg-[#1a1aff] text-white px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-12 overflow-auto">
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 sm:mb-12 md:mb-16 text-center">Pilih jumlah foto</h2>
      <div className="flex flex-col sm:flex-row gap-8 sm:gap-10 md:gap-12 lg:gap-16 items-center">
        {options.map((option) => (
          <div key={option.count} className="flex flex-col items-center gap-4 sm:gap-6 md:gap-8">
            {renderStripPreview(option.count)}
            <button
              onClick={() => handleSelect(option.count)}
              className="px-10 sm:px-12 md:px-16 py-4 sm:py-5 md:py-6 text-2xl sm:text-2xl md:text-3xl font-bold text-white border-3 sm:border-4 border-[#FFD700] rounded-full hover:bg-[#FFD700] hover:text-[#1a1aff] transition-colors"
            >
              {option.label}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}