/**
 * QZ Tray printing utility for fotoKAN Photobooth.
 *
 * Manages connection to the locally-installed QZ Tray desktop app
 * and sends photo-strip images to the printer at the correct physical size.
 *
 * Print sizes:
 *   1×3 / 1×4  →  5 cm × 15 cm   (≈ 1.97 in × 5.91 in)
 *   2×3         →  9.5 cm × 15 cm (≈ 3.74 in × 5.91 in)
 */
import qz from 'qz-tray';
import { apiFetch } from './api';

/* ── Security: Certificate & Signing ──────────────────────── */

let securityConfigured = false;

/**
 * Configure QZ Tray security using the backend's certificate
 * and signing endpoint. This enables "Remember this decision"
 * in QZ Tray dialogs.
 */
function configureQZSecurity(): void {
  if (securityConfigured) return;

  qz.security.setCertificatePromise(
    (resolve: (cert: string) => void, reject: (err: Error) => void) => {
      apiFetch('/api/qz/cert')
        .then((resp) => {
          if (!resp.ok) throw new Error('Failed to fetch QZ certificate');
          return resp.text();
        })
        .then(resolve)
        .catch(reject);
    }
  );

  qz.security.setSignatureAlgorithm('SHA512');

  qz.security.setSignaturePromise(
    (toSign: string) => (resolve: (sig: string) => void, reject: (err: Error) => void) => {
      apiFetch('/api/qz/sign', {
        method: 'POST',
        body: JSON.stringify({ request: toSign }),
      })
        .then((resp) => {
          if (!resp.ok) throw new Error('Failed to sign QZ request');
          return resp.json();
        })
        .then((data: { signature: string }) => resolve(data.signature))
        .catch(reject);
    }
  );

  securityConfigured = true;
}

/* ── Connection helpers ───────────────────────────────────── */

/** Connect to QZ Tray (no-op if already connected) */
export async function connectQZ(): Promise<void> {
  configureQZSecurity();
  if (qz.websocket.isActive()) return;
  await qz.websocket.connect();
}

/** Disconnect from QZ Tray */
export async function disconnectQZ(): Promise<void> {
  if (qz.websocket.isActive()) {
    await qz.websocket.disconnect();
  }
}

/** Check if QZ Tray is available */
export function isQZConnected(): boolean {
  return qz.websocket.isActive();
}

/* ── Printer discovery ────────────────────────────────────── */

/** List all available printers */
export async function listPrinters(): Promise<string[]> {
  await connectQZ();
  return qz.printers.find() as Promise<string[]>;
}

/** Find the default printer */
export async function getDefaultPrinter(): Promise<string> {
  await connectQZ();
  return qz.printers.getDefault() as Promise<string>;
}

/* ── Print dimensions ─────────────────────────────────────── */

interface PrintSize {
  widthInches: number;
  heightInches: number;
  widthCm: number;
  heightCm: number;
}

/** Get the physical print size based on photo count */
export function getPrintSize(photoCount: number): PrintSize {
  if (photoCount === 6) {
    // 2×3 layout: 9.5 cm × 15 cm
    return {
      widthCm: 9.5,
      heightCm: 15,
      widthInches: 9.5 / 2.54,   // ≈ 3.74
      heightInches: 15 / 2.54,   // ≈ 5.91
    };
  }
  // 1×3 or 1×4 layout: 5 cm × 15 cm
  return {
    widthCm: 5,
    heightCm: 15,
    widthInches: 5 / 2.54,     // ≈ 1.97
    heightInches: 15 / 2.54,   // ≈ 5.91
  };
}

/* ── Main print function ──────────────────────────────────── */

export interface PrintOptions {
  /** Base64 data URL of the rendered photo strip (image/png) */
  imageDataUrl: string;
  /** Number of copies to print */
  copies: number;
  /** photoCount determines the print size (3 or 4 → narrow, 6 → wide) */
  photoCount: number;
  /** Specific printer name (uses default if omitted) */
  printerName?: string;
}

/**
 * Send the photo strip to the printer via QZ Tray.
 * Uses pixel-mode printing with explicit physical dimensions so the
 * driver scales the image to the exact cm size required.
 */
export async function printStrip(options: PrintOptions): Promise<void> {
  const { imageDataUrl, copies, photoCount, printerName } = options;

  await connectQZ();

  const printer = printerName || (await getDefaultPrinter());
  const size = getPrintSize(photoCount);

  // Strip the data-URL prefix → raw base64
  const base64 = imageDataUrl.replace(/^data:image\/\w+;base64,/, '');

  const config = qz.configs.create(printer, {
    size: {
      width: size.widthInches,
      height: size.heightInches,
    },
    units: 'in',
    scaleContent: true,       // scale image to fit the defined size
    rasterize: true,           // force raster for consistent output
    interpolation: 'bicubic',  // better quality scaling
    copies: copies,
    colorType: 'color',
    duplex: false,
    margins: { top: 0, right: 0, bottom: 0, left: 0 },
    orientation: 'portrait',
  });

  const data = [
    {
      type: 'pixel',
      format: 'image',
      flavor: 'base64',
      data: base64,
    },
  ];

  await qz.print(config, data);
}
