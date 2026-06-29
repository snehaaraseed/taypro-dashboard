/** Same asset as site home hero (globals.css `.home-hero-cover`). */
const INSIGHT_HERO_SRC = "/tayproasset/cover-solar-hero.webp";
const INSIGHT_LOGO_SRC = "/tayproasset/taypro-logo.webp";
/** Request a sharper wordmark via Next image optimizer (falls back to direct asset). */
const INSIGHT_LOGO_OPTIMIZED_W = 828;
const CACHE_VERSION = "20250630";
const LOGO_RASTER_PIXEL_RATIO = 3;

export type InsightHeroPdfAsset = {
  dataUrl: string;
  width: number;
  height: number;
  format: "PNG" | "JPEG" | "WEBP";
};

let heroLoadPromise: Promise<InsightHeroPdfAsset | null> | null = null;
let logoLoadPromise: Promise<InsightPdfLogo | null> | null = null;

export type InsightPdfLogo = {
  dataUrl: string;
  width: number;
  height: number;
  format: "PNG" | "JPEG" | "WEBP";
};

export type InsightPdfLogoRaster = {
  dataUrl: string;
  format: "PNG";
  widthPt: number;
  heightPt: number;
};

function imageFormatFromDataUrl(dataUrl: string): "PNG" | "JPEG" | "WEBP" {
  if (dataUrl.startsWith("data:image/png")) return "PNG";
  if (dataUrl.startsWith("data:image/webp")) return "WEBP";
  return "JPEG";
}

async function fetchImageDataUrl(path: string): Promise<string | null> {
  try {
    const response = await fetch(`${path}?v=${CACHE_VERSION}`);
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error(`Failed to decode ${path}`));
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

async function fetchInsightLogoDataUrl(): Promise<string | null> {
  const optimizedPath = `/_next/image?url=${encodeURIComponent(INSIGHT_LOGO_SRC)}&w=${INSIGHT_LOGO_OPTIMIZED_W}&q=95`;
  const optimized = await fetchImageDataUrl(optimizedPath);
  if (optimized) return optimized;
  return fetchImageDataUrl(INSIGHT_LOGO_SRC);
}

function measureImage(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error("Failed to measure hero image"));
    img.src = dataUrl;
  });
}

/** Site home-hero background for insight PDF cover (optional). */
export function loadInsightHeroForPdf(): Promise<InsightHeroPdfAsset | null> {
  if (!heroLoadPromise) {
    heroLoadPromise = (async () => {
      const dataUrl = await fetchImageDataUrl(INSIGHT_HERO_SRC);
      if (!dataUrl) return null;
      const { width, height } = await measureImage(dataUrl);
      return {
        dataUrl,
        width,
        height,
        format: imageFormatFromDataUrl(dataUrl),
      };
    })();
  }
  return heroLoadPromise;
}

/** Taypro wordmark for PDF cover (green/white, readable on dark hero). */
export function loadInsightPdfLogoForPdf(): Promise<InsightPdfLogo | null> {
  if (!logoLoadPromise) {
    logoLoadPromise = (async () => {
      const dataUrl = await fetchInsightLogoDataUrl();
      if (!dataUrl) return null;
      const { width, height } = await measureImage(dataUrl);
      return {
        dataUrl,
        width,
        height,
        format: imageFormatFromDataUrl(dataUrl),
      };
    })();
  }
  return logoLoadPromise;
}

/**
 * Rasterize logo at print-friendly resolution so jsPDF does not upscale a tiny bitmap.
 */
export function rasterizeInsightLogoForPdf(
  logo: InsightPdfLogo,
  widthPt: number,
  heightPt: number,
  pixelRatio = LOGO_RASTER_PIXEL_RATIO
): Promise<InsightPdfLogoRaster> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvasW = Math.max(1, Math.round(widthPt * pixelRatio));
      const canvasH = Math.max(1, Math.round(heightPt * pixelRatio));
      const canvas = document.createElement("canvas");
      canvas.width = canvasW;
      canvas.height = canvasH;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas unsupported"));
        return;
      }

      ctx.clearRect(0, 0, canvasW, canvasH);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, canvasW, canvasH);

      resolve({
        dataUrl: canvas.toDataURL("image/png"),
        format: "PNG",
        widthPt,
        heightPt,
      });
    };
    img.onerror = () => reject(new Error("Failed to rasterize insight PDF logo"));
    img.src = logo.dataUrl;
  });
}

