import chroma from "chroma-js";
import { kmeans } from "ml-kmeans";

export type RGB = [number, number, number];

export const COLOR_MAP: Record<string, RGB> = {
  Red: [255, 0, 0],
  DarkRed: [139, 0, 0],
  Pink: [255, 192, 203],
  Orange: [255, 165, 0],
  Yellow: [255, 255, 0],
  SoftYellow: [250, 230, 140],
  Golden: [228, 205, 125],
  WarmYellow: [240, 220, 130],
  Mustard: [204, 153, 0],
  Green: [0, 128, 0],
  Blue: [0, 0, 255],
  DenimBlue: [21, 96, 189],
  DarkDenim: [10, 45, 100],
  MediumDenim: [50, 110, 180],
  LightDenim: [173, 198, 229],
  LightBlue: [173, 216, 230],
  Purple: [128, 0, 128],
  Brown: [121, 85, 61],
  DarkBrown: [101, 67, 33],
  Chocolate: [123, 63, 0],
  Gray: [128, 128, 128],
  DarkGray: [64, 64, 64],
  Black: [0, 0, 0],
  White: [255, 255, 255],
  Beige: [245, 245, 220],
  Navy: [0, 0, 128],
  Indigo: [75, 0, 130],
  LightPurple: [214, 206, 219],
  Lavender: [230, 230, 250],
  Burgundy: [128, 0, 32],
  Olive: [85, 107, 47],
  Teal: [0, 128, 128],
  Turquoise: [64, 224, 208],
};

export function isGrayRGB([r, g, b]: RGB): boolean {
  return Math.max(r, g, b) - Math.min(r, g, b) < 20 && r > 50 && r < 200;
}

export function isYellowRGB([r, g, b]: RGB): boolean {
  return r > 180 && g > 150 && b < 100;
}

export function isBrownRGB([r, g, b]: RGB): boolean {
  if (b > r || b > g) return false;

  const warm = r > g && r > b;
  const lowBlue = b < 80;
  const midRange = r >= 70 && r <= 160;
  const notTooRed = r - g < 25 && r - b < 40;

  return warm && lowBlue && midRange && notTooRed;
}

export function isBurgundyRGB([r, g, b]: RGB): boolean {
  return r > g + 25 && r > b + 20 && r < 120 && g < 70 && b < 70 && b > 30;
}

export function isCyanRGB([r, g, b]: RGB): boolean {
  return b > 150 && g > 120 && r < 100;
}

export function isPinkRGB([r, g, b]: RGB): boolean {
  return r > 200 && g < 150 && b < 180;
}

export function isDenimRGB([r, g, b]: RGB): boolean {
  return (
    b > r &&
    b > g &&
    b - r >= 15 &&
    b - g >= 10 &&
    b >= 60 &&
    b <= 200
  );
}

export function isGreenRGB([r, g, b]: RGB): boolean {
  return g > r + 5 && g > b + 5 && g >= 50;
}

export function isRedRGB([r, g, b]: RGB): boolean {
  return r > 150 && g < 80 && b < 80;
}

export function isPurpleShadeRGB([r, g, b]: RGB): boolean {
  const [L] = chroma([r, g, b]).lab();

  if (L > 90) return false;

  if (g > r || g > b) return false;

  return (
    (L > 65 && r > 150 && b > 150 && Math.abs(r - b) < 70) ||
    (L >= 35 && L <= 65 && r > 80 && b > 80 && Math.abs(r - b) < 80) ||
    (L < 35 && r > 40 && b > 40 && Math.abs(r - b) < 60)
  );
}


export function closestColorLAB(rgb: RGB): string {
  const [L] = chroma(rgb).lab();
  const [h, s] = chroma(rgb).hsl();

  if (L < 20) return "Black";
  if (L > 95) return "White";

  if (h !== undefined && h > 190 && h < 260 && s > 0.15) {
    return "Blue";
  }

  if (isBurgundyRGB(rgb)) return "Burgundy";
  if (isRedRGB(rgb)) return "Red";
  if (isDenimRGB(rgb)) return "Blue";
  if (isGreenRGB(rgb)) return "Green";
  if (isBrownRGB(rgb)) return "Brown";
  if (isGrayRGB(rgb)) return "Gray";
  if (isYellowRGB(rgb)) return "Yellow";
  if (isCyanRGB(rgb)) return "LightBlue";
  if (isPinkRGB(rgb)) return "Pink";
  if (isPurpleShadeRGB(rgb)) return "Purple";

  let closest = "";
  let minDistance = Infinity;

  for (const [colorName, colorRgb] of Object.entries(COLOR_MAP)) {
    const distance = chroma.distance(rgb, colorRgb, "lab");
    if (distance < minDistance) {
      minDistance = distance;
      closest = colorName;
    }
  }

  if (["Blue", "DenimBlue", "DarkDenim", "MediumDenim", "LightDenim", "Navy", "Indigo"].includes(closest))
    return "Blue";

  if (["Purple", "LightPurple", "Lavender"].includes(closest))
    return "Purple";

  if (["Green", "Olive", "Teal", "Turquoise"].includes(closest))
    return "Green";

  if (["Brown", "DarkBrown", "Chocolate"].includes(closest))
    return "Brown";

  if (["Yellow", "SoftYellow", "Golden", "WarmYellow", "Mustard"].includes(closest))
    return "Yellow";

  return closest;
}


