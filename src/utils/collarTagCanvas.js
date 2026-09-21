import QRCode from "qrcode";
import { parsePetLocation } from "../data/worldLocations";

/**
 * Ultra-realistic Physical Collar Tag Generator (3x3 cm / 30 mm)
 * Engineered specifically for 3D Printing (0.4mm nozzle FDM / SLA resin),
 * laser engraving, and real-life everyday durability.
 */

function loadSafeImage(src) {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = async () => {
      try {
        const res = await fetch(src, { mode: "cors" });
        if (res.ok) {
          const blob = await res.blob();
          const objUrl = URL.createObjectURL(blob);
          const bImg = new Image();
          bImg.onload = () => resolve(bImg);
          bImg.onerror = () => resolve(null);
          bImg.src = objUrl;
          return;
        }
      } catch {
        // Fallback error ignored
      }
      resolve(null);
    };
    img.src = src;
  });
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Get ear geometry parameters based on shape and body dimensions
 */
function getTagGeometry(cx, cy, R, shape = "circle") {
  if (shape === "circle") {
    const earR = R * 0.23;
    const earCy = cy - R * 0.98;
    const holeR = R * 0.11;
    const connectX = R * 0.36;
    const connectY = cy - Math.sqrt(R * R - connectX * connectX);
    const alpha = Math.atan2(connectY - cy, connectX);
    const beta = Math.atan2(connectY - cy, -connectX);
    return { earR, earCy, holeR, connectX, connectY, alpha, beta, topY: cy - R, bottomY: cy + R };
  } else {
    const topY = cy - R;
    const bottomY = cy + R;
    const earR = R * 0.23;
    const earCy = topY - earR * 0.35;
    const holeR = R * 0.11;
    const connectX = earR * 1.5;
    const cornerR = R * 0.28;
    return { earR, earCy, holeR, connectX, topY, bottomY, cornerR, leftX: cx - R, rightX: cx + R };
  }
}

/**
 * Mathematically continuous circular collar tag contour with integrated top suspension lug.
 */
function drawCircleTagContour(ctx, cx, cy, R) {
  const { earR, earCy, connectX, connectY, alpha, beta } = getTagGeometry(cx, cy, R, "circle");

  ctx.beginPath();
  // 1. Ear arch across top
  ctx.arc(cx, earCy, earR, Math.PI, 0, false);
  // 2. Smooth right fillet to circle
  ctx.quadraticCurveTo(cx + earR * 1.05, earCy + (connectY - earCy) * 0.5, cx + connectX, connectY);
  // 3. Main circle sweeping clockwise
  ctx.arc(cx, cy, R, alpha, beta, false);
  // 4. Smooth left fillet back to ear
  ctx.quadraticCurveTo(cx - earR * 1.05, earCy + (connectY - earCy) * 0.5, cx - earR, earCy);
  ctx.closePath();
}

/**
 * Mathematically continuous squircle (3x3 cm plate) collar tag with integrated top suspension lug.
 */
function drawSquircleTagContour(ctx, cx, cy, R) {
  const { earR, earCy, connectX, topY, bottomY, cornerR, leftX, rightX } = getTagGeometry(cx, cy, R, "square");

  ctx.beginPath();
  // 1. Start from left fillet on top edge
  ctx.moveTo(cx - connectX, topY);
  // 2. Curve up to ear
  ctx.quadraticCurveTo(cx - earR * 1.05, topY, cx - earR, earCy);
  // 3. Ear semicircle across top
  ctx.arc(cx, earCy, earR, Math.PI, 0, false);
  // 4. Curve down to right fillet on top edge
  ctx.quadraticCurveTo(cx + earR * 1.05, topY, cx + connectX, topY);
  // 5. Top edge to top-right corner
  ctx.lineTo(rightX - cornerR, topY);
  ctx.quadraticCurveTo(rightX, topY, rightX, topY + cornerR);
  // 6. Right edge to bottom-right corner
  ctx.lineTo(rightX, bottomY - cornerR);
  ctx.quadraticCurveTo(rightX, bottomY, rightX - cornerR, bottomY);
  // 7. Bottom edge to bottom-left corner
  ctx.lineTo(leftX + cornerR, bottomY);
  ctx.quadraticCurveTo(leftX, bottomY, leftX, bottomY - cornerR);
  // 8. Left edge to top-left corner
  ctx.lineTo(leftX, topY + cornerR);
  ctx.quadraticCurveTo(leftX, topY, leftX + cornerR, topY);
  // 9. Back to start
  ctx.lineTo(cx - connectX, topY);
  ctx.closePath();
}

function drawPhysicalContourPath(ctx, cx, cy, radius, shape = "circle") {
  if (shape === "circle") {
    drawCircleTagContour(ctx, cx, cy, radius);
  } else {
    drawSquircleTagContour(ctx, cx, cy, radius);
  }
}

/**
 * High-contrast 3D printable cameo relief for real pet photo.
 * Applies center-weighted radial vignetting so distracting background clutter
 * (fences, furniture, sky) fades into the dark medal base, leaving the pet's
 * face, ears, eyes, and chest sculpted in brilliant white relief!
 */
