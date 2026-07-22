import fs from "fs";
import path from "path";
import { globSync } from "glob";
import sharp from "sharp";

async function optimizeImages() {
  console.log("Starting image optimization...");

  // Find all images in public and src/assets
  const imagePatterns = ["public/**/*.{jpg,jpeg,png}", "src/assets/**/*.{jpg,jpeg,png}"];

  let totalSaved = 0;
  const processedFiles = [];

  for (const pattern of imagePatterns) {
    const files = globSync(pattern, { nodir: true });

    for (const file of files) {
      // Exclude the favicons/logos that need to stay PNG for transparency/compatibility if needed
      // But webp supports transparency, so it's generally fine. We'll skip images.png to be safe?
      if (file.endsWith("images.png")) {
        console.log(`Skipping ${file}`);
        continue;
      }
      if (file.includes("logo-original.png")) {
        console.log(`Skipping ${file}`);
        continue;
      }

      const parsedPath = path.parse(file);
      const webpPath = path.join(parsedPath.dir, `${parsedPath.name}.webp`);

      try {
        const statsBefore = fs.statSync(file);

        await sharp(file).webp({ quality: 80 }).toFile(webpPath);

        const statsAfter = fs.statSync(webpPath);
        const saved = statsBefore.size - statsAfter.size;

        console.log(`Converted ${file} to .webp - Saved: ${(saved / 1024 / 1024).toFixed(2)} MB`);

        if (saved > 0) {
          totalSaved += saved;
        }

        // Track for source code replacement
        processedFiles.push({
          oldExt: parsedPath.ext,
          name: parsedPath.name,
        });

        // Delete original
        fs.unlinkSync(file);
      } catch (err) {
        console.error(`Error processing ${file}:`, err);
      }
    }
  }

  console.log(`\nTotal space saved: ${(totalSaved / 1024 / 1024).toFixed(2)} MB`);

  console.log("\nUpdating source files...");
  const sourceFiles = globSync("src/**/*.{tsx,ts,css}", { nodir: true });

  let replacedCount = 0;
  for (const srcFile of sourceFiles) {
    let content = fs.readFileSync(srcFile, "utf8");
    let originalContent = content;

    for (const { name, oldExt } of processedFiles) {
      // Replace name.png with name.webp and name.jpg with name.webp
      // We must be careful not to replace partial names.
      // So we replace exactly `name + oldExt` with `name + '.webp'`
      const regex = new RegExp(name + oldExt, "g");
      content = content.replace(regex, name + ".webp");
    }

    if (content !== originalContent) {
      fs.writeFileSync(srcFile, content, "utf8");
      replacedCount++;
    }
  }

  console.log(`Updated ${replacedCount} source files.`);
}

optimizeImages().catch(console.error);