export function getDominantColorsKMeans(
  img: HTMLImageElement,
  topN = 4
): RGB[] {
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];

  ctx.drawImage(img, 0, 0);

  const pixels: number[][] = [];

  const startX = Math.floor(img.width * 0.40);
  const endX = Math.ceil(img.width * 0.60);

  const topStartY = Math.floor(img.height * 0.15);
  const topEndY = Math.floor(img.height * 0.45);

  const bottomStartY = Math.floor(img.height * 0.45);
  const bottomEndY = Math.floor(img.height * 0.85);

  const sampleRegion = (sx: number, ex: number, sy: number, ey: number) => {
    for (let x = sx; x < ex; x++) {
      for (let y = sy; y < ey; y++) {
        const data = ctx.getImageData(x, y, 1, 1).data;
        const [r, g, b] = [data[0], data[1], data[2]];

        const [L] = chroma([r, g, b]).lab();
        const saturation = chroma([r, g, b]).hsl()[1];

        if (L > 96 && saturation < 0.03) continue;

        if (r > 150 && g > 80 && b < 90) continue;

        pixels.push([r, g, b]);
      }
    }
  };

  sampleRegion(startX, endX, topStartY, topEndY);
  sampleRegion(startX, endX, bottomStartY, bottomEndY);

  if (!pixels.length) return [[0, 0, 0]];

  const { centroids } = kmeans(pixels, topN, {});
  return centroids.map(c => c.map(Math.round) as RGB);
}


export function getDominantColorsFromCenter(
  img: HTMLImageElement,
  size = 400,
  topN = 4
): RGB[] {
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];

  ctx.drawImage(img, 0, 0);

  const centerX = Math.floor(img.width / 2);
  const centerY = Math.floor(img.height / 2);

  const pixels: RGB[] = [];

  for (let x = centerX - size; x < centerX + size; x++) {
    for (let y = centerY - size; y < centerY + size; y++) {
      if (x < 0 || x >= img.width || y < 0 || y >= img.height) continue;

      const data = ctx.getImageData(x, y, 1, 1).data;
      const rgb: RGB = [data[0], data[1], data[2]];

      const [L] = chroma(rgb).lab();
      const saturation = chroma(rgb).hsl()[1];

      if (L > 95) continue;
      if (saturation < 0.05 && L > 20) continue;

      pixels.push(rgb);
    }
  }

  if (!pixels.length) return [[0, 0, 0]];

  const mergeSimilar = (colors: RGB[], threshold = 25) => {
    const result: RGB[] = [];
    for (const c of colors) {
      if (!result.some(r => chroma.distance(c, r, "lab") < threshold)) {
        result.push(c);
      }
    }
    return result;
  };

  const colorMap: Record<string, { rgb: RGB; count: number }> = {};
  pixels.forEach(rgb => {
    const key = rgb.join(",");
    if (!colorMap[key]) colorMap[key] = { rgb, count: 0 };
    colorMap[key].count++;
  });

  let sortedColors = Object.values(colorMap)
    .sort((a, b) => b.count - a.count)
    .map(c => c.rgb);

  sortedColors = mergeSimilar(sortedColors);

  const finalColors = sortedColors.slice(0, topN);
  while (finalColors.length < topN) finalColors.push(sortedColors[0]);

  return finalColors;
}

export function getDominantColorsKMeansCenter(
  img: HTMLImageElement,
  size = 200,
  topN = 4
): RGB[] {
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];

  ctx.drawImage(img, 0, 0);

  const centerX = Math.floor(img.width / 2);
  const centerY = Math.floor(img.height / 2);

  const pixels: RGB[] = [];
  const fallbackPixels: RGB[] = [];

  for (let x = centerX - size; x < centerX + size; x++) {
    for (let y = centerY - size; y < centerY + size; y++) {
      if (x < 0 || x >= img.width || y < 0 || y >= img.height) continue;

      const data = ctx.getImageData(x, y, 1, 1).data;
      const rgb: RGB = [data[0], data[1], data[2]];

      fallbackPixels.push(rgb);

      const [L] = chroma(rgb).lab();
      const saturation = chroma(rgb).hsl()[1];

      if (L > 98) continue;
      if (saturation < 0.03 && L > 85) continue;

      pixels.push(rgb);
    }
  }

  if (!pixels.length) {
    const mid = fallbackPixels[Math.floor(fallbackPixels.length / 2)];
    return [mid];
  }

  const { centroids } = kmeans(pixels, topN, {});
  return centroids.map(c => c.map(v => Math.round(v)) as RGB);
}