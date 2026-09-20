/**
 * Compresses an image client-side to ensure maximum storage efficiency
 * (typically downscaling to 600x600 px and exporting at 82% quality,
 * resulting in ~40-60 KB per pet photo).
 */
export function compressImageFile(file, maxDimension = 600, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const originalSizeKb = Math.round(file.size / 1024);
    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        // Estimate size from base64 length
        const compressedSizeKb = Math.round((compressedDataUrl.length * 3) / 4 / 1024);
        const savingsPercent = originalSizeKb > 0 
          ? Math.max(0, Math.round(((originalSizeKb - compressedSizeKb) / originalSizeKb) * 100))
          : 0;

        resolve({
          dataUrl: compressedDataUrl,
          originalSizeKb,
          compressedSizeKb,
          savingsPercent,
        });
      };

      img.onerror = (err) => reject(err);
      img.src = readerEvent.target.result;
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
