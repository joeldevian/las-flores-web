import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const HERO_DIR = path.resolve('public/imagenes-reales/hero-paginas');

async function optimizeHeroImages() {
  const files = fs.readdirSync(HERO_DIR).filter(f => /\.(webp|jpg|jpeg|png)$/i.test(f));

  if (files.length === 0) {
    console.log('No images found in hero-paginas.');
    return;
  }

  for (const file of files) {
    const filePath = path.join(HERO_DIR, file);
    const stats = fs.statSync(filePath);
    const originalKB = (stats.size / 1024).toFixed(1);

    console.log(`\nOptimizing: ${file} (${originalKB} KB)`);

    try {
      const buffer = await sharp(filePath)
        .resize(1920, null, { withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();

      const tmpPath = filePath + '.tmp';
      fs.writeFileSync(tmpPath, buffer);
      // Sobrescribir directamente sin eliminar primero
      fs.writeFileSync(filePath, buffer);
      fs.unlinkSync(tmpPath);

      const savedPct = ((1 - buffer.length / stats.size) * 100).toFixed(1);
      console.log(`  -> ${(buffer.length / 1024).toFixed(1)} KB (${savedPct}% reducido)`);
    } catch (err) {
      console.error(`  -> Error: ${err.message}`);
    }
  }

  console.log('\nOptimización completada.');
}

optimizeHeroImages();
