import { createContext, useContext, useState, ReactNode } from 'react';

interface PhotoboothState {
  photoCount: number;
  setPhotoCount: (count: number) => void;
  capturedPhotos: string[];
  setCapturedPhotos: (photos: string[]) => void;
  addCapturedPhoto: (photo: string) => void;
  selectedBackground: string;
  setSelectedBackground: (bg: string) => void;
  selectedSticker: string;
  setSelectedSticker: (sticker: string) => void;
  printQuantity: number;
  setPrintQuantity: (quantity: number) => void;
  /** Rendered photo strip as PNG data URL, ready for printing */
  stripDataUrl: string;
  setStripDataUrl: (url: string) => void;
  resetSession: () => void;
}

const PhotoboothContext = createContext<PhotoboothState | undefined>(undefined);

export function PhotoboothProvider({ children }: { children: ReactNode }) {
  const [photoCount, setPhotoCount] = useState(4);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [selectedBackground, setSelectedBackground] = useState('none');
  const [selectedSticker, setSelectedSticker] = useState('star');
  const [printQuantity, setPrintQuantity] = useState(1);
  const [stripDataUrl, setStripDataUrl] = useState('');

  const addCapturedPhoto = (photo: string) => {
    setCapturedPhotos(prev => [...prev, photo]);
  };

  const resetSession = () => {
    setPhotoCount(4);
    setCapturedPhotos([]);
    setSelectedBackground('none');
    setSelectedSticker('star');
    setPrintQuantity(1);
    setStripDataUrl('');
  };

  return (
    <PhotoboothContext.Provider
      value={{
        photoCount,
        setPhotoCount,
        capturedPhotos,
        setCapturedPhotos,
        addCapturedPhoto,
        selectedBackground,
        setSelectedBackground,
        selectedSticker,
        setSelectedSticker,
        printQuantity,
        setPrintQuantity,
        stripDataUrl,
        setStripDataUrl,
        resetSession,
      }}
    >
      {children}
    </PhotoboothContext.Provider>
  );
}

export function usePhotobooth() {
  const context = useContext(PhotoboothContext);
  if (!context) {
    throw new Error('usePhotobooth must be used within PhotoboothProvider');
  }
  return context;
}
