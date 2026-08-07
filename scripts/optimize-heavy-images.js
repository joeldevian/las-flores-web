import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function optimizeDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      await optimizeDirectory(fullPath);
    } else if (entry.isFile() && /\.(webp|jpg|jpeg|png)$/i.test(entry.name)) {
      const stats = fs.statSync(fullPath);
      if (stats.size > 400 * 1024) { // mayor a 400 KB
        console.log(`Optimizing: ${fullPath} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
        
        try {
          const buffer = await sharp(fullPath)
            .resize(1920, null, { withoutEnlargement: true })
            .webp({ quality: 80 })
            .toBuffer();

          fs.writeFileSync(fullPath, buffer);
          console.log(`  -> New size: ${(buffer.length / 1024).toFixed(1)} KB (Saved ${((1 - buffer.length / stats.size) * 100).toFixed(1)}%)`);
        } catch (err) {
          console.error(`  -> Failed to optimize ${fullPath}:`, err.message);
        }
      }
    }
  }
}

console.log('Starting image batch optimization in memory...');
optimizeDirectory(path.resolve('public')).then(() => console.log('Image batch optimization complete!'));