function drawMonochromeReliefPhoto(ctx, petPhoto, cx, cy, photoR) {
  const size = Math.round(photoR * 2);
  const offCanvas = document.createElement("canvas");
  offCanvas.width = size;
  offCanvas.height = size;
  const offCtx = offCanvas.getContext("2d");

  const aspect = petPhoto.width / petPhoto.height;
  let sw = petPhoto.width;
  let sh = petPhoto.height;
  let sx = 0;
  let sy = 0;
  if (aspect > 1) {
    sw = petPhoto.height;
    sx = (petPhoto.width - petPhoto.height) / 2;
  } else {
    sh = petPhoto.width;
    sy = (petPhoto.height - petPhoto.width) / 2;
  }

  offCtx.drawImage(petPhoto, sx, sy, sw, sh, 0, 0, size, size);

  try {
    const imgData = offCtx.getImageData(0, 0, size, size);
    const data = imgData.data;
    const centerOffset = size / 2;

    // Calculate mean luminance across center region
    let centerLumTotal = 0;
    let centerCount = 0;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const d = Math.hypot(x - centerOffset, y - centerOffset) / centerOffset;
        if (d <= 0.65) {
          centerLumTotal += 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
          centerCount++;
        }
      }
    }
    const avgLum = centerCount > 0 ? centerLumTotal / centerCount : 120;
    const threshold = Math.min(Math.max(avgLum * 0.90, 70), 155);

    // Apply artistic cameo threshold with smooth radial falloff
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const d = Math.hypot(x - centerOffset, y - centerOffset) / centerOffset;

        if (d >= 0.98) {
          // Outside medal border -> pure black base
          data[idx] = 10;
          data[idx + 1] = 15;
          data[idx + 2] = 29;
          data[idx + 3] = 255;
          continue;
        }

        // Radial falloff: suppress distracting background around perimeter
        const vignette = d < 0.60 ? 1.0 : Math.cos(((d - 0.60) / 0.38) * Math.PI * 0.5);
        const rawLum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
        const effectiveLum = rawLum * vignette;

        const isRelief = effectiveLum >= threshold;
        data[idx] = isRelief ? 255 : 10;
        data[idx + 1] = isRelief ? 255 : 15;
        data[idx + 2] = isRelief ? 255 : 29;
        data[idx + 3] = 255;
      }
    }
    offCtx.putImageData(imgData, 0, 0);

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, photoR - 4, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(offCanvas, cx - photoR, cy - photoR, photoR * 2, photoR * 2);
    ctx.restore();
  } catch {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, photoR - 4, 0, Math.PI * 2);
    ctx.clip();
    ctx.filter = "grayscale(100%) contrast(250%) brightness(105%)";
    ctx.drawImage(petPhoto, sx, sy, sw, sh, cx - photoR, cy - photoR, photoR * 2, photoR * 2);
    ctx.restore();
  }
}

/**
 * Minimalist sleek vector paw silhouette when no photo is uploaded
 */
function drawSilhouettePlaceholder(ctx, cx, cy, photoR) {
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.ellipse(cx, cy + photoR * 0.15, photoR * 0.35, photoR * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();

  const toeOffsets = [
    { dx: -photoR * 0.35, dy: -photoR * 0.18, rx: photoR * 0.12, ry: photoR * 0.16, rot: -0.3 },
    { dx: -photoR * 0.12, dy: -photoR * 0.32, rx: photoR * 0.13, ry: photoR * 0.18, rot: -0.1 },
    { dx: photoR * 0.12, dy: -photoR * 0.32, rx: photoR * 0.13, ry: photoR * 0.18, rot: 0.1 },
    { dx: photoR * 0.35, dy: -photoR * 0.18, rx: photoR * 0.12, ry: photoR * 0.16, rot: 0.3 },
  ];
  toeOffsets.forEach(({ dx, dy, rx, ry, rot }) => {
    ctx.beginPath();
    ctx.ellipse(cx + dx, cy + dy, rx, ry, rot, 0, Math.PI * 2);
    ctx.fill();
  });
}

/**
 * Draw a single collar tag face (Front or Back) calibrated for 3x3 cm 3D printing.
 */
async function drawTagFace(ctx, cx, cy, size, pet, { shape = "circle", finish = "gold", side = "front", petPhoto = null, qrDataUrl = null }) {
  ctx.save();

  // 30mm medal main radius (360 px in 960 px canvas)
  const mainR = size * 0.375;
  const mainCy = cy + size * 0.038;

  const geom = getTagGeometry(cx, mainCy, mainR, shape);
  const earCy = geom.earCy;
  const holeR = geom.holeR;

  // 1. Realistic Drop Shadow for preview
  ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
  ctx.shadowBlur = size * 0.045;
  ctx.shadowOffsetY = size * 0.025;

  // 2. Draw physical 3D base plate contour
  drawPhysicalContourPath(ctx, cx, mainCy, mainR, shape);

  // Material Body Fill
  if (finish === "gold") {
    const goldGrad = ctx.createLinearGradient(cx - mainR, mainCy - mainR * 1.1, cx + mainR, mainCy + mainR * 1.1);
    goldGrad.addColorStop(0, "#FFFCE8");
    goldGrad.addColorStop(0.18, "#F5D061");
    goldGrad.addColorStop(0.42, "#D49B28");
    goldGrad.addColorStop(0.68, "#FDE68A");
    goldGrad.addColorStop(0.85, "#A16207");
    goldGrad.addColorStop(1, "#592E04");
    ctx.fillStyle = goldGrad;
  } else if (finish === "silver") {
    const silverGrad = ctx.createLinearGradient(cx - mainR, mainCy - mainR * 1.1, cx + mainR, mainCy + mainR * 1.1);
    silverGrad.addColorStop(0, "#FFFFFF");
    silverGrad.addColorStop(0.25, "#F8FAFC");
    silverGrad.addColorStop(0.5, "#94A3B8");
    silverGrad.addColorStop(0.75, "#CBD5E1");
    silverGrad.addColorStop(1, "#334155");
    ctx.fillStyle = silverGrad;
  } else if (finish === "3dprint") {
    // Pure Solid Deep Black Base for Slicers
    ctx.fillStyle = "#0A0F1D";
  } else {
    // Luxury Onyx Black Enamel
    const blackGrad = ctx.createLinearGradient(cx - mainR, mainCy - mainR * 1.1, cx + mainR, mainCy + mainR * 1.1);
    blackGrad.addColorStop(0, "#1E293B");
    blackGrad.addColorStop(0.5, "#0F172A");
    blackGrad.addColorStop(1, "#020617");
    ctx.fillStyle = blackGrad;
  }
  ctx.fill();

  ctx.restore();
  ctx.save();

  // 3. Raised Outer Beveled Rim (Solid, clean perimeter wall)
  ctx.lineWidth = size * 0.022;
  ctx.strokeStyle = finish === "gold" ? "#D97706" : finish === "silver" ? "#CBD5E1" : finish === "3dprint" ? "#FFFFFF" : "#D4AF37";
  drawPhysicalContourPath(ctx, cx, mainCy, mainR, shape);
  ctx.stroke();

  // Subtle inner face groove: frames ONLY the main body without crowding or cutting into the ear!
  if (finish !== "3dprint") {
    ctx.lineWidth = size * 0.005;
    ctx.strokeStyle = finish === "gold" ? "rgba(180, 83, 9, 0.32)" : "rgba(0,0,0,0.20)";
    if (shape === "circle") {
      ctx.beginPath();
      // Sweeps only from right ear fillet around bottom to left ear fillet
      ctx.arc(cx, mainCy, mainR - 20, geom.alpha, geom.beta, false);
      ctx.stroke();
    } else {
      roundRect(ctx, geom.leftX + 20, geom.topY + 20, mainR * 2 - 40, mainR * 2 - 40, geom.cornerR - 8);
      ctx.stroke();
    }
  }

  // 4. Perforated Collar Suspension Eyelet (Single clean through-hole, concentric with ear)
  ctx.fillStyle = finish === "3dprint" ? "#000000" : "#E2E8F0";
  ctx.beginPath();
  ctx.arc(cx, earCy, holeR, 0, Math.PI * 2);
  ctx.fill();

  ctx.lineWidth = 2.5;
  ctx.strokeStyle = finish === "gold" ? "#F59E0B" : finish === "silver" ? "#94A3B8" : finish === "3dprint" ? "#FFFFFF" : "#D4AF37";
  ctx.stroke();

  // ---------------------------------------------------------------------------
  // 5. CONTENT: CARA A (ANVERSO) - PERFECTLY BALANCED HERO LAYOUT
  // ---------------------------------------------------------------------------
  if (side === "front") {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // 5A. Pet Photo Medallion (Centered, ~17mm physical diameter)
    const photoCenterY = mainCy - mainR * 0.28;
    const photoR = mainR * 0.38;

    // Dual-ring coin bezel
    ctx.lineWidth = 5;
    ctx.strokeStyle = finish === "gold" ? "#D97706" : finish === "silver" ? "#94A3B8" : finish === "3dprint" ? "#FFFFFF" : "#D4AF37";
    ctx.fillStyle = finish === "3dprint" ? "#0A0F1D" : "#FFFFFF";
    ctx.beginPath();
    ctx.arc(cx, photoCenterY, photoR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.lineWidth = 2;
    ctx.strokeStyle = finish === "gold" ? "#FDE047" : finish === "silver" ? "#F1F5F9" : finish === "3dprint" ? "#FFFFFF" : "#FDE047";
    ctx.beginPath();
    ctx.arc(cx, photoCenterY, photoR - 5, 0, Math.PI * 2);
    ctx.stroke();

    if (petPhoto && finish === "3dprint") {
      drawMonochromeReliefPhoto(ctx, petPhoto, cx, photoCenterY, photoR);
    } else if (petPhoto) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, photoCenterY, photoR - 7, 0, Math.PI * 2);
      ctx.clip();

      const aspect = petPhoto.width / petPhoto.height;
      let sw = petPhoto.width;
      let sh = petPhoto.height;
      let sx = 0;
      let sy = 0;
      if (aspect > 1) {
        sw = petPhoto.height;
        sx = (petPhoto.width - petPhoto.height) / 2;
      } else {
        sh = petPhoto.width;
        sy = (petPhoto.height - petPhoto.width) / 2;
      }
      ctx.drawImage(petPhoto, sx, sy, sw, sh, cx - photoR, photoCenterY - photoR, photoR * 2, photoR * 2);
      ctx.restore();
    } else {
      drawSilhouettePlaceholder(ctx, cx, photoCenterY, photoR);
    }

    // 5B. Pet Name (HERO: Extra Large, Extra Bold, Perfectly Centered)
    const nameY = photoCenterY + photoR + size * 0.062;
    ctx.fillStyle = finish === "black" ? "#FFFFFF" : finish === "3dprint" ? "#FFFFFF" : "#1C1917";
    ctx.font = `900 ${Math.round(size * 0.088)}px 'Outfit', sans-serif`;
    ctx.letterSpacing = "1.8px";
    const displayName = (pet.name || "Mascota").toUpperCase().slice(0, 10);
    ctx.fillText(displayName, cx, nameY);

    // 5C. Official Identification Capsule (PET-0002-ES)
    const pillY = nameY + size * 0.070;
    const pillW = size * 0.46;
    const pillH = size * 0.065;

    ctx.fillStyle = finish === "3dprint" ? "#000000" : "#18181B";
    ctx.strokeStyle = finish === "3dprint" ? "#FFFFFF" : finish === "gold" ? "#F59E0B" : finish === "silver" ? "#CBD5E1" : "#D4AF37";
    ctx.lineWidth = finish === "3dprint" ? 3.5 : 2.0;
    roundRect(ctx, cx - pillW / 2, pillY - pillH / 2, pillW, pillH, pillH / 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = finish === "3dprint" ? "#FFFFFF" : finish === "silver" ? "#FFFFFF" : "#FDE047";
    ctx.font = `900 ${Math.round(size * 0.038)}px monospace`;
    ctx.letterSpacing = "2px";
    ctx.fillText(pet.code || "PET-0000-ES", cx, pillY);

    // 5D. Location (Clean, Bold, Ample Bottom Margin)
    const loc = parsePetLocation(pet.city, pet);
    const locY = pillY + size * 0.058;
    ctx.fillStyle = finish === "black" ? "#FDE047" : finish === "3dprint" ? "#FFFFFF" : "#78350F";
    ctx.font = `800 ${Math.round(size * 0.032)}px 'Plus Jakarta Sans', sans-serif`;
    ctx.letterSpacing = "3.5px";
    const locationStr = (loc.cityName || pet.city || "ESPAÑA").toUpperCase();
    ctx.fillText(locationStr, cx, locY);
  }

  // ---------------------------------------------------------------------------
  // 6. CONTENT: CARA B (REVERSO - RESCUE QR CODE)
  // Perfectly spaced intervals: Header -> Gap -> QR -> Gap -> CTA -> Link
  // ---------------------------------------------------------------------------
  if (side === "back") {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // 6A. Emergency Header (Well above the QR box)
    const sosY = mainCy - mainR * 0.68;
    ctx.fillStyle = finish === "3dprint" ? "#FFFFFF" : "#DC2626";
    ctx.font = `900 ${Math.round(size * 0.036)}px 'Plus Jakarta Sans', sans-serif`;
    ctx.letterSpacing = "2px";
    ctx.fillText("SOS · ESCÁNAME", cx, sosY);

    // 6B. High-Contrast QR Code Badge (Rounded ceramic card with metallic border)
    const qrSize = mainR * 0.94;
    const qrY = mainCy - mainR * 0.08;

    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = finish === "gold" ? "#F59E0B" : finish === "silver" ? "#94A3B8" : finish === "3dprint" ? "#FFFFFF" : "#D4AF37";
    ctx.lineWidth = size * 0.012;
    roundRect(ctx, cx - qrSize / 2, qrY - qrSize / 2, qrSize, qrSize, size * 0.030);
    ctx.fill();
    ctx.stroke();

    if (qrDataUrl) {
      const qrImg = await loadSafeImage(qrDataUrl);
      if (qrImg) {
        const qrPadding = size * 0.020;
        ctx.drawImage(qrImg, cx - qrSize / 2 + qrPadding, qrY - qrSize / 2 + qrPadding, qrSize - qrPadding * 2, qrSize - qrPadding * 2);
      }
    }

    // 6C. Call To Action Below QR
    const ctaY = qrY + qrSize / 2 + size * 0.052;
    ctx.fillStyle = finish === "black" ? "#FFFFFF" : finish === "3dprint" ? "#FFFFFF" : "#0F172A";
    ctx.font = `800 ${Math.round(size * 0.030)}px 'Plus Jakarta Sans', sans-serif`;
    ctx.letterSpacing = "1.5px";
    ctx.fillText("ESCÁNAME CON EL MÓVIL", cx, ctaY);

    // 6D. Contact / Web Link (Guaranteed inside boundary with >120px margin to bottom rim)
    const linkY = ctaY + size * 0.046;
    ctx.fillStyle = finish === "black" ? "#FDE047" : finish === "3dprint" ? "#FFFFFF" : "#78350F";
    ctx.font = `800 ${Math.round(size * 0.028)}px 'Plus Jakarta Sans', sans-serif`;
    ctx.letterSpacing = "1.2px";
    const contactText = pet.instagram ? `@${pet.instagram.replace(/^@/, "")}` : "theinternetpetwall.com";
    ctx.fillText(contactText, cx, linkY);
  }

  // 7. Light Sheen Glare (Disabled for 3D Print mode for clean slicing)
  if (finish !== "3dprint") {
    const sheenGrad = ctx.createLinearGradient(cx - mainR, mainCy - mainR, cx + mainR, mainCy + mainR);
    sheenGrad.addColorStop(0, "rgba(255, 255, 255, 0.4)");
    sheenGrad.addColorStop(0.3, "rgba(255, 255, 255, 0.08)");
    sheenGrad.addColorStop(0.6, "transparent");
    sheenGrad.addColorStop(0.85, "rgba(255, 255, 255, 0.12)");
    sheenGrad.addColorStop(1, "transparent");

    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = sheenGrad;
    drawPhysicalContourPath(ctx, cx, mainCy, mainR, shape);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Generate a single high-resolution collar tag view (Front or Back)
 */
export async function generateCollarTagDataUrl(pet, { shape = "circle", finish = "gold", side = "front" } = {}) {
  const canvas = document.createElement("canvas");
  const size = 960; // 300+ DPI at 30 mm
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, size, size);

  // Pre-load pet photo
  const petPhoto = pet.photoUrl || pet.photo_url ? await loadSafeImage(pet.photoUrl || pet.photo_url) : null;

  // Pre-generate scannable QR (Level M for larger printable pixels)
  const origin = typeof window !== "undefined" && window.location.origin ? window.location.origin : "https://theinternetpetwall.com";
  const targetUrl = `${origin}/wall?pet=${encodeURIComponent(pet.code || pet.id)}`;
  const qrDataUrl = await QRCode.toDataURL(targetUrl, {
    width: 400,
    margin: 1,
    color: { dark: "#000000", light: "#FFFFFF" },
    errorCorrectionLevel: "M",
  });

  await drawTagFace(ctx, size / 2, size / 2, size, pet, {
    shape,
    finish,
    side,
    petPhoto,
    qrDataUrl,
  });

  return canvas.toDataURL("image/png");
}

/**
 * Generate a complete 1:1 physical scale Printable Sheet (Plantilla de Impresión 3x3 cm)
 */
export async function generatePrintableTagSheetDataUrl(pet, { shape = "circle", finish = "gold" } = {}) {
  const canvas = document.createElement("canvas");
  const width = 1600;
  const height = 1200;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  // White printable canvas
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, width, height);

  // Outer border & header
  ctx.strokeStyle = "#CBD5E1";
  ctx.lineWidth = 3;
  ctx.strokeRect(36, 36, width - 72, height - 72);

  // Header Title
  ctx.textAlign = "center";
  ctx.fillStyle = "#0F172A";
  ctx.font = "800 34px 'Outfit', sans-serif";
  ctx.fillText("PLANTILLA OFICIAL CHAPA COLLAR 3x3 CM (30 MM)", width / 2, 90);

  ctx.fillStyle = "#D97706";
  ctx.font = "700 20px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText(`THE INTERNET PET WALL · ${pet.name.toUpperCase()} (${pet.code})`, width / 2, 126);

  ctx.fillStyle = "#64748B";
  ctx.font = "500 15px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText("Medida física exacta: 30 x 30 mm · Optimizada para Boquilla 0.4 mm FDM, Resina o Recorte 1:1", width / 2, 156);

  // Divider
  ctx.strokeStyle = "#E2E8F0";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(80, 185);
  ctx.lineTo(width - 80, 185);
  ctx.stroke();

  // Load photo & QR
  const petPhoto = pet.photoUrl || pet.photo_url ? await loadSafeImage(pet.photoUrl || pet.photo_url) : null;
  const origin = typeof window !== "undefined" && window.location.origin ? window.location.origin : "https://theinternetpetwall.com";
  const targetUrl = `${origin}/wall?pet=${encodeURIComponent(pet.code || pet.id)}`;
  const qrDataUrl = await QRCode.toDataURL(targetUrl, {
    width: 400,
    margin: 1,
    color: { dark: "#000000", light: "#FFFFFF" },
    errorCorrectionLevel: "M",
  });

  const tagSize = 500;
  const centerY = 520;
  const leftX = width / 2 - 280;
  const rightX = width / 2 + 280;

  // Face Labels
  ctx.fillStyle = "#0F172A";
  ctx.font = "800 20px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText("ANVERSO (FOTO Y NOMBRE)", leftX, centerY - tagSize / 2 + 10);
  ctx.fillText("REVERSO (QR Y SOS RESCATE)", rightX, centerY - tagSize / 2 + 10);

  // Draw Front Face
  await drawTagFace(ctx, leftX, centerY, tagSize, pet, {
    shape,
    finish,
    side: "front",
    petPhoto,
    qrDataUrl,
  });

  // Draw Back Face
  await drawTagFace(ctx, rightX, centerY, tagSize, pet, {
    shape,
    finish,
    side: "back",
    petPhoto,
    qrDataUrl,
  });

  // Fold line indicator between both faces
  ctx.save();
  ctx.setLineDash([8, 6]);
  ctx.strokeStyle = "#94A3B8";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width / 2, centerY - tagSize / 2 + 10);
  ctx.lineTo(width / 2, centerY + tagSize / 2 + 20);
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = "#64748B";
  ctx.font = "600 14px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText("✂️ LÍNEA DE CORTE / PLEGADO ✂️", width / 2, centerY + tagSize / 2 + 45);

  // 3D Printing parameters box
  const boxY = height - 320;
  const boxW = 860;
  const boxX = (width - boxW) / 2;

  ctx.fillStyle = "#F8FAFC";
  ctx.strokeStyle = "#CBD5E1";
  ctx.lineWidth = 1.5;
  roundRect(ctx, boxX, boxY, boxW, 110, 12);
  ctx.fill();
  ctx.stroke();

  ctx.textAlign = "left";
  ctx.fillStyle = "#0F172A";
  ctx.font = "800 16px 'Outfit', sans-serif";
  ctx.fillText("🖨️ PARÁMETROS RECOMENDADOS PARA IMPRESIÓN 3D (BOQUILLA 0.4 MM):", boxX + 24, boxY + 30);

  ctx.fillStyle = "#475569";
  ctx.font = "600 13px 'Plus Jakarta Sans', monospace";
  ctx.fillText("• Diámetro cuerpo: 30.0 mm | Altura con orejeta: 35.0 mm | Grosor total: 3.2 mm (16 capas a 0.20 mm)", boxX + 24, boxY + 58);
  ctx.fillText("• Base: 2.2 mm (capas 1 a 11) | Relieves: 1.0 mm (cambio a capa 12) | Grosor mínimo de línea: >0.5 mm", boxX + 24, boxY + 84);

  // REAL PHYSICAL MILLIMETER RULER GUIDE (3.0 cm = 30 mm)
  const rulerY = height - 160;
  const rulerW = 420;
  const rulerX = (width - rulerW) / 2;

  ctx.fillStyle = "#FFFFFF";
  ctx.strokeStyle = "#94A3B8";
  ctx.lineWidth = 2;
  roundRect(ctx, rulerX, rulerY, rulerW, 65, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#0F172A";
  ctx.font = "700 13px monospace";
  ctx.textAlign = "left";
  ctx.fillText("📏 COMPROBACIÓN DE ESCALA: 3 CM (30 MM)", rulerX + 16, rulerY + 22);

  const tickY = rulerY + 38;
  const step = (rulerW - 40) / 3;
  ctx.strokeStyle = "#0F172A";
  ctx.lineWidth = 2;
  for (let i = 0; i <= 3; i++) {
    const tx = rulerX + 20 + i * step;
    ctx.beginPath();
    ctx.moveTo(tx, tickY);
    ctx.lineTo(tx, tickY + 14);
    ctx.stroke();

    ctx.font = "700 12px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`${i} cm`, tx, tickY + 24);
  }

  ctx.textAlign = "center";
  ctx.fillStyle = "#94A3B8";
  ctx.font = "500 13px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText("The Internet Pet Wall • theinternetpetwall.com • Medidas reales oficiales", width / 2, height - 40);

  return canvas.toDataURL("image/png");
}

function escapeXml(unsafe) {
  return String(unsafe || "").replace(/[<>&"']/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case '"': return "&quot;";
      case "'": return "&apos;";
      default: return c;
    }
  });
}

/**
 * Generate a ready-to-print vector .SVG for 3D slicers (Bambu Studio, PrusaSlicer, Cura, Orca, Tinkercad).
 * Sized 30mm x 35mm with separated Base Body and Raised Relief layers.
 * Embeds the real pet cameo portrait and provides perfect spacing without text/ear collisions.
 */
export async function generateCollarTagSvg(pet, { shape = "circle", side = "front" } = {}) {
  const cx = 150;
  const cy = 195;
  const R = 125;
  const earR = 28;
  const earCy = 55;
  const holeR = 13.5;

  let contourPath = "";

  if (shape === "circle") {
    const connectX = 40;
    const connectY = cy - Math.sqrt(R * R - connectX * connectX);
    contourPath =
      `M ${cx - earR} ${earCy} ` +
      `A ${earR} ${earR} 0 0 1 ${cx + earR} ${earCy} ` +
      `Q ${(cx + earR * 1.05).toFixed(2)} 72 ${(cx + connectX).toFixed(2)} ${connectY.toFixed(2)} ` +
      `A ${R} ${R} 0 1 1 ${(cx - connectX).toFixed(2)} ${connectY.toFixed(2)} ` +
      `Q ${(cx - earR * 1.05).toFixed(2)} 72 ${cx - earR} ${earCy} Z`;
  } else {
    const topY = cy - R;
    const bottomY = cy + R;
    const leftX = cx - R;
    const rightX = cx + R;
    const connectX = earR * 1.5;
    const cornerR = R * 0.28;
    contourPath =
      `M ${(cx - connectX).toFixed(2)} ${topY} ` +
      `Q ${(cx - earR * 1.05).toFixed(2)} ${topY} ${(cx - earR).toFixed(2)} ${earCy.toFixed(2)} ` +
      `A ${earR} ${earR} 0 0 1 ${(cx + earR).toFixed(2)} ${earCy.toFixed(2)} ` +
      `Q ${(cx + earR * 1.05).toFixed(2)} ${topY} ${(cx + connectX).toFixed(2)} ${topY} ` +
      `L ${(rightX - cornerR).toFixed(2)} ${topY} Q ${rightX} ${topY} ${rightX} ${(topY + cornerR).toFixed(2)} ` +
      `L ${rightX} ${(bottomY - cornerR).toFixed(2)} Q ${rightX} ${bottomY} ${(rightX - cornerR).toFixed(2)} ${bottomY} ` +
      `L ${(leftX + cornerR).toFixed(2)} ${bottomY} Q ${leftX} ${bottomY} ${leftX} ${(bottomY - cornerR).toFixed(2)} ` +
      `L ${leftX} ${(topY + cornerR).toFixed(2)} Q ${leftX} ${topY} ${(leftX + cornerR).toFixed(2)} ${topY} ` +
      `L ${(cx - connectX).toFixed(2)} ${topY} Z`;
  }

  // Ring hole path (concentric with ear)
  const holePath = `M ${cx - holeR} ${earCy} A ${holeR} ${holeR} 0 1 0 ${cx + holeR} ${earCy} A ${holeR} ${holeR} 0 1 0 ${cx - holeR} ${earCy} Z`;

  // QR Code generation if side === "back"
  let qrSvgContent = "";
  if (side === "back") {
    const origin = typeof window !== "undefined" && window.location.origin ? window.location.origin : "https://theinternetpetwall.com";
    const targetUrl = `${origin}/wall?pet=${encodeURIComponent(pet.code || pet.id)}`;
    try {
      const qrRaw = await new Promise((res, rej) => {
        QRCode.toString(targetUrl, { type: "svg", margin: 0, errorCorrectionLevel: "M" }, (err, svg) => {
          if (err) rej(err); else res(svg);
        });
      });
      const pathMatch = qrRaw.match(/<path[^>]*stroke=\"#000000\"[^>]*d=\"([^\"]+)\"/);
      if (pathMatch) {
        qrSvgContent = `
        <rect x="96" y="126" width="108" height="108" rx="10" fill="#FFFFFF"/>
        <g transform="translate(100, 130) scale(3.35)">
          <path d="${pathMatch[1]}" stroke="#000000" stroke-width="1"/>
        </g>`;
      }
    } catch (e) {
      console.warn("Could not generate vector QR for SVG:", e);
    }
  }

  // Real pet photo cameo generation for Front
  let cameoImageSvg = "";
  if (side === "front") {
    const photoUrl = pet.photoUrl || pet.photo_url;
    let petPhoto = null;
    if (photoUrl && typeof document !== "undefined") {
      petPhoto = await loadSafeImage(photoUrl);
    }
    if (petPhoto && typeof document !== "undefined") {
      try {
        const offCanvas = document.createElement("canvas");
        const cSize = 250;
        offCanvas.width = cSize;
        offCanvas.height = cSize;
        const offCtx = offCanvas.getContext("2d");

        const aspect = petPhoto.width / petPhoto.height;
        let sw = petPhoto.width;
        let sh = petPhoto.height;
        let sx = 0;
        let sy = 0;
        if (aspect > 1) {
          sw = petPhoto.height;
          sx = (petPhoto.width - petPhoto.height) / 2;
        } else {
          sh = petPhoto.width;
          sy = (petPhoto.height - petPhoto.width) / 2;
        }
        offCtx.drawImage(petPhoto, sx, sy, sw, sh, 0, 0, cSize, cSize);

        const imgData = offCtx.getImageData(0, 0, cSize, cSize);
        const data = imgData.data;
        const centerOffset = cSize / 2;

        let centerLumTotal = 0;
        let centerCount = 0;
        for (let y = 0; y < cSize; y++) {
          for (let x = 0; x < cSize; x++) {
            const idx = (y * cSize + x) * 4;
            const d = Math.hypot(x - centerOffset, y - centerOffset) / centerOffset;
            if (d <= 0.65) {
              centerLumTotal += 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
              centerCount++;
            }
          }
        }
        const avgLum = centerCount > 0 ? centerLumTotal / centerCount : 120;
        const threshold = Math.min(Math.max(avgLum * 0.90, 70), 155);

        for (let y = 0; y < cSize; y++) {
          for (let x = 0; x < cSize; x++) {
            const idx = (y * cSize + x) * 4;
            const d = Math.hypot(x - centerOffset, y - centerOffset) / centerOffset;
            if (d >= 0.98) {
              data[idx] = 10;
              data[idx + 1] = 15;
              data[idx + 2] = 29;
              data[idx + 3] = 255;
              continue;
            }
            const vignette = d < 0.60 ? 1.0 : Math.cos(((d - 0.60) / 0.38) * Math.PI * 0.5);
            const rawLum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
            const effectiveLum = rawLum * vignette;
            const isRelief = effectiveLum >= threshold;
            data[idx] = isRelief ? 255 : 10;
            data[idx + 1] = isRelief ? 255 : 15;
            data[idx + 2] = isRelief ? 255 : 29;
            data[idx + 3] = 255;
          }
        }
        offCtx.putImageData(imgData, 0, 0);
        const cameoDataUrl = offCanvas.toDataURL("image/png");

        cameoImageSvg = `
        <defs>
          <clipPath id="cameo-photo-clip">
            <circle cx="${cx}" cy="142" r="42"/>
          </clipPath>
        </defs>
        <image href="${cameoDataUrl}" x="${cx - 42}" y="${142 - 42}" width="84" height="84" clip-path="url(#cameo-photo-clip)" preserveAspectRatio="xMidYMid slice"/>
        <circle cx="${cx}" cy="142" r="42" fill="none" stroke="#FFFFFF" stroke-width="3"/>
        `;
      } catch (err) {
        console.warn("Could not process cameo for SVG:", err);
      }
    }

    if (!cameoImageSvg) {
      cameoImageSvg = `
      <circle cx="${cx}" cy="142" r="42" fill="none" stroke="#FFFFFF" stroke-width="3"/>
      <circle cx="${cx}" cy="152" r="16" fill="#FFFFFF" stroke="none"/>
      <circle cx="${cx - 16}" cy="134" r="6" fill="#FFFFFF" stroke="none"/>
      <circle cx="${cx - 6}" cy="126" r="6.5" fill="#FFFFFF" stroke="none"/>
      <circle cx="${cx + 6}" cy="126" r="6.5" fill="#FFFFFF" stroke="none"/>
      <circle cx="${cx + 16}" cy="134" r="6" fill="#FFFFFF" stroke="none"/>
      `;
    }
  }

  const petName = escapeXml((pet.name || "PET").toUpperCase().slice(0, 10));
  const petCode = escapeXml(pet.code || "PET-0000-ES");
  const petCity = escapeXml((pet.city || "ESPAÑA").toUpperCase());
  const contactText = escapeXml(pet.instagram ? `@${pet.instagram.replace(/^@/, "")}` : "theinternetpetwall.com");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="30mm" height="35mm" viewBox="0 0 300 350" version="1.1">
  <title>Chapa Oficial ${petName} (${petCode}) - 30x35mm</title>
  <desc>Optimizado para boquilla 0.4mm FDM. Base: 2.2mm, Relieve: 1.0mm.</desc>

  <!-- LAYER 1: BASE BODY (2.2 mm height) with Ring Eyelet Cutout -->
  <g id="base-body" fill="#0A0F1D">
    <path fill-rule="evenodd" d="${contourPath} ${holePath}" />
  </g>

  <!-- LAYER 2: RAISED RELIEFS (1.0 mm height for dual-color extrusion) -->
  <g id="raised-reliefs" fill="#FFFFFF" stroke="#FFFFFF">
    <!-- Outer Rim Bevel -->
    <path d="${contourPath}" fill="none" stroke="#FFFFFF" stroke-width="4.5" stroke-linejoin="round"/>

    ${
      side === "front"
        ? `
    <!-- Photo Medallion Real Cameo -->
    ${cameoImageSvg}

    <!-- Hero Pet Name (Thick, printable stroke) -->
    <text x="${cx}" y="206" text-anchor="middle" fill="#FFFFFF" stroke="none" font-family="'Outfit', 'Plus Jakarta Sans', -apple-system, sans-serif" font-weight="900" font-size="22" letter-spacing="1.5">${petName}</text>

    <!-- Code Capsule -->
    <rect x="75" y="218" width="150" height="20" rx="10" fill="#000000" stroke="#FFFFFF" stroke-width="2.5"/>
    <text x="${cx}" y="232.5" text-anchor="middle" fill="#FFFFFF" stroke="none" font-family="'Courier New', Courier, monospace" font-weight="900" font-size="11" letter-spacing="1.5">${petCode}</text>

    <!-- City / Country -->
    <text x="${cx}" y="254" text-anchor="middle" fill="#FFFFFF" stroke="none" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="800" font-size="9" letter-spacing="2.5">${petCity}</text>
    `
        : `
    <!-- Back Header (Safely inside body, well below ear) -->
    <text x="${cx}" y="112" text-anchor="middle" fill="#FFFFFF" stroke="none" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="900" font-size="10.5" letter-spacing="1.5">SOS · ESCÁNAME</text>

    <!-- QR Code Card -->
    ${qrSvgContent}

    <!-- Call to action -->
    <text x="${cx}" y="254" text-anchor="middle" fill="#FFFFFF" stroke="none" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="800" font-size="9" letter-spacing="0.8">ESCÁNAME CON EL MÓVIL</text>
    <text x="${cx}" y="268" text-anchor="middle" fill="#FFFFFF" stroke="none" font-family="'Plus Jakarta Sans', monospace" font-weight="800" font-size="7.5" letter-spacing="1">${contactText}</text>
    `
    }
  </g>
</svg>`;
}
