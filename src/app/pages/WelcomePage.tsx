import { useNavigate } from 'react-router';
import { Mail, Instagram } from 'lucide-react';

export default function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="size-full flex flex-col bg-[#1a1aff] text-white px-4 sm:px-6 md:px-8 py-6 sm:py-8">
      {/* Header bar */}
      <div className="w-full flex items-center gap-3 mb-auto">
        <div className="bg-[#ffffff] rounded-sm px-1 py-1 flex items-center justify-center shadow-2xl">
          <img src="/logo.png" className="w-18 h-10" alt="Logo" />
        </div>
        <p className="text-sm sm:text-base text-white/80" style={{ fontFamily: "'Poppins', sans-serif" }}>
          Photobooth by <span className="text-[#FFD700] font-bold">fotoKAN</span> – bring the moment with you
        </p>
      </div>

      {/* Center content */}
      <div className="flex flex-col items-center justify-center flex-1">
        <h1
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-normal text-center leading-tight mb-10 sm:mb-14 md:mb-16"
          style={{ fontFamily: "'Oilvare Base', sans-serif" }}
        >
          Let's capture<br />your memories,<br />are you ready?
        </h1>

        <button
          onClick={() => navigate('/choose-photos')}
          className="px-20 sm:px-28 md:px-32 py-5 sm:py-6 md:py-7 text-3xl sm:text-4xl md:text-5xl font-bold text-white border-4 sm:border-[5px] border-[#FFD700] rounded-2xl hover:bg-[#FFD700] hover:text-[#1a1aff] transition-all active:scale-95"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          Let's go
        </button>
      </div>

      {/* Footer */}
      <div className="w-full flex flex-col items-center gap-2 pb-2 text-white/80 text-base sm:text-lg" style={{ fontFamily: "'Poppins', sans-serif" }}>
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