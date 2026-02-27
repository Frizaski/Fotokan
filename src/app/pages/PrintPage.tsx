import { useNavigate } from 'react-router';
import { usePhotobooth } from '../context/PhotoboothContext';
import PhotoStrip from '../components/PhotoStrip';
import { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import {
  connectQZ,
  isQZConnected,
  listPrinters,
  getDefaultPrinter,
  printStrip,
  getPrintSize,
} from '../utils/qzPrint';

interface SpecialFrame {
  id: string;
  name: string;
  slot: number;
  design_1x3: string;
  design_1x4: string;
  design_2x3: string;
}

interface SpecialSticker {
  id: string;
  name: string;
  slot: number;
  design_1x3: string;
  design_1x4: string;
  design_2x3: string;
}

type PrintStatus = 'idle' | 'connecting' | 'printing' | 'done' | 'error';

export default function PrintPage() {
  const navigate = useNavigate();
  const {
    printQuantity,
    setPrintQuantity,
    selectedBackground,
    selectedSticker,
    stripDataUrl,
    photoCount,
  } = usePhotobooth();

  const [specialFrames, setSpecialFrames] = useState<SpecialFrame[]>([]);
  const [specialStickers, setSpecialStickers] = useState<SpecialSticker[]>([]);

  // QZ Tray state
  const [qzConnected, setQzConnected] = useState(false);
  const [printers, setPrinters] = useState<string[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState('');
  const [printStatus, setPrintStatus] = useState<PrintStatus>('idle');
  const [printError, setPrintError] = useState('');

  const printSize = getPrintSize(photoCount);

  // Fetch special frames / stickers
  useEffect(() => {
    apiFetch('/api/special-frames').then(r => r.json()).then(setSpecialFrames).catch(() => {});
    apiFetch('/api/special-stickers').then(r => r.json()).then(setSpecialStickers).catch(() => {});
  }, []);

  // Connect to QZ Tray on mount
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        setPrintStatus('connecting');
        await connectQZ();
        if (cancelled) return;
        setQzConnected(true);

        const allPrinters = await listPrinters();
        if (cancelled) return;
        setPrinters(allPrinters);

        const defaultPrinter = await getDefaultPrinter();
        if (cancelled) return;
        setSelectedPrinter(defaultPrinter);
        setPrintStatus('idle');
      } catch (err) {
        if (cancelled) return;
        console.warn('QZ Tray connection failed:', err);
        setQzConnected(false);
        setPrintStatus('idle');
      }
    };
    init();
    return () => { cancelled = true; };
  }, []);

  const handlePrint = async () => {
    if (!stripDataUrl) {
      setPrintError('Strip belum di-render. Kembali ke halaman customize.');
      setPrintStatus('error');
      return;
    }

    if (!qzConnected) {
      // Try to reconnect
      try {
        setPrintStatus('connecting');
        await connectQZ();
        setQzConnected(true);
        const allPrinters = await listPrinters();
        setPrinters(allPrinters);
        if (!selectedPrinter) {
          const def = await getDefaultPrinter();
          setSelectedPrinter(def);
        }
      } catch {
        setPrintError('Tidak bisa terhubung ke QZ Tray. Pastikan QZ Tray sudah diinstall dan berjalan.');
        setPrintStatus('error');
        return;
      }
    }

    try {
      setPrintStatus('printing');
      setPrintError('');
      await printStrip({
        imageDataUrl: stripDataUrl,
        copies: printQuantity,
        photoCount,
        printerName: selectedPrinter || undefined,
      });
      setPrintStatus('done');
      // Auto-navigate after a short delay
      setTimeout(() => navigate('/send-email'), 2000);
    } catch (err: any) {
      console.error('Print failed:', err);
      setPrintError(err?.message || 'Gagal mencetak. Periksa printer dan QZ Tray.');
      setPrintStatus('error');
    }
  };

  const increment = () => setPrintQuantity(printQuantity + 1);
  const decrement = () => {
    if (printQuantity > 0) setPrintQuantity(printQuantity - 1);
  };

  return (
    <div className="size-full flex flex-col bg-[#1a1aff] text-white overflow-hidden">
      {/* Header bar */}
      <div className="w-full flex items-center gap-3 px-4 sm:px-6 md:px-8 py-4 sm:py-5 flex-shrink-0">
        <div className="bg-[#ffffff] rounded-sm px-1 py-1 flex items-center justify-center shadow-2xl">
          <img src="/logo.png" className="w-18 h-10" alt="Logo" />
        </div>
        <p className="text-sm sm:text-base text-white/80" style={{ fontFamily: "'Poppins', sans-serif" }}>
          Photobooth by <span className="text-[#FFD700] font-bold">fotoKAN</span> – bring the moment with you
        </p>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 md:gap-8 p-4 sm:p-6 md:p-8 overflow-auto min-h-0">
        {/* Left: Photo Strip Preview */}
        <div className="flex-1 flex items-center justify-center min-h-[300px] lg:min-h-0">
          <PhotoStrip
            background={selectedBackground}
            sticker={selectedSticker}
            specialFrames={specialFrames}
            specialStickers={specialStickers}
          />
        </div>

        {/* Right: Print Controls */}
        <div className="flex-1 flex flex-col items-center justify-center gap-6 sm:gap-8 py-4 sm:py-6">
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-center px-4"
            style={{ fontFamily: "'Oilvare Base', sans-serif" }}
          >
            Mau print berapa lembar?
          </h2>

          {/* Quantity selector */}
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

          {/* Print size info */}
          <div className="text-center bg-white/10 backdrop-blur-sm px-6 py-3 rounded-xl border-2 border-[#FFD700]/40">
            <p className="text-sm sm:text-base text-white/70 mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Ukuran cetak
            </p>
            <p className="text-lg sm:text-xl font-bold text-[#FFD700]" style={{ fontFamily: "'Poppins', sans-serif" }}>
              {printSize.widthCm} cm × {printSize.heightCm} cm
            </p>
          </div>

          {/* Printer selector */}
          {printers.length > 0 && (
            <div className="w-full max-w-sm">
              <label className="text-sm text-white/70 mb-1 block text-center" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Printer
              </label>
              <select
                value={selectedPrinter}
                onChange={(e) => setSelectedPrinter(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border-2 border-[#FFD700]/60 rounded-xl text-white text-center text-base sm:text-lg font-semibold appearance-none cursor-pointer focus:outline-none focus:border-[#FFD700]"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                {printers.map((p) => (
                  <option key={p} value={p} className="bg-[#1a1aff] text-white">
                    {p}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* QZ Tray status */}
          <div className="flex items-center gap-2 text-sm">
            <div
              className={`w-3 h-3 rounded-full ${
                qzConnected ? 'bg-green-400' : 'bg-red-400 animate-pulse'
              }`}
            />
            <span className="text-white/60" style={{ fontFamily: "'Poppins', sans-serif" }}>
              {qzConnected
                ? `QZ Tray terhubung${selectedPrinter ? ` — ${selectedPrinter}` : ''}`
                : 'QZ Tray tidak terdeteksi'}
            </span>
          </div>

          {/* Error message */}
          {printError && (
            <div className="bg-red-500/20 border border-red-400 rounded-xl px-6 py-3 max-w-md text-center">
              <p className="text-red-200 text-sm sm:text-base" style={{ fontFamily: "'Poppins', sans-serif" }}>
                {printError}
              </p>
            </div>
          )}

          {/* Status message for printing/done */}
          {printStatus === 'printing' && (
            <div className="bg-yellow-500/20 border border-yellow-400 rounded-xl px-6 py-3 text-center">
              <p className="text-yellow-200 text-lg font-semibold animate-pulse" style={{ fontFamily: "'Poppins', sans-serif" }}>
                ⏳ Mencetak {printQuantity} lembar...
              </p>
            </div>
          )}
          {printStatus === 'done' && (
            <div className="bg-green-500/20 border border-green-400 rounded-xl px-6 py-3 text-center">
              <p className="text-green-200 text-lg font-semibold" style={{ fontFamily: "'Poppins', sans-serif" }}>
                ✅ Berhasil dicetak!
              </p>
            </div>
          )}

          {/* Print button */}
          <button
            onClick={handlePrint}
            disabled={printStatus === 'printing' || printStatus === 'connecting' || printQuantity === 0}
            className="px-16 sm:px-20 md:px-24 py-6 sm:py-7 md:py-8 text-3xl sm:text-4xl md:text-5xl font-bold text-white border-3 sm:border-4 border-[#FFD700] rounded-full hover:bg-[#FFD700] hover:text-[#1a1aff] transition-all active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            {printStatus === 'connecting'
              ? 'Menghubungkan...'
              : printStatus === 'printing'
                ? 'Mencetak...'
                : 'Print!!!'}
          </button>

          {/* Skip button */}
          <button
            onClick={() => navigate('/send-email')}
            className="text-white/50 hover:text-white/80 text-base sm:text-lg underline underline-offset-4 transition-colors"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Lewati &amp; lanjut tanpa print
          </button>
        </div>
      </div>
    </div>
  );
}