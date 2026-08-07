import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

async function optimizeMapa() {
  const inputPath = "public/MAPA.png";
  const outputPath = "public/MAPA.webp";

  console.log("🗺️ Optimizando MAPA.png...\n");

  const stats = fs.statSync(inputPath);
  const originalSizeKb = Math.round(stats.size / 1024);
  const originalSizeMb = (originalSizeKb / 1024).toFixed(2);

  console.log(`📊 Tamaño original: ${originalSizeKb} KB (${originalSizeMb} MB)`);

  const compressedBuffer = await sharp(inputPath)
    .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  fs.writeFileSync(outputPath, compressedBuffer);

  const compressedSizeKb = Math.round(compressedBuffer.length / 1024);
  const compressedSizeMb = (compressedSizeKb / 1024).toFixed(2);
  const savings = Math.round((1 - compressedSizeKb / originalSizeKb) * 100);

  console.log(`✅ Tamaño comprimido: ${compressedSizeKb} KB (${compressedSizeMb} MB)`);
  console.log(`⚡ Ahorro: -${savings}%`);
  console.log(`\n🎉 Archivo guardado en: ${outputPath}`);
}

optimizeMapa();
