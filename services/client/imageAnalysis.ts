

const ANALYSIS_COLOR_MAP: Record<string, [number, number, number]> = {
  Red: [255, 0, 0],
  Pink: [255, 192, 203],
  Orange: [255, 165, 0],
  Yellow: [255, 255, 0],
  Green: [0, 128, 0],
  Blue: [0, 0, 255],
  Purple: [128, 0, 128],
  Black: [0, 0, 0],
  White: [255, 255, 255],
  Gray: [128, 128, 128],
  LightGray: [211, 211, 211],
  DarkGray: [64, 64, 64],
  Brown: [165, 42, 42],
  DarkBrown: [101, 67, 33],
  Tan: [210, 180, 140],
  Beige: [245, 245, 220],
  Cream: [255, 253, 208],
  Navy: [0, 0, 128],
  Teal: [0, 128, 128],
  Cyan: [0, 255, 255],
  SkyBlue: [135, 206, 235],
  DarkRed: [139, 0, 0],
  OffWhite: [248, 248, 248],
  Ivory: [255, 255, 240],
  MediumGray: [169, 169, 169],
};


const ANALYSIS_TO_CORE_MAP: Record<string, string> = {
  DarkBrown: "Brown",
  Tan: "Brown",
  LightGray: "Gray",
  DarkGray: "Gray",
  Cream: "White",
  Navy: "Blue",
  Teal: "Green",
  Cyan: "Blue",
  SkyBlue: "Blue",
  DarkRed: "Red",
};

const distance = (rgb1: [number, number, number], rgb2: [number, number, number]): number => {
  return Math.sqrt(
    Math.pow(rgb1[0] - rgb2[0], 2) +
    Math.pow(rgb1[1] - rgb2[1], 2) +
    Math.pow(rgb1[2] - rgb2[2], 2)
  );
};

const findClosestColorName = (rgb: [number, number, number]): string => {
  let minDistance = Infinity;
  let closestColor = "Black";

  for (const [name, mapRgb] of Object.entries(ANALYSIS_COLOR_MAP)) {
    const dist = distance(rgb, mapRgb);
    if (dist < minDistance) {
      minDistance = dist;
      closestColor = name;
    }
  }

  const MAX_ALLOWED_DISTANCE = 200;

  if (
    minDistance > MAX_ALLOWED_DISTANCE &&
    !["White", "Black", "Gray", "LightGray", "DarkGray"].includes(closestColor)
  ) {
    const neutralColors = {
      Gray: ANALYSIS_COLOR_MAP.Gray,
      White: ANALYSIS_COLOR_MAP.White,
      Black: ANALYSIS_COLOR_MAP.Black,
    };
    let minNeutralDist = Infinity;
    let closestNeutral = closestColor;
    for (const [name, mapRgb] of Object.entries(neutralColors)) {
      const dist = distance(rgb, mapRgb);
      if (dist < minNeutralDist) {
        minNeutralDist = dist;
        closestNeutral = name;
      }
    }
    return closestNeutral;
  }

  return closestColor;
};


function getTopColorsFromImage(image: HTMLImageElement, topN: number = 3): string[] {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];

  const size = 200; // canvas גדול יותר
  canvas.width = size;
  canvas.height = size;

  // צייר את כל התמונה על הקנבס
  ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, size, size);

  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;

  const colorCounts = new Map<string, number>();
  const BIN_SIZE = 16; // יותר רזולוציה לצבעים

  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];
    if (alpha < 128) continue;

    const r = Math.floor(data[i] / BIN_SIZE) * BIN_SIZE;
    const g = Math.floor(data[i + 1] / BIN_SIZE) * BIN_SIZE;
    const b = Math.floor(data[i + 2] / BIN_SIZE) * BIN_SIZE;

    const key = `${r},${g},${b}`;
    colorCounts.set(key, (colorCounts.get(key) || 0) + 1);
  }

  const sortedColors = Array.from(colorCounts.entries()).sort((a, b) => b[1] - a[1]);

  const dominantColorNames: string[] = [];
  const usedColorNames = new Set<string>();

  for (const [key, count] of sortedColors) {
    if (count < 15) continue; // סף פיקסלים קטן יותר
    if (dominantColorNames.length >= topN) break;

    const [r, g, b] = key.split(",").map(Number);
    const representativeRgb: [number, number, number] = [
      r + BIN_SIZE / 2,
      g + BIN_SIZE / 2,
      b + BIN_SIZE / 2,
    ];

    const colorName = findClosestColorName(representativeRgb);

    if (!usedColorNames.has(colorName)) {
      dominantColorNames.push(colorName);
      usedColorNames.add(colorName);
    }
  }

  if (dominantColorNames.length === 0) return ["White", "Black"];
  return dominantColorNames;
}



const mapAnalysisToCoreColors = (analysisColors: string[]): string[] => {
  const coreColors = analysisColors.map((analysisColor) => {
    return ANALYSIS_TO_CORE_MAP[analysisColor] || analysisColor;
  });
  return Array.from(new Set(coreColors)); // מסיר כפילויות
};


export const analyzeImageColors = (file: File): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const analysisColors = getTopColorsFromImage(img, 3);
          const coreColors = mapAnalysisToCoreColors(analysisColors);
          resolve(coreColors);
        } catch (error) {
          reject(new Error("Failed to analyze image colors."));
        }
      };
      img.onerror = () => reject(new Error("Error loading image for analysis."));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Error reading file."));
    reader.readAsDataURL(file);
  });
};
