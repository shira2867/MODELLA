import chroma from "chroma-js";

// Type definition for RGB tuple
export type RGB = [number, number, number];

/**
 * A comprehensive map of color names to their representative RGB values.
 */
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

// --- Helper Functions for Specific Color Checks (RGB based) ---

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
  return g > r && g > b && g >= 80 && g <= 200 && r <= 150 && b <= 150;
}

export function isBurgundyRGB([r, g, b]: RGB): boolean {
  return r > 50 && r < 150 && g < 60 && b < 70;
}

export function isRedRGB([r, g, b]: RGB): boolean {
  return r > 150 && g < 80 && b < 80;
}

/**
 * Finds the closest color name to a given RGB value using LAB color space distance,
 * incorporating specific clothing color checks for better accuracy (e.g., denim, burgundy).
 * @param rgb - The RGB color tuple to classify.
 * @returns The closest descriptive color name (string).
 */
export function closestColorLAB(rgb: RGB): string {
  // Priority checks for specific clothing colors
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

  // Additional quick checks (based on the original logic)
  if (r >= 150 && g >= 60 && g <= 150 && b <= 40) return "Orange";
  if (r >= 150 && g < 60 && b < 60) return "Red";
  if (b > r && b > g && r < 60 && g < 60 && b < 70) return "Blue";
  // Fallback for very dark, low-saturation colors (often detected as Gray/Black by LAB)
  if (r < 70 && g < 70 && b < 70) return "Brown";

  // Check for Black/White using LAB Lightness (L)
  const lab = chroma(rgb).lab();
  const L = lab[0];
  const a = lab[1];
  const bLab = lab[2];

  if (L > 95) return "White";
  if (L < 10 && Math.abs(a) < 5 && Math.abs(bLab) < 5) return "Black";

  // Find closest color name from COLOR_MAP using LAB distance
  let closest = "";
  let minDistance = Infinity;
  for (const [colorName, colorRgb] of Object.entries(COLOR_MAP)) {
    const distance = chroma.distance(rgb, colorRgb, "lab");
    if (distance < minDistance) {
      minDistance = distance;
      closest = colorName;
    }
  }

  // Group similar shades into main color categories
  const blueShades = ["Blue", "DenimBlue", "DarkDenim", "MediumDenim", "LightDenim", "Navy", "Indigo", "LightBlue", "Turquoise", "Teal"];
  if (blueShades.includes(closest)) return "Blue";

  const brownShades = ["Brown", "DarkBrown", "Chocolate", "Beige"];
  if (brownShades.includes(closest)) return "Brown";

  const yellowShades = ["Yellow", "SoftYellow", "Golden", "WarmYellow", "Mustard", "Orange"];
  if (yellowShades.includes(closest)) return "Yellow";

  return closest;
}

/**
 * Extracts dominant colors from the center region of an image.
 * Ignores very bright (White) and low-saturation/high-lightness pixels.
 * Merges highly similar colors to ensure distinct dominant colors are returned.
 *
 * @param img - The HTMLImageElement to analyze.
 * @param size - The half-width/height of the square region (total area is 2*size x 2*size).
 * @param topN - The number of top dominant colors to return.
 * @returns An array of dominant colors as RGB tuples.
 */
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

      // Filter out pure white and low-saturation, non-dark pixels
      if (L > 95) continue;
      if (saturation < 0.05 && L > 20) continue;

      pixels.push(rgb);
    }
  }

  if (!pixels.length) return [[0, 0, 0]]; // Default to black if no valid pixels found

  // Helper to merge colors that are very close in LAB space
  const mergeSimilar = (colors: RGB[], threshold = 15) => {
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
  // Ensure the array always has topN colors, even if repeated
  while (finalColors.length < topN) finalColors.push(sortedColors[0]);

  return finalColors;
}