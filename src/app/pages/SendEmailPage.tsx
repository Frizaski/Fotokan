import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { usePhotobooth } from '../context/PhotoboothContext';
import PhotoStrip from '../components/PhotoStrip';
import GifPreview from '../components/GifPreview';
import { apiFetch } from '../utils/api';
// @ts-ignore
import gifshot from 'gifshot';

export default function SendEmailPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [gifUrl, setGifUrl] = useState<string>('');
  const [isGeneratingGif, setIsGeneratingGif] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string>('');
  const [gifReady, setGifReady] = useState(false);
  const [photosForPreview, setPhotosForPreview] = useState<string[]>([]);
  const { selectedBackground, selectedSticker, capturedPhotos } = usePhotobooth();

  // Generate GIF when component mounts
  useEffect(() => {
    const photosToUse = capturedPhotos.length > 0 ? capturedPhotos : generateDemoPhotos();
    setPhotosForPreview(photosToUse);
    generateGif(photosToUse);
  }, []);

  const generateDemoPhotos = (): string[] => {
    console.log('No captured photos found - generating demo photos for preview');
    return Array.from({ length: 4 }, (_, i) => {
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Create gradient backgrounds
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        const colors = [
          ['#FF6B6B', '#FFD93D'],
          ['#6BCB77', '#4D96FF'],
          ['#FFB6B9', '#FEC8D8'],
          ['#A8E6CF', '#DCEDC1']
        ];
        gradient.addColorStop(0, colors[i][0]);
        gradient.addColorStop(1, colors[i][1]);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add photo number
        ctx.fillStyle = 'white';
        ctx.font = 'bold 72px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 4;
        ctx.strokeText(`Photo ${i + 1}`, canvas.width / 2, canvas.height / 2);
        ctx.fillText(`Photo ${i + 1}`, canvas.width / 2, canvas.height / 2);
        
        ctx.font = '32px Arial';
        ctx.strokeText('🎭 Demo Mode', canvas.width / 2, canvas.height / 2 + 80);
        ctx.fillText('🎭 Demo Mode', canvas.width / 2, canvas.height / 2 + 80);
      }
      return canvas.toDataURL('image/jpeg', 0.9);
    });
  };

  const generateGif = async (photos: string[]) => {
    if (photos.length === 0) {
      console.warn('No photos to generate GIF');
      setIsGeneratingGif(false);
      return;
    }

    setIsGeneratingGif(true);
    setGifReady(false);
    console.log(`Starting GIF generation with ${photos.length} photos`);
    
    try {
      // Use gifshot library to create animated GIF for email attachment
      // frameDuration unit: 1/10th of a second. 10 = 1s per frame.
      // Preview cycles every 1000ms, so GIF should match.
      gifshot.createGIF({
        images: photos,
        gifWidth: 300,
        gifHeight: 225,
        frameDuration: 10, // 10 × 0.1s = 1 second per frame (matches preview)
        numWorkers: 2,
        sampleInterval: 10,
      }, (obj: any) => {
        if (!obj.error) {
          setGifUrl(obj.image);
          setIsGeneratingGif(false);
          setGifReady(true);
          console.log('GIF generated successfully');
        } else {
          console.error('GIF generation error:', obj.error);
          setIsGeneratingGif(false);
        }
      });
    } catch (error) {
      console.error('Error generating GIF:', error);
      setIsGeneratingGif(false);
    }
  };

  // Resize a photo to max 400px wide at quality 0.65 to reduce payload size
  const resizePhotoForEmail = (dataUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = 400;
        const scale = Math.min(1, maxW / img.width);
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.65));
      };
      img.src = dataUrl;
    });
  };

  const handleSend = async () => {
    if (!email) {
      alert('Please enter an email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address');
      return;
    }

    if (!gifUrl) {
      alert('GIF is not ready yet, please wait...');
      return;
    }

    setIsSending(true);
    setSendError('');
    
    try {
      // Resize individual photos to reduce payload size before sending
      const resizedPhotos = await Promise.all(photosForPreview.map(resizePhotoForEmail));

      const response = await apiFetch('/api/email/send', {
        method: 'POST',
        body: JSON.stringify({
          email,
          gifBase64: gifUrl,
          photos: resizedPhotos,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        let message = `Gagal mengirim email (kode ${response.status}). Periksa konfigurasi server.`;
        if (response.status === 405) {
          message = 'Layanan email belum aktif di server (405). Hubungi admin server.';
        }
        try {
          const json = JSON.parse(text);
          if (json.error) message = json.error;
        } catch { /* response bukan JSON (misal HTML nginx), pakai pesan default */ }
        throw new Error(message);
      }

      const data = await response.json();

      console.log('Email sent successfully:', data);
      if (data.previewUrl) {
        console.log('Ethereal preview:', data.previewUrl);
      }

      navigate('/goodbye');
    } catch (err: any) {
      // Keep UI clean on kiosk: show inline error without noisy stack traces.
      setSendError(err.message || 'Gagal mengirim email. Coba lagi.');
    } finally {
      setIsSending(false);
    }
  };

  const keys = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', '@'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm', '.', '_'],
  ];

  const handleKeyClick = (key: string) => {
    setEmail(prev => prev + key);
  };

  const handleBackspace = () => {
    setEmail(prev => prev.slice(0, -1));
  };

  const handleSpace = () => {
    setEmail(prev => prev + ' ');
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
      <div className="flex-1 flex flex-col lg:flex-row p-4 sm:p-6 md:p-8 gap-6 md:gap-8 overflow-auto min-h-0">
      {/* LEFT COLUMN: Email Input, Keyboard, Send Button */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 sm:gap-6 px-4 sm:px-8 md:px-12 min-h-0">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center" style={{ fontFamily: "'Oilvare Base', sans-serif" }}>
          Enter your email to receive
        </h2>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-2 sm:mb-4" style={{ fontFamily: "'Oilvare Base', sans-serif" }}>
          your GIF
        </h2>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@gmail.com"
          autoFocus
          className="w-full max-w-2xl px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 text-lg sm:text-xl md:text-2xl text-[#1a1aff] bg-white border-[6px] sm:border-[8px] border-[#FFD700] rounded-full text-center font-bold placeholder:text-gray-400"
        />
        <div className="w-full max-w-2xl">
          <div className="flex flex-col gap-1.5 sm:gap-2">
            {keys.map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-1.5 sm:gap-2 justify-center">
                {row.map((key) => (
                  <button
                    key={key}
                    onClick={() => handleKeyClick(key)}
                    className="px-2 sm:px-3 py-2 sm:py-3 min-w-[40px] sm:min-w-[50px] md:min-w-[55px] text-base sm:text-lg font-bold text-white border-[4px] sm:border-[6px] border-[#FFD700] rounded-md sm:rounded-lg hover:bg-[#FFD700] hover:text-[#1a1aff] transition-colors active:scale-95"
                  >
                    {key}
                  </button>
                ))}
              </div>
            ))}
            <div className="flex gap-1.5 sm:gap-2 justify-center mt-1 sm:mt-2">
              <button
                onClick={handleSpace}
                className="px-4 sm:px-6 py-2 sm:py-3 min-w-[150px] sm:min-w-[200px] text-base sm:text-lg font-bold text-white border-[4px] sm:border-[6px] border-[#FFD700] rounded-md sm:rounded-lg hover:bg-[#FFD700] hover:text-[#1a1aff] transition-colors active:scale-95"
              >
                Space
              </button>
              <button
                onClick={handleBackspace}
                className="px-4 sm:px-6 py-2 sm:py-3 min-w-[120px] sm:min-w-[150px] text-base sm:text-lg font-bold text-white border-[4px] sm:border-[6px] border-[#FFD700] rounded-md sm:rounded-lg hover:bg-[#FFD700] hover:text-[#1a1aff] transition-colors active:scale-95"
              >
                ← Delete
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2 sm:mt-4">
          <button
            onClick={handleSend}
            disabled={isSending || isGeneratingGif}
            className="px-12 sm:px-16 md:px-20 py-4 sm:py-5 md:py-6 text-2xl sm:text-3xl md:text-4xl font-bold text-white border-[8px] sm:border-[10px] border-[#FFD700] rounded-full hover:bg-[#FFD700] hover:text-[#1a1aff] transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? 'Mengirim...' : isGeneratingGif ? 'Menyiapkan GIF...' : 'Kirim'}
          </button>
          <button
            onClick={() => navigate('/goodbye')}
            disabled={isSending}
            className="px-10 sm:px-14 py-4 sm:py-5 md:py-6 text-xl sm:text-2xl md:text-3xl font-bold text-white/70 border-[6px] sm:border-[8px] border-white/30 rounded-full hover:border-white hover:text-white transition-colors active:scale-95 disabled:opacity-50"
          >
            Lewati
          </button>
        </div>

        {sendError && (
          <div className="flex flex-col items-center gap-2 max-w-lg">
            <p className="text-red-300 text-sm sm:text-base text-center">{sendError}</p>
            <button
              onClick={() => navigate('/goodbye')}
              className="text-white/70 underline text-sm hover:text-white transition-colors"
            >
              Lewati dan lanjutkan →
            </button>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Strip Preview and GIF Preview (Side by Side) */}
      <div className="flex-1 flex items-center justify-center gap-4 sm:gap-6 md:gap-8 min-h-[250px] lg:min-h-0 px-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 md:gap-8">
          {/* GIF Preview */}
          <div className="flex flex-col items-center gap-3 sm:gap-4">
            <div className="border-[8px] sm:border-[10px] border-[#FFD700] rounded-lg p-2 bg-black/50 w-[250px] sm:w-[300px] md:w-[400px] h-[188px] sm:h-[225px] md:h-[300px] flex items-center justify-center overflow-hidden relative">
              <GifPreview photos={photosForPreview} isGenerating={isGeneratingGif} />
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm px-4 sm:px-6 py-2 sm:py-3 rounded-lg border-[4px] border-[#FFD700]">
              <p className="text-lg sm:text-xl font-bold">
                {isGeneratingGif ? 'Preparing...' : 'Animated GIF'}
                {!isGeneratingGif && ' ✓'}
              </p>
            </div>
          </div>

          {/* Photo Strip Preview */}
          <div className="flex flex-col items-center gap-3 sm:gap-4">
            <div className="scale-75 sm:scale-90 md:scale-100 border-[8px] sm:border-[10px] border-[#FFD700] rounded-lg p-2 bg-white/5">
              <PhotoStrip background={selectedBackground} sticker={selectedSticker} />
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm px-4 sm:px-6 py-2 sm:py-3 rounded-lg border-[4px] border-[#FFD700]">
              <p className="text-lg sm:text-xl font-bold">Photo Strip</p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}