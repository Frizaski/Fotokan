import { useNavigate } from 'react-router';

export default function DisclaimerPage() {
  const navigate = useNavigate();

  return (
    <div className="size-full flex flex-col bg-[#1a1aff] text-white px-4 sm:px-6 md:px-8 py-6 sm:py-8">
      {/* Header bar */}
      <div className="w-full flex items-center gap-3">
        <div className="bg-[#ffffff] rounded-sm px-1 py-1 flex items-center justify-center shadow-2xl">
          <img src="/logo.png" className="w-18 h-10" alt="Logo" />
        </div>
        <p className="text-sm sm:text-base text-white/80" style={{ fontFamily: "'Poppins', sans-serif" }}>
          Photobooth by <span className="text-[#FFD700] font-bold">fotoKAN</span> – bring the moment with you
        </p>
      </div>

      {/* Main content */}
      <div className="flex flex-1 items-center justify-center gap-8 sm:gap-12 md:gap-16 lg:gap-24 px-4 sm:px-8 md:px-16">
        {/* Left: placeholder image */}
        <div className="hidden sm:block flex-shrink-0 w-[40%] max-w-[500px]">
          <div className="w-full aspect-[4/3] bg-gray-800 rounded-2xl overflow-hidden flex items-center justify-center">
            <span className="text-6xl">📸</span>
          </div>
        </div>

        {/* Right: disclaimer text + button */}
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left max-w-md">
          <h1
            className="text-4xl sm:text-5xl md:text-6xl text-[#FFD700] italic font-normal mb-4 sm:mb-6"
            style={{ fontFamily: "'Oilvare Base', sans-serif" }}
          >
            Disclaimer:
          </h1>
          <p
            className="text-2xl sm:text-3xl md:text-4xl font-normal leading-snug mb-8 sm:mb-10 md:mb-12"
            style={{ fontFamily: "'Oilvare Base', sans-serif" }}
          >
            No retakes, be ready and strike your pose
          </p>
          <button
            onClick={() => navigate('/camera-preview')}
            className="px-16 sm:px-20 md:px-24 py-4 sm:py-5 md:py-6 text-2xl sm:text-3xl md:text-4xl font-bold text-white border-4 sm:border-[5px] border-[#FFD700] rounded-2xl hover:bg-[#FFD700] hover:text-[#1a1aff] transition-all active:scale-95"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Start
          </button>
        </div>
      </div>
    </div>
  );
}
