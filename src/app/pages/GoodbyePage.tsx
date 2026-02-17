import { useNavigate } from 'react-router';
import { usePhotobooth } from '../context/PhotoboothContext';

export default function GoodbyePage() {
  const navigate = useNavigate();
  const { resetSession } = usePhotobooth();

  const handleRestart = () => {
    resetSession();
    navigate('/');
  };

  return (
    <div className="size-full flex flex-col items-center justify-center bg-[#1a1aff] text-white px-4 sm:px-6 md:px-8">
      <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[90px] font-bold tracking-wider mb-3 sm:mb-4 text-center uppercase" style={{ fontFamily: 'Impact, serif', letterSpacing: '0.05em' }}>
        Sampai Jumpa Lagi
      </h1>
      <div className="text-xl sm:text-2xl md:text-3xl mb-10 sm:mb-12 md:mb-16">
        <span className="text-white">by </span>
        <span className="text-[#FFD700] font-bold">fotoKAN</span>
      </div>
      <button
        onClick={handleRestart}
        className="px-12 sm:px-16 md:px-20 lg:px-24 py-5 sm:py-6 md:py-7 text-2xl sm:text-3xl md:text-4xl font-bold text-white border-4 sm:border-5 md:border-[6px] border-[#FFD700] rounded-full hover:bg-[#FFD700] hover:text-[#1a1aff] transition-all active:scale-95 shadow-2xl"
      >
        Ayo foto lagi
      </button>
    </div>
  );
}