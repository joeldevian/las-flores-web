/**
 * WebP Image Compressor Utility for Las Flores CMS
 * Converts JPG/PNG/heavy images into optimized WebP Blobs and Data URLs in-browser.
 */
export async function compressImageToWebP(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.85
): Promise<{ dataUrl: string; blob: Blob; originalSizeKb: number; compressedSizeKb: number }> {
  return new Promise((resolve, reject) => {
    const originalSizeKb = Math.round(file.size / 1024);
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        // Resize proportionally if dimensions exceed max
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("No se pudo obtener el contexto 2D del Canvas"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/webp", quality);

        canvas.toBlob(
          (blob) => {
            const finalBlob = blob || new Blob();
            const compressedSizeKb = Math.round(finalBlob.size / 1024);
            resolve({
              dataUrl,
              blob: finalBlob,
              originalSizeKb,
              compressedSizeKb,
            });
          },
          "image/webp",
          quality
        );
      };

      img.onerror = (err) => reject(err);
      img.src = event.target?.result as string;
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
