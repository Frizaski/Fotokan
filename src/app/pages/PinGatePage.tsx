import { useState, useRef, KeyboardEvent, ClipboardEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router";

export default function PinGatePage() {
  const { verifyPin } = useAuth();
  const navigate = useNavigate();

  const [pin, setPin] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // only digits
    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);
    setError("");

    // Auto-focus next
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").trim().slice(0, 4);
    const newPin = [...pin];
    for (let i = 0; i < paste.length; i++) {
      if (/\d/.test(paste[i])) newPin[i] = paste[i];
    }
    setPin(newPin);
    const focusIdx = Math.min(paste.length, 3);
    inputRefs.current[focusIdx]?.focus();
  };

  const handleSubmit = async () => {
    const fullPin = pin.join("");
    if (fullPin.length < 4) {
      setError("Masukkan 4 digit PIN");
      return;
    }

    setLoading(true);
    try {
      const result = await verifyPin(fullPin);
      if (result.success) {
        navigate("/");
      } else {
        setError(result.message || "PIN salah");
        setPin(["", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch {
      setError("Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="size-full flex flex-col bg-[#0f0f2e] text-white overflow-hidden">
      <div className="w-full flex items-center gap-3 px-4 sm:px-6 md:px-8 py-4 sm:py-5 flex-shrink-0">
        <div className="bg-[#ffffff] rounded-sm px-1 py-1 flex items-center justify-center shadow-2xl">
          <img src="/logo.png" className="w-18 h-10" alt="Logo" />
        </div>
        <p className="text-sm sm:text-base text-white/80" style={{ fontFamily: "'Poppins', sans-serif" }}>
          Photobooth by <span className="text-[#FFD700] font-bold">fotoKAN</span> – bring the moment with you
        </p>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 min-h-0">
      {/* Title */}
      <h1
        className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-wider mb-2 uppercase"
        style={{ fontFamily: "'Oilvare Base', sans-serif", letterSpacing: "0.1em" }}
      >
        Photobooth
      </h1>
      <div className="text-xl sm:text-2xl mb-10">
        <span className="text-white">by </span>
        <span className="text-[#FFD700] font-bold">fotoKAN</span>
      </div>

      {/* PIN Card */}
      <div className="bg-[#1a1a4a] rounded-2xl p-8 sm:p-10 w-full max-w-md shadow-2xl">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🔒</div>
          <p className="text-lg text-gray-300">Masukkan PIN untuk melanjutkan</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 text-center rounded-lg py-2 px-4 mb-4 text-sm">
            {error}
          </div>
        )}

        {/* PIN Inputs */}
        <div className="flex justify-center gap-3 sm:gap-4 mb-8">
          {pin.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={i === 0 ? handlePaste : undefined}
              autoFocus={i === 0}
              className="w-14 h-16 sm:w-16 sm:h-20 text-center text-3xl font-bold bg-[#12123a] border-2 border-gray-600 rounded-xl text-[#FFD700] outline-none focus:border-[#FFD700] transition-colors"
            />
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-4 text-xl font-bold bg-[#FFD700] text-[#0f0f2e] rounded-xl hover:bg-[#e6c200] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Memverifikasi..." : "Masuk"}
        </button>
      </div>
      </div>
    </div>
  );
}
