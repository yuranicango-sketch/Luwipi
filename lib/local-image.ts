"use client";

export async function imageFileToLocalAvatar(file: File, side = 180) {
  if (!file.type.startsWith("image/")) throw new Error("invalid_image");
  const source = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("read_error"));
    reader.readAsDataURL(file);
  });
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image_error"));
    img.src = source;
  });
  const canvas = document.createElement("canvas");
  canvas.width = side;
  canvas.height = side;
  const ctx = canvas.getContext("2d");
  if (!ctx) return source;
  const sourceSide = Math.min(image.width, image.height);
  const sx = (image.width - sourceSide) / 2;
  const sy = (image.height - sourceSide) / 2;
  ctx.drawImage(image, sx, sy, sourceSide, sourceSide, 0, 0, side, side);
  return canvas.toDataURL("image/jpeg", 0.74);
}