export type InsightCoverBackground = {
  dataUrl: string;
  format: "JPEG";
};

function applyHomeHeroOverlaysToCanvas(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number
): void {
  const hGrad = ctx.createLinearGradient(0, 0, canvasW, 0);
  hGrad.addColorStop(0, "rgba(5,38,56,1)");
  hGrad.addColorStop(0.24, "rgba(5,38,56,1)");
  hGrad.addColorStop(0.4, "rgba(5,38,56,0.82)");
  hGrad.addColorStop(0.58, "rgba(5,38,56,0.52)");
  hGrad.addColorStop(0.76, "rgba(5,38,56,0.26)");
  hGrad.addColorStop(0.86, "rgba(5,38,56,0.1)");
  hGrad.addColorStop(0.94, "rgba(5,38,56,0.03)");
  hGrad.addColorStop(1, "rgba(5,38,56,0)");
  ctx.fillStyle = hGrad;
  ctx.fillRect(0, 0, canvasW, canvasH);

  ctx.fillStyle = "rgba(5,38,56,0.35)";
  ctx.fillRect(0, 0, canvasW, canvasH);

  const cx = canvasW / 2;
  const cy = canvasH / 2;
  const radius = Math.max(canvasW, canvasH) / 2;
  const rGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  rGrad.addColorStop(0, "rgba(5,38,56,0.55)");
  rGrad.addColorStop(0.55, "rgba(5,38,56,0.15)");
  rGrad.addColorStop(1, "rgba(5,38,56,0)");
  ctx.fillStyle = rGrad;
  ctx.fillRect(0, 0, canvasW, canvasH);
}

/**
 * Rasterize hero to full page with CSS cover sizing (uniform scale, no stretch).
 * Matches site hero: bg-cover + bg-[72%_100%] + gradient overlays.
 */
export function rasterizeHeroCoverForPdf(
  hero: InsightHeroPdfAsset,
  pageW: number,
  pageH: number
): Promise<InsightCoverBackground> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const pixelRatio = 2;
      const canvasW = Math.round(pageW * pixelRatio);
      const canvasH = Math.round(pageH * pixelRatio);
      const canvas = document.createElement("canvas");
      canvas.width = canvasW;
      canvas.height = canvasH;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas unsupported"));
        return;
      }

      ctx.fillStyle = "#052638";
      ctx.fillRect(0, 0, canvasW, canvasH);

      const imgW = img.naturalWidth;
      const imgH = img.naturalHeight;
      const scale = Math.max(canvasW / imgW, canvasH / imgH);
      const drawW = imgW * scale;
      const drawH = imgH * scale;

      const posX = 0.72;
      const posY = 1;
      const x = posX * canvasW - posX * drawW;
      const y = posY * canvasH - posY * drawH;

      ctx.drawImage(img, x, y, drawW, drawH);
      applyHomeHeroOverlaysToCanvas(ctx, canvasW, canvasH);

      resolve({
        dataUrl: canvas.toDataURL("image/jpeg", 0.9),
        format: "JPEG",
      });
    };
    img.onerror = () => reject(new Error("Failed to rasterize hero cover"));
    img.src = hero.dataUrl;
  });
}

/** Navy-only cover when hero image is unavailable. */
export function rasterizeNavyCoverForPdf(
  pageW: number,
  pageH: number
): InsightCoverBackground {
  const pixelRatio = 2;
  const canvasW = Math.round(pageW * pixelRatio);
  const canvasH = Math.round(pageH * pixelRatio);
  const canvas = document.createElement("canvas");
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas unsupported");
  }

  ctx.fillStyle = "#052638";
  ctx.fillRect(0, 0, canvasW, canvasH);
  applyHomeHeroOverlaysToCanvas(ctx, canvasW, canvasH);

  return {
    dataUrl: canvas.toDataURL("image/jpeg", 0.9),
    format: "JPEG",
  };
}
