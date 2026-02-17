import { useNavigate } from 'react-router';

export default function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="size-full flex flex-col items-center justify-center bg-[#1a1aff] text-white px-4 sm:px-6 md:px-8">
      <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[120px] font-bold tracking-wider mb-3 sm:mb-4 uppercase text-center" style={{ fontFamily: 'Impact, serif', letterSpacing: '0.1em' }}>
        Photobooth
      </h1>
      <div className="text-xl sm:text-2xl md:text-3xl mb-10 sm:mb-12 md:mb-16">
        <span className="text-white">by </span>
        <span className="text-[#FFD700] font-bold">fotoKAN</span>
      </div>
      <button
        onClick={() => navigate('/choose-photos')}
        className="px-16 sm:px-20 md:px-24 lg:px-28 py-5 sm:py-6 md:py-7 text-3xl sm:text-4xl md:text-5xl font-bold text-white border-4 sm:border-5 md:border-[6px] border-[#FFD700] rounded-full hover:bg-[#FFD700] hover:text-[#1a1aff] transition-all active:scale-95 shadow-2xl"
      >
        Start
      </button>
    </div>
  );
}