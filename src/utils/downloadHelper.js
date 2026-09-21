/**
 * Robust, cross-device file downloader for Canvas Data URLs and Blobs.
 * Works seamlessly on Desktop (Chrome, Safari, Firefox, Edge),
 * iOS Safari / iPadOS, and Android mobile browsers.
 */

export async function downloadDataUrl(dataUrl, filename) {
  if (!dataUrl) {
    console.error("downloadDataUrl: No dataUrl provided");
    return false;
  }

  try {
    // 1. Convert DataURL to a real binary Blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    // 2. Standard HTML5 download via Blob URL
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    link.style.display = "none";
    document.body.appendChild(link);

    link.click();

    // Cleanup after short delay
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(blobUrl);
    }, 1500);

    return true;
  } catch (err) {
    console.warn("Blob URL download failed, attempting direct download:", err);

    try {
      // Direct Data URL fallback
      const directLink = document.createElement("a");
      directLink.href = dataUrl;
      directLink.download = filename;
      directLink.target = "_blank";
      directLink.style.display = "none";
      document.body.appendChild(directLink);
      directLink.click();

      setTimeout(() => {
        if (document.body.contains(directLink)) {
          document.body.removeChild(directLink);
        }
      }, 1000);
      return true;
    } catch (fallbackErr) {
      console.error("All automated download attempts failed:", fallbackErr);

      // Ultimate fallback: open in new tab so user can touch & save
      const win = window.open();
      if (win) {
        win.document.write(`<title>${filename}</title><img src="${dataUrl}" style="max-width:100%; height:auto;" alt="Descarga"/>`);
        win.document.close();
        return true;
      }
      return false;
    }
  }
}

export async function downloadBlob(blob, filename) {
  if (!blob) {
    console.error("downloadBlob: No blob provided");
    return false;
  }

  try {
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(blobUrl);
    }, 1500);

    return true;
  } catch (err) {
    console.error("downloadBlob failed:", err);
    return false;
  }
}

export async function downloadSvgString(svgString, filename) {
  if (!svgString) return false;
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  return downloadBlob(blob, filename);
}

/**
 * Native Web Share API helper for mobile sharing images directly to WhatsApp,
 * Instagram Stories, AirDrop, or saving to Camera Roll.
 */
export async function shareImageFile(dataUrl, filename, title, text) {
  if (!navigator.share || !navigator.canShare) {
    return false;
  }

  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new File([blob], filename, { type: blob.type || "image/png" });

    if (navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: title || filename,
        text: text || "",
        files: [file],
      });
      return true;
    }
  } catch (err) {
    if (err.name !== "AbortError") {
      console.warn("Web Share API failed:", err);
    }
  }
  return false;
}
