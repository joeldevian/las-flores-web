import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, "../public");

async function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      await processDirectory(fullPath);
    } else if (stat.isFile()) {
      // Cleanup any dangling tmp files from previous run
      if (file.endsWith(".tmp.webp")) {
        try {
          fs.unlinkSync(fullPath);
        } catch (e) {}
        continue;
      }

      if (/\.(webp|jpg|jpeg|png)$/i.test(file)) {
        if (stat.size > 500 * 1024) {
          console.log(`Optimizing: ${fullPath} (${(stat.size / 1024 / 1024).toFixed(2)} MB)`);
          try {
            const buffer = await sharp(fullPath)
              .resize({ width: 1920, withoutEnlargement: true })
              .webp({ quality: 80, effort: 4 })
              .toBuffer();

            fs.writeFileSync(fullPath, buffer);
            const newStat = fs.statSync(fullPath);
            console.log(`  -> Reduced to ${(newStat.size / 1024 / 1024).toFixed(2)} MB`);
          } catch (err) {
            console.error(`Error processing ${fullPath}:`, err.message);
          }
        }
      }
    }
  }
}

console.log("Starting image optimization in public directory...");
processDirectory(publicDir).then(() => {
  console.log("Optimization complete!");
});
