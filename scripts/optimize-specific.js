import fs from 'fs';
import sharp from 'sharp';

const files = [
  "public/imagenes-reales/FESTIVIDADES LISTO/SEMANA SANTA/semana santa.webp",
  "public/imagenes-reales/FESTIVIDADES LISTO/CARNAVALES/Carnavales.webp",
  "public/imagenes-reales/DESTINOS LISTO/EXCURSIONES/MILLPU/millpu.webp",
  "public/imagenes-reales/DESTINOS LISTO/EXCURSIONES/VILCASHUAMAN/DSC09327-2.webp",
  "public/imagenes-reales/EQUIPO/encantados-de-atenderlos.webp"
];

async function run() {
  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    const stat = fs.statSync(file);
    if (stat.size > 1024 * 1024) { // > 1MB
      console.log(`Optimizing ${file}...`);
      const buffer = await sharp(file)
        .resize({ width: 1920, withoutEnlargement: true })
        .webp({ quality: 75, effort: 4 })
        .toBuffer();
      
      const newFile = file.replace('.webp', '-opt.webp');
      fs.writeFileSync(newFile, buffer);
      console.log(`Created ${newFile} (Size: ${(buffer.length/1024/1024).toFixed(2)} MB)`);
    }
  }
}

run();
