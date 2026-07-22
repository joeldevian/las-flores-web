/**
 * Optimiza las imágenes de la carta (CARTA) para la web.
 * Lee cada archivo como buffer, lo procesa con sharp, y lo reescribe.
 */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const CARTA_DIR = path.join(__dirname, "public", "imagenes-reales", "CARTA");
const MAX_WIDTH = 600;
const QUALITY = 75;

async function processImage(filePath) {
  // Read entire file into memory first to avoid file lock issues
  const inputBuffer = fs.readFileSync(filePath);
  const originalKB = inputBuffer.length / 1024;

  const metadata = await sharp(inputBuffer).metadata();

  let pipeline = sharp(inputBuffer);
  if (metadata.width > MAX_WIDTH) {
    pipeline = pipeline.resize(MAX_WIDTH, null, {
      withoutEnlargement: true,
      fit: "inside",
    });
  }

  const outputBuffer = await pipeline.webp({ quality: QUALITY, effort: 6 }).toBuffer();

  fs.writeFileSync(filePath, outputBuffer);

  const newKB = outputBuffer.length / 1024;
  const savedPct = (((originalKB - newKB) / originalKB) * 100).toFixed(1);

  return { originalKB, newKB, savedPct };
}

async function main() {
  const files = fs.readdirSync(CARTA_DIR).filter((f) => f.endsWith(".webp") && !f.startsWith("_"));

  console.log(`Found ${files.length} images to optimize in CARTA/`);
  let totalOrigKB = 0;
  let totalNewKB = 0;

  for (const file of files) {
    const filePath = path.join(CARTA_DIR, file);
    try {
      const { originalKB, newKB, savedPct } = await processImage(filePath);
      totalOrigKB += originalKB;
      totalNewKB += newKB;
      console.log(
        `  ✓ ${file}: ${originalKB.toFixed(0)} KB → ${newKB.toFixed(0)} KB (saved ${savedPct}%)`,
      );
    } catch (err) {
      console.error(`  ✗ Error processing ${file}:`, err.message);
    }
  }

  const totalSavedMB = ((totalOrigKB - totalNewKB) / 1024).toFixed(1);
  console.log(
    `\nDone! Total: ${(totalOrigKB / 1024).toFixed(1)} MB → ${(totalNewKB / 1024).toFixed(1)} MB (saved ${totalSavedMB} MB)`,
  );
}

main().catch(console.error);
