// lib/colorUtils.ts
export function getDominantColorFromCenter(image: HTMLImageElement) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return "#ffffff";

  const size = 100;
  canvas.width = size;
  canvas.height = size;

  const cropSize = Math.min(image.width, image.height) / 2;
  const sx = (image.width - cropSize) / 2;
  const sy = (image.height - cropSize) / 2;

  ctx.drawImage(image, sx, sy, cropSize, cropSize, 0, 0, size, size);
  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;

  let r = 0,
    g = 0,
    b = 0,
    count = 0;
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];
    if (alpha === 0) continue;
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
    count++;
  }

  r = Math.round(r / count);
  g = Math.round(g / count);
  b = Math.round(b / count);

  return `rgb(${r}, ${g}, ${b})`;
}
