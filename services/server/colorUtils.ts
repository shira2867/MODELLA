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
  Burgundy: [128, 0, 32],
  Olive: [85, 107, 47],
  Teal: [0, 128, 128],
  Turquoise: [64, 224, 208],
};

// ——— Simple heuristics for specific color families ——— //

export function isGrayRGB([r, g, b]: RGB): boolean {
  return Math.max(r, g, b) - Math.min(r, g, b) < 20 && r > 50 && r < 200;
}

export function isYellowRGB([r, g, b]: RGB): boolean {
  return r > 180 && g > 150 && b < 100;
}

export function isBrownRGB([r, g, b]: RGB): boolean {
  return r > 100 && g > 50 && g < 120 && b < 80;
}

export function isCyanRGB([r, g, b]: RGB): boolean {
  return b > 150 && g > 120 && r < 100;
}

export function isPinkRGB([r, g, b]: RGB): boolean {
  return r > 200 && g < 150 && b < 180;
}

export function isDenimRGB([r, g, b]: RGB): boolean {
  if (b > r && b > g && b - r >= 20 && b - g >= 10 && r >= 60 && g >= 60 && b >= 60 && b <= 185)
    return true;

  if (b > r && b > g && b - r >= 10 && b - g >= 5 && r >= 120 && g >= 140 && b >= 160 && b <= 200)
    return true;

  return false;
}

export function isGreenRGB([r, g, b]: RGB): boolean {
  return g > r + 5 && g > b + 5 && g >= 50;
}

export function isBurgundyRGB([r, g, b]: RGB): boolean {
  return r > 50 && r < 150 && g < 60 && b < 70;
}

export function isRedRGB([r, g, b]: RGB): boolean {
  return r > 150 && g < 80 && b < 80;
}

// ——— LAB-based matching + fallback to closest color in COLOR_MAP ——— //

export function closestColorLAB(rgb: RGB): string {
  const lab = chroma(rgb).lab();
  const L = lab[0];
  const a = lab[1];
  const bLab = lab[2];

  // Extremely dark neutral → treat as Black
  if (L < 20 && Math.abs(a) < 10 && Math.abs(bLab) < 10) return "Black";
  // Very bright → White
  if (L > 95) return "White";

  // Hand-tuned rules for specific families
  if (isDenimRGB(rgb)) return "Blue";
  if (isGreenRGB(rgb)) return "Green";
  if (isRedRGB(rgb)) return "Red";
  if (isBurgundyRGB(rgb)) return "Burgundy";
  if (isGrayRGB(rgb)) return "Gray";
  if (isYellowRGB(rgb)) return "Yellow";
  if (isBrownRGB(rgb)) return "Brown";
  if (isCyanRGB(rgb)) return "LightBlue";
  if (isPinkRGB(rgb)) return "Pink";

  const [r, g, b] = rgb;

  // More hand-crafted heuristics
  if (r >= 150 && g >= 60 && g <= 150 && b <= 40) return "Orange";
  if (r >= 150 && g < 60 && b < 60) return "Red";
  if (b > r && b > g && r < 60 && g < 60 && b < 70) return "Blue";
  if (r < 70 && g < 70 && b < 70) return "Brown";
  if (g > r + 10 && g > b + 10 && g < 70) return "Green";
  if (g > r + 20 && g > b + 20 && g >= 70 && g <= 180) return "Green";

  // Fallback: pick the closest predefined color in LAB space
  let closest = "";
  let minDistance = Infinity;
  for (const [colorName, colorRgb] of Object.entries(COLOR_MAP)) {
    const distance = chroma.distance(rgb, colorRgb, "lab");
    if (distance < minDistance) {
      minDistance = distance;
      closest = colorName;
    }
  }

  // Normalize similar shades into a single label
  const blueShades = ["Blue", "DenimBlue", "DarkDenim", "MediumDenim", "LightDenim", "Navy", "Indigo"];
  if (blueShades.includes(closest)) return "Blue";

  const greenShades = ["Green", "Olive", "Teal", "Turquoise"];
  if (greenShades.includes(closest)) return "Green";

  const brownShades = ["Brown", "DarkBrown", "Chocolate", "DarkGray"];
  if (brownShades.includes(closest)) return "Brown";

  const yellowShades = ["Yellow", "SoftYellow", "Golden", "WarmYellow", "Mustard"];
  if (yellowShades.includes(closest)) return "Yellow";

  return closest;
}

export function getDominantColorsKMeans(
  img: HTMLImageElement,
  size = 250,
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

  const radius = Math.min(img.width, img.height) * 0.6;
  const maxRadius = radius;

  const pixels: number[][] = [];

  const startX = Math.floor(img.width * 0.25);
  const endX   = Math.ceil(img.width * 0.65);

  const startY = Math.floor(img.height * 0.25);
  const endY   = img.height;

  for (let x = startX; x < endX; x++) {
    for (let y = startY; y < endY; y++) {

      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > radius) continue;

      const data = ctx.getImageData(x, y, 1, 1).data;
      const [r, g, b] = [data[0], data[1], data[2]];

      const [L] = chroma([r, g, b]).lab();
      const saturation = chroma([r, g, b]).hsl()[1];

      if (L > 97 && saturation < 0.01) continue;
      if (saturation < 0.02 && L > 30 && L < 80) continue;

      const normDist = dist / maxRadius;

      let repeats = 1;
      if (normDist < 0.25) repeats = 4;
      else if (normDist < 0.6) repeats = 2;

      for (let i = 0; i < repeats; i++) {
        pixels.push([r, g, b]);
      }
    }
  }

  if (!pixels.length) return [[0, 0, 0]];

  const dataForKMeans = pixels.map(p => [p[0], p[1], p[2]]);
  const { centroids } = kmeans(dataForKMeans, topN, {});
  return centroids.map(c => c.map(Math.round) as RGB);
}




export function getDominantColorsFromCenter(
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

  for (let x = centerX - size; x < centerX + size; x++) {
    for (let y = centerY - size; y < centerY + size; y++) {
      if (x < 0 || x >= img.width || y < 0 || y >= img.height) continue;

      const data = ctx.getImageData(x, y, 1, 1).data;
      const rgb: RGB = [data[0], data[1], data[2]];

      const [L] = chroma(rgb).lab();
      const saturation = chroma(rgb).hsl()[1];

      if (L > 97 && saturation < 0.01) continue;
      if (saturation < 0.02 && L > 30 && L < 80) continue;

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
  pixels.forEach((rgb) => {
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
