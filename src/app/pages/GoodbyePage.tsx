import { useNavigate } from 'react-router';
import { Mail, Instagram } from 'lucide-react';
import { usePhotobooth } from '../context/PhotoboothContext';

export default function GoodbyePage() {
  const navigate = useNavigate();
  const { resetSession } = usePhotobooth();

  const handleRestart = () => {
    resetSession();
    navigate('/');
  };

  return (
    <div className="size-full flex flex-col bg-[#1a1aff] text-white overflow-hidden">
      <div className="w-full flex items-center gap-3 px-4 sm:px-6 md:px-8 py-4 sm:py-5 flex-shrink-0">
        <div className="bg-[#ffffff] rounded-sm px-1 py-1 flex items-center justify-center shadow-2xl">
          <img src="/logo.png" className="w-18 h-10" alt="Logo" />
        </div>
        <p className="text-sm sm:text-base text-white/80" style={{ fontFamily: "'Poppins', sans-serif" }}>
          Photobooth by <span className="text-[#FFD700] font-bold">fotoKAN</span> – bring the moment with you
        </p>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 min-h-0">
      <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[90px] font-bold tracking-wider mb-3 sm:mb-4 text-center uppercase" style={{ fontFamily: "'Oilvare Base', sans-serif", letterSpacing: '0.05em' }}>
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
      {/* Footer */}
      <div className="w-full flex flex-col items-center gap-2 pb-4 text-white/80 text-base sm:text-lg flex-shrink-0" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <span className="inline-flex items-center gap-2">
          <Mail className="h-5 w-5 text-[#FFD700]" aria-hidden="true" />
          <span>fotoKAN3@gmail.com</span>
        </span>
        <span className="inline-flex items-center gap-2">
          <Instagram className="h-5 w-5 text-[#FFD700]" aria-hidden="true" />
          <span>@fotokans_</span>
        </span>
      </div>
    </div>
  );
}