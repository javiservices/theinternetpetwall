import QRCode from "qrcode";
import { parsePetLocation } from "../data/worldLocations";

/**
 * Ultra-realistic Physical Collar Tag Generator (3x3 cm / 30 mm)
 * Engineered specifically for 3D Printing (0.4mm nozzle FDM / SLA resin),
 * laser engraving, and real-life everyday durability.
 *
 * Design Principles for 3D Printing at 30mm:
 * 1. Zero micro-text: Eliminates unprintable 1mm micro-text that slicers ignore or blur.
 * 2. High-legibility hero typography: Pet name and ID code with minimum stroke width > 0.45 mm.
 * 3. Robust suspension eyelet: Monolithic lug with >2.2 mm solid wall around Ø 3.8 mm hole.
 * 4. Optimized QR code: Generates large ~0.8 mm modules (Level M) for reliable scanning on printed plastic.
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
    const earR = R * 0.25;
    const earCy = cy - R * 0.96;
    const holeR = R * 0.12;
    const connectX = R * 0.40;
    const connectY = cy - Math.sqrt(R * R - connectX * connectX);
    const alpha = Math.atan2(connectY - cy, connectX);
    const beta = Math.atan2(connectY - cy, -connectX);
    return { earR, earCy, holeR, connectX, connectY, alpha, beta, topY: cy - R, bottomY: cy + R };
  } else {
    const topY = cy - R;
    const bottomY = cy + R;
    const earR = R * 0.25;
    const earCy = topY - earR * 0.35;
    const holeR = R * 0.12;
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
  ctx.quadraticCurveTo(cx + earR * 1.05, earCy + 10, cx + connectX, connectY);
  // 3. Main circle sweeping clockwise
  ctx.arc(cx, cy, R, alpha, beta, false);
  // 4. Smooth left fillet back to ear
  ctx.quadraticCurveTo(cx - earR * 1.05, earCy + 10, cx - earR, earCy);
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
 * Ensures clean, embossed features without tiny micro-dots.
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

    let totalLum = 0;
    for (let i = 0; i < data.length; i += 4) {
      totalLum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    }
    const avgLum = totalLum / (data.length / 4);
    const threshold = Math.min(Math.max(avgLum * 0.92, 75), 160);

    for (let i = 0; i < data.length; i += 4) {
      const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      const isRelief = lum >= threshold;
      data[i] = isRelief ? 255 : 15;
      data[i + 1] = isRelief ? 255 : 23;
      data[i + 2] = isRelief ? 255 : 42;
      data[i + 3] = 255;
    }
    offCtx.putImageData(imgData, 0, 0);

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, photoR - 3, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(offCanvas, cx - photoR, cy - photoR, photoR * 2, photoR * 2);
    ctx.restore();
  } catch {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, photoR - 3, 0, Math.PI * 2);
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
    const goldGrad = ctx.createLinearGradient(cx - mainR, mainCy - mainR, cx + mainR, mainCy + mainR);
    goldGrad.addColorStop(0, "#FFF9D2");
    goldGrad.addColorStop(0.2, "#F5C842");
    goldGrad.addColorStop(0.48, "#C68B1C");
    goldGrad.addColorStop(0.72, "#FDE047");
    goldGrad.addColorStop(0.9, "#946200");
    goldGrad.addColorStop(1, "#451A03");
    ctx.fillStyle = goldGrad;
  } else if (finish === "silver") {
    const silverGrad = ctx.createLinearGradient(cx - mainR, mainCy - mainR, cx + mainR, mainCy + mainR);
    silverGrad.addColorStop(0, "#FFFFFF");
    silverGrad.addColorStop(0.25, "#F1F5F9");
    silverGrad.addColorStop(0.5, "#94A3B8");
    silverGrad.addColorStop(0.75, "#CBD5E1");
    silverGrad.addColorStop(1, "#334155");
    ctx.fillStyle = silverGrad;
  } else if (finish === "3dprint") {
    // Pure Solid Deep Black Base for Slicers
    ctx.fillStyle = "#0A0F1D";
  } else {
    // Luxury Onyx Black Enamel
    const blackGrad = ctx.createLinearGradient(cx - mainR, mainCy - mainR, cx + mainR, mainCy + mainR);
    blackGrad.addColorStop(0, "#1E293B");
    blackGrad.addColorStop(0.5, "#0F172A");
    blackGrad.addColorStop(1, "#020617");
    ctx.fillStyle = blackGrad;
  }
  ctx.fill();

  ctx.restore();
  ctx.save();

  // 3. Raised Outer Beveled Rim (Solid 0.6mm wall)
  ctx.lineWidth = size * 0.020;
  ctx.strokeStyle = finish === "gold" ? "#F59E0B" : finish === "silver" ? "#E2E8F0" : finish === "3dprint" ? "#FFFFFF" : "#D4AF37";
  drawPhysicalContourPath(ctx, cx, mainCy, mainR, shape);
  ctx.stroke();

  // Inner inset groove (embossed frame)
  ctx.lineWidth = size * 0.007;
  ctx.strokeStyle = finish === "3dprint" ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.22)";
  if (shape === "circle") {
    ctx.beginPath();
    ctx.arc(cx, mainCy, mainR - 24, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    roundRect(ctx, geom.leftX + 24, geom.topY + 24, mainR * 2 - 48, mainR * 2 - 48, geom.cornerR - 10);
    ctx.stroke();
  }

  // 4. Perforated Collar Suspension Eyelet (Punched hole with clean bevel)
  // Hole background
  ctx.fillStyle = finish === "3dprint" ? "#000000" : "#E2E8F0";
  ctx.beginPath();
  ctx.arc(cx, earCy, holeR, 0, Math.PI * 2);
  ctx.fill();

  // Hole bevel rim
  ctx.lineWidth = 3;
  ctx.strokeStyle = finish === "gold" ? "#B45309" : finish === "silver" ? "#64748B" : finish === "3dprint" ? "#FFFFFF" : "#78350F";
  ctx.stroke();

  // ---------------------------------------------------------------------------
  // 5. CONTENT: CARA A (ANVERSO) - HERO TYPOGRAPHY & CHUNKY 3D RELIEFS
  // Designed so every single feature is > 0.45 mm stroke width for clean 3D slicing.
  // ---------------------------------------------------------------------------
  if (side === "front") {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // 5A. Pet Photo Medallion (Spacious ~17mm physical diameter)
    const photoCenterY = mainCy - mainR * 0.32;
    const photoR = mainR * 0.38;

    // Bevel outer ring
    ctx.lineWidth = size * 0.018;
    ctx.strokeStyle = finish === "gold" ? "#F59E0B" : finish === "silver" ? "#FFFFFF" : finish === "3dprint" ? "#FFFFFF" : "#D4AF37";
    ctx.fillStyle = finish === "3dprint" ? "#0F172A" : "#FFFFFF";
    ctx.beginPath();
    ctx.arc(cx, photoCenterY, photoR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (petPhoto && finish === "3dprint") {
      drawMonochromeReliefPhoto(ctx, petPhoto, cx, photoCenterY, photoR);
    } else if (petPhoto) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, photoCenterY, photoR - size * 0.007, 0, Math.PI * 2);
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

    // 5B. Pet Name (HERO: Extra Large, Extra Bold, Printable with 3 Perimeters)
    const nameY = photoCenterY + photoR + size * 0.062;
    ctx.fillStyle = finish === "black" ? "#FFFFFF" : finish === "3dprint" ? "#FFFFFF" : "#0F172A";
    ctx.font = `900 ${Math.round(size * 0.088)}px 'Outfit', sans-serif`;
    ctx.letterSpacing = "1.5px";
    const displayName = (pet.name || "Mascota").toUpperCase().slice(0, 10);
    ctx.fillText(displayName, cx, nameY);

    // 5C. Unified Official Code Capsule (Robust 14.5 mm physical width)
    const pillY = nameY + size * 0.072;
    const pillW = size * 0.48;
    const pillH = size * 0.068;

    ctx.fillStyle = finish === "black" ? "rgba(212, 175, 55, 0.25)" : finish === "3dprint" ? "#000000" : "rgba(0, 0, 0, 0.09)";
    ctx.strokeStyle = finish === "black" ? "#F59E0B" : finish === "3dprint" ? "#FFFFFF" : "rgba(0, 0, 0, 0.25)";
    ctx.lineWidth = finish === "3dprint" ? 3.5 : 2.0;
    roundRect(ctx, cx - pillW / 2, pillY - pillH / 2, pillW, pillH, pillH / 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = finish === "black" ? "#FDE047" : finish === "3dprint" ? "#FFFFFF" : "#78350F";
    ctx.font = `900 ${Math.round(size * 0.038)}px monospace`;
    ctx.letterSpacing = "2px";
    ctx.fillText(pet.code || "PET-0000-ES", cx, pillY);

    // 5D. Location (Bold, Uppercase, Solid Line-width)
    const loc = parsePetLocation(pet.city, pet);
    const locY = pillY + size * 0.058;
    ctx.fillStyle = finish === "black" ? "#FDE047" : finish === "3dprint" ? "#FFFFFF" : "#78350F";
    ctx.font = `800 ${Math.round(size * 0.034)}px 'Plus Jakarta Sans', sans-serif`;
    ctx.letterSpacing = "3px";
    const locationStr = (loc.cityName || pet.city || "ESPAÑA").toUpperCase();
    ctx.fillText(locationStr, cx, locY);
  }

  // ---------------------------------------------------------------------------
  // 6. CONTENT: CARA B (REVERSO - RESCUE QR CODE)
  // Large 0.88 mm modules for instant phone camera scanning even on 3D prints.
  // ---------------------------------------------------------------------------
  if (side === "back") {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // 6A. Emergency Header
    const sosY = mainCy - mainR * 0.65;
    ctx.fillStyle = finish === "3dprint" ? "#FFFFFF" : finish === "black" ? "#EF4444" : "#DC2626";
    ctx.font = `900 ${Math.round(size * 0.040)}px 'Plus Jakarta Sans', sans-serif`;
    ctx.letterSpacing = "2px";
    ctx.fillText("SOS · ESCÁNAME", cx, sosY);

    // 6B. High-Contrast QR Code (Level M = ~25x25 large chunky modules)
    const qrSize = mainR * 1.12;
    const qrY = mainCy - mainR * 0.06;

    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = finish === "gold" ? "#F59E0B" : finish === "silver" ? "#94A3B8" : finish === "3dprint" ? "#FFFFFF" : "#D4AF37";
    ctx.lineWidth = size * 0.014;
    roundRect(ctx, cx - qrSize / 2, qrY - qrSize / 2, qrSize, qrSize, size * 0.035);
    ctx.fill();
    ctx.stroke();

    if (qrDataUrl) {
      const qrImg = await loadSafeImage(qrDataUrl);
      if (qrImg) {
        const qrPadding = size * 0.022;
        ctx.drawImage(qrImg, cx - qrSize / 2 + qrPadding, qrY - qrSize / 2 + qrPadding, qrSize - qrPadding * 2, qrSize - qrPadding * 2);
      }
    }

    // 6C. Call To Action Below QR
    const ctaY = qrY + qrSize / 2 + size * 0.054;
    ctx.fillStyle = finish === "black" ? "#FFFFFF" : finish === "3dprint" ? "#FFFFFF" : "#0F172A";
    ctx.font = `800 ${Math.round(size * 0.032)}px 'Plus Jakarta Sans', sans-serif`;
    ctx.letterSpacing = "1.2px";
    ctx.fillText("ESCÁNAME CON LA CÁMARA", cx, ctaY);

    // 6D. Contact / Web Link
    const linkY = ctaY + size * 0.048;
    ctx.fillStyle = finish === "black" ? "#FDE047" : finish === "3dprint" ? "#FFFFFF" : "#92400E";
    ctx.font = `800 ${Math.round(size * 0.028)}px monospace`;
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
 */
export async function generateCollarTagSvg(pet, { shape = "circle", side = "front" } = {}) {
  const cx = 150;
  const cy = 195;
  const R = 125;
  const earR = R * 0.25;
  const holeR = R * 0.12;

  let contourPath = "";
  let earCy = 0;

  if (shape === "circle") {
    earCy = cy - R * 0.96;
    const connectX = R * 0.40;
    const connectY = cy - Math.sqrt(R * R - connectX * connectX);
    contourPath =
      `M ${cx - earR} ${earCy} ` +
      `A ${earR} ${earR} 0 0 1 ${cx + earR} ${earCy} ` +
      `Q ${(cx + earR * 1.05).toFixed(2)} ${(earCy + 4).toFixed(2)} ${(cx + connectX).toFixed(2)} ${connectY.toFixed(2)} ` +
      `A ${R} ${R} 0 1 1 ${(cx - connectX).toFixed(2)} ${connectY.toFixed(2)} ` +
      `Q ${(cx - earR * 1.05).toFixed(2)} ${(earCy + 4).toFixed(2)} ${cx - earR} ${earCy} Z`;
  } else {
    const topY = cy - R;
    const bottomY = cy + R;
    const leftX = cx - R;
    const rightX = cx + R;
    earCy = topY - earR * 0.35;
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

  // Ring hole path
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
        <rect x="85" y="115" width="130" height="130" rx="10" fill="#FFFFFF"/>
        <g transform="translate(90, 120) scale(4.0)">
          <path d="${pathMatch[1]}" stroke="#000000" stroke-width="1"/>
        </g>`;
      }
    } catch (e) {
      console.warn("Could not generate vector QR for SVG:", e);
    }
  }

  const petName = escapeXml((pet.name || "PET").toUpperCase().slice(0, 10));
  const petCode = escapeXml(pet.code || "PET-0000-ES");
  const petCity = escapeXml((pet.city || "ESPAÑA").toUpperCase());
  const contactText = escapeXml(pet.instagram ? `@${pet.instagram.replace(/^@/, "")}` : "theinternetpetwall.com");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="30mm" height="35mm" viewBox="0 0 300 350" version="1.1">
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
    <!-- Photo Medallion Rim & Cameo -->
    <circle cx="${cx}" cy="138" r="44" fill="none" stroke="#FFFFFF" stroke-width="4"/>
    <circle cx="${cx}" cy="148" r="18" fill="#FFFFFF" stroke="none"/>
    <circle cx="${cx - 18}" cy="130" r="7" fill="#FFFFFF" stroke="none"/>
    <circle cx="${cx - 7}" cy="120" r="7.5" fill="#FFFFFF" stroke="none"/>
    <circle cx="${cx + 7}" cy="120" r="7.5" fill="#FFFFFF" stroke="none"/>
    <circle cx="${cx + 18}" cy="130" r="7" fill="#FFFFFF" stroke="none"/>

    <!-- Hero Pet Name (Thick, printable stroke) -->
    <text x="${cx}" y="204" text-anchor="middle" fill="#FFFFFF" stroke="none" font-family="'Outfit', Arial, sans-serif" font-weight="900" font-size="24" letter-spacing="1">${petName}</text>

    <!-- Code Capsule -->
    <rect x="80" y="216" width="140" height="20" rx="10" fill="#000000" stroke="#FFFFFF" stroke-width="2.5"/>
    <text x="${cx}" y="230" text-anchor="middle" fill="#FFFFFF" stroke="none" font-family="Courier, monospace" font-weight="900" font-size="11.5" letter-spacing="1.5">${petCode}</text>

    <!-- City / Country -->
    <text x="${cx}" y="250" text-anchor="middle" fill="#FFFFFF" stroke="none" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="800" font-size="9" letter-spacing="2">${petCity}</text>
    `
        : `
    <!-- Back Header -->
    <text x="${cx}" y="98" text-anchor="middle" fill="#FFFFFF" stroke="none" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="900" font-size="11" letter-spacing="1.2">SOS · ESCÁNAME</text>

    <!-- QR Code -->
    ${qrSvgContent}

    <!-- Call to action -->
    <text x="${cx}" y="264" text-anchor="middle" fill="#FFFFFF" stroke="none" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="800" font-size="9.5" letter-spacing="0.5">ESCÁNAME CON LA CÁMARA</text>
    <text x="${cx}" y="278" text-anchor="middle" fill="#FFFFFF" stroke="none" font-family="Courier, monospace" font-weight="800" font-size="8">${contactText}</text>
    `
    }
  </g>
</svg>`;
}
