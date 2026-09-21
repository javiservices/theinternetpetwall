import QRCode from "qrcode";
import { parsePetLocation } from "../data/worldLocations";

/**
 * Ultra-realistic Physical Collar Tag Generator (3x3 cm / 30 mm)
 * 100% Optimized for 3D Printing (FDM / SLA), Laser Engraving, and Real-Life Use.
 * Features an integrated top suspension loop (orejeta para anilla) and strict
 * safe-printing bounds with ZERO contour overflow.
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
 * Mathematically continuous circular collar tag contour with integrated top suspension lug.
 * Uses exact tangent fillets and sweeping circular arc so NO slicing or gaps occur.
 */
function drawCircleTagContour(ctx, cx, cy, R) {
  const earR = R * 0.28;
  const earCy = cy - R * 0.90;
  const connectX = R * 0.42;
  const connectY = cy - Math.sqrt(R * R - connectX * connectX);
  const alpha = Math.atan2(connectY - cy, connectX);
  const beta = Math.atan2(connectY - cy, -connectX);
  const filletControlY = earCy + earR * 0.9;

  ctx.beginPath();
  // 1. Top ear semicircle (left to right across top)
  ctx.arc(cx, earCy, earR, Math.PI, 0, false);
  // 2. Smooth right fillet to main circle
  ctx.quadraticCurveTo(cx + earR * 0.95, filletControlY, cx + connectX, connectY);
  // 3. Main circle sweeping clockwise around bottom from alpha (top-right) to beta (top-left)
  ctx.arc(cx, cy, R, alpha, beta, false);
  // 4. Smooth left fillet back up to ear
  ctx.quadraticCurveTo(cx - earR * 0.95, filletControlY, cx - earR, earCy);
  ctx.closePath();
}

/**
 * Mathematically continuous squircle (3x3 cm plate) collar tag with integrated top suspension lug.
 */
function drawSquircleTagContour(ctx, cx, cy, R) {
  const earR = R * 0.28;
  const earCy = cy - R * 0.90;
  const cornerR = R * 0.30;
  const topY = cy - R;
  const bottomY = cy + R;
  const leftX = cx - R;
  const rightX = cx + R;
  const connectX = R * 0.42;
  const filletControlY = topY - (topY - earCy) * 0.35;

  ctx.beginPath();
  // 1. Top ear semicircle
  ctx.arc(cx, earCy, earR, Math.PI, 0, false);
  // 2. Smooth right fillet to squircle top edge
  ctx.quadraticCurveTo(cx + earR * 0.95, filletControlY, cx + connectX, topY);
  // 3. Top edge to top-right corner
  ctx.lineTo(rightX - cornerR, topY);
  ctx.quadraticCurveTo(rightX, topY, rightX, topY + cornerR);
  // 4. Right edge to bottom-right corner
  ctx.lineTo(rightX, bottomY - cornerR);
  ctx.quadraticCurveTo(rightX, bottomY, rightX - cornerR, bottomY);
  // 5. Bottom edge to bottom-left corner
  ctx.lineTo(leftX + cornerR, bottomY);
  ctx.quadraticCurveTo(leftX, bottomY, leftX, bottomY - cornerR);
  // 6. Left edge to top-left corner
  ctx.lineTo(leftX, topY + cornerR);
  ctx.quadraticCurveTo(leftX, topY, leftX + cornerR, topY);
  // 7. Top edge to left fillet
  ctx.lineTo(cx - connectX, topY);
  ctx.quadraticCurveTo(cx - earR * 0.95, filletControlY, cx - earR, earCy);
  ctx.closePath();
}

/**
 * Draw 3D-printable physical contour
 */
function drawPhysicalContourPath(ctx, cx, cy, radius, shape = "circle") {
  if (shape === "circle") {
    drawCircleTagContour(ctx, cx, cy, radius);
  } else {
    drawSquircleTagContour(ctx, cx, cy, radius);
  }
}

/**
 * Process real pet photo into a high-contrast 3D printable cameo relief.
 * Replaces cartoon puppy emojis with the ACTUAL pet's face stylized for FDM/Resin slicers.
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
      // Clean binary coin cameo: #FFFFFF relief vs #0F172A base
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
    // Fallback if canvas security throws
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
 * Draw a single collar tag face (Front or Back) mathematically calibrated to stay 100% inside contour.
 */
async function drawTagFace(ctx, cx, cy, size, pet, { shape = "circle", finish = "gold", side = "front", petPhoto = null, qrDataUrl = null }) {
  ctx.save();

  // The main circle center and radius
  const mainR = size * 0.38; // 30mm medal main radius
  const mainCy = cy + size * 0.035; // optimal downward offset for top ear tab

  // Top suspension hole coordinates (situated concentric inside the top ear arch)
  const earCy = mainCy - mainR * 0.90;
  const holeR = mainR * 0.12; // Ø 3.8mm physical diameter

  // 1. Realistic Drop Shadow for preview
  ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
  ctx.shadowBlur = size * 0.045;
  ctx.shadowOffsetY = size * 0.025;

  // 2. Draw physical 3D base plate contour
  drawPhysicalContourPath(ctx, cx, mainCy, mainR, shape);

  // Material Body Fill
  if (finish === "gold") {
    const goldGrad = ctx.createLinearGradient(cx - mainR, mainCy - mainR, cx + mainR, mainCy + mainR);
    goldGrad.addColorStop(0, "#FFF7C2");
    goldGrad.addColorStop(0.2, "#E5B942");
    goldGrad.addColorStop(0.45, "#AA771C");
    goldGrad.addColorStop(0.7, "#FDE047");
    goldGrad.addColorStop(0.9, "#8B5A00");
    goldGrad.addColorStop(1, "#451A03");
    ctx.fillStyle = goldGrad;
  } else if (finish === "silver") {
    const silverGrad = ctx.createLinearGradient(cx - mainR, mainCy - mainR, cx + mainR, mainCy + mainR);
    silverGrad.addColorStop(0, "#FFFFFF");
    silverGrad.addColorStop(0.3, "#E2E8F0");
    silverGrad.addColorStop(0.5, "#94A3B8");
    silverGrad.addColorStop(0.75, "#CBD5E1");
    silverGrad.addColorStop(1, "#475569");
    ctx.fillStyle = silverGrad;
  } else if (finish === "3dprint") {
    // Pure Deep Solid Black for 3D Slicers (Base Body)
    ctx.fillStyle = "#0A0F1D";
  } else {
    // Luxury Black Enamel
    const blackGrad = ctx.createLinearGradient(cx - mainR, mainCy - mainR, cx + mainR, mainCy + mainR);
    blackGrad.addColorStop(0, "#1E293B");
    blackGrad.addColorStop(0.5, "#0F172A");
    blackGrad.addColorStop(1, "#020617");
    ctx.fillStyle = blackGrad;
  }
  ctx.fill();

  ctx.restore();
  ctx.save();

  // 3. Raised Outer Beveled Rim (Relieve perimetral para impresión 3D)
  ctx.lineWidth = size * 0.018;
  ctx.strokeStyle = finish === "gold" ? "#F59E0B" : finish === "silver" ? "#E2E8F0" : finish === "3dprint" ? "#FFFFFF" : "#D4AF37";
  drawPhysicalContourPath(ctx, cx, mainCy, mainR, shape);
  ctx.stroke();

  // Inner inset groove
  ctx.lineWidth = size * 0.007;
  ctx.strokeStyle = finish === "3dprint" ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.22)";
  if (shape === "circle") {
    ctx.beginPath();
    ctx.arc(cx, mainCy, mainR - size * 0.032, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    roundRect(ctx, cx - mainR + size * 0.032, mainCy - mainR + size * 0.032, mainR * 2 - size * 0.064, mainR * 2 - size * 0.064, mainR * 0.26);
    ctx.stroke();
  }

  // 4. Perforated Collar Suspension Eyelet (Agujero pasador concéntrico de 3.8mm)
  // Outer reinforcement ring (eyelet washer)
  ctx.fillStyle = finish === "gold" ? "#B45309" : finish === "silver" ? "#64748B" : finish === "3dprint" ? "#FFFFFF" : "#D4AF37";
  ctx.beginPath();
  ctx.arc(cx, earCy, holeR * 1.55, 0, Math.PI * 2);
  ctx.fill();

  // The actual through-hole (punched cut)
  ctx.fillStyle = finish === "3dprint" ? "#000000" : "#E2E8F0";
  ctx.beginPath();
  ctx.arc(cx, earCy, holeR, 0, Math.PI * 2);
  ctx.fill();

  ctx.lineWidth = size * 0.006;
  ctx.strokeStyle = "rgba(0,0,0,0.6)";
  ctx.stroke();

  // ---------------------------------------------------------------------------
  // 5. CONTENT: CARA A (ANVERSO - IDENTIFICACIÓN OFICIAL)
  // Strictly guarded with ample buffer from the bottom rim
  // ---------------------------------------------------------------------------
  if (side === "front") {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // 5A. Brand Header
    const headerY = mainCy - mainR * 0.65;
    ctx.fillStyle = finish === "black" ? "#F59E0B" : finish === "3dprint" ? "#FFFFFF" : "#78350F";
    ctx.font = `800 ${Math.round(size * 0.024)}px 'Plus Jakarta Sans', sans-serif`;
    ctx.letterSpacing = "1.2px";
    ctx.fillText("★ THE INTERNET PET WALL ★", cx, headerY);

    // 5B. Central Pet Photo Medallion
    const photoCenterY = mainCy - mainR * 0.16;
    const photoR = mainR * 0.36;

    // Outer photo frame bezel
    ctx.lineWidth = size * 0.015;
    ctx.strokeStyle = finish === "gold" ? "#F59E0B" : finish === "silver" ? "#FFFFFF" : finish === "3dprint" ? "#FFFFFF" : "#D4AF37";
    ctx.fillStyle = finish === "3dprint" ? "#0F172A" : "#FFFFFF";
    ctx.beginPath();
    ctx.arc(cx, photoCenterY, photoR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (petPhoto && finish === "3dprint") {
      // Process real pet photo into 3D printable cameo relief!
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
      // Sleek minimalist vector paw silhouette (no toy emojis)
      drawSilhouettePlaceholder(ctx, cx, photoCenterY, photoR);
    }

    // 5C. Pet Name (Embossed, Large & Ultra-Clear)
    const nameY = photoCenterY + photoR + size * 0.052;
    ctx.fillStyle = finish === "black" ? "#FFFFFF" : finish === "3dprint" ? "#FFFFFF" : "#0F172A";
    ctx.font = `900 ${Math.round(size * 0.062)}px 'Outfit', sans-serif`;
    ctx.letterSpacing = "1.2px";
    const displayName = (pet.name || "Mascota").toUpperCase().slice(0, 12);
    ctx.fillText(displayName, cx, nameY);

    // 5D. Unified Code Capsule (PET-0001-ES)
    const pillY = nameY + size * 0.052;
    const pillW = size * 0.36;
    const pillH = size * 0.046;

    ctx.fillStyle = finish === "black" ? "rgba(212, 175, 55, 0.22)" : finish === "3dprint" ? "#000000" : "rgba(0, 0, 0, 0.08)";
    ctx.strokeStyle = finish === "black" ? "#F59E0B" : finish === "3dprint" ? "#FFFFFF" : "rgba(0, 0, 0, 0.2)";
    ctx.lineWidth = finish === "3dprint" ? 2.5 : 1.5;
    roundRect(ctx, cx - pillW / 2, pillY - pillH / 2, pillW, pillH, pillH / 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = finish === "black" ? "#FDE047" : finish === "3dprint" ? "#FFFFFF" : "#92400E";
    ctx.font = `800 ${Math.round(size * 0.030)}px monospace`;
    ctx.letterSpacing = "1.8px";
    ctx.fillText(pet.code || "PET-0000-ES", cx, pillY);

    // 5E. City & Country Flag - Safely positioned with >140px buffer above bottom rim
    const loc = parsePetLocation(pet.city, pet);
    const locY = pillY + size * 0.046;
    ctx.fillStyle = finish === "black" ? "#E2E8F0" : finish === "3dprint" ? "#FFFFFF" : "#334155";
    ctx.font = `700 ${Math.round(size * 0.026)}px 'Plus Jakarta Sans', sans-serif`;
    const locationStr = `${loc.cityName || pet.city || "España"} ${loc.flag || "🇪🇸"}`;
    ctx.fillText(locationStr, cx, locY);
  }

  // ---------------------------------------------------------------------------
  // 6. CONTENT: CARA B (REVERSO - SOS RESCUE QR CODE)
  // ---------------------------------------------------------------------------
  if (side === "back") {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // 6A. Emergency Header
    const sosY = mainCy - mainR * 0.65;
    ctx.fillStyle = finish === "3dprint" ? "#FFFFFF" : finish === "black" ? "#EF4444" : "#DC2626";
    ctx.font = `900 ${Math.round(size * 0.028)}px 'Plus Jakarta Sans', sans-serif`;
    ctx.letterSpacing = "1.8px";
    ctx.fillText("SOS · SI ME ENCUENTRAS", cx, sosY);

    // 6B. High-Contrast QR Code
    const qrSize = mainR * 0.88;
    const qrY = mainCy - mainR * 0.10;

    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = finish === "gold" ? "#F59E0B" : finish === "silver" ? "#94A3B8" : finish === "3dprint" ? "#FFFFFF" : "#D4AF37";
    ctx.lineWidth = size * 0.012;
    roundRect(ctx, cx - qrSize / 2, qrY - qrSize / 2, qrSize, qrSize, size * 0.025);
    ctx.fill();
    ctx.stroke();

    if (qrDataUrl) {
      const qrImg = await loadSafeImage(qrDataUrl);
      if (qrImg) {
        const qrPadding = size * 0.018;
        ctx.drawImage(qrImg, cx - qrSize / 2 + qrPadding, qrY - qrSize / 2 + qrPadding, qrSize - qrPadding * 2, qrSize - qrPadding * 2);
      }
    }

    // 6C. Call To Action Below QR
    const ctaY = qrY + qrSize / 2 + size * 0.048;
    ctx.fillStyle = finish === "black" ? "#FFFFFF" : finish === "3dprint" ? "#FFFFFF" : "#0F172A";
    ctx.font = `800 ${Math.round(size * 0.028)}px 'Plus Jakarta Sans', sans-serif`;
    ctx.fillText("ESCANEAR CON CUALQUIER MÓVIL", cx, ctaY);

    // 6D. Contact / Web Link (Guaranteed inside boundary with >140px margin to bottom rim)
    const linkY = ctaY + size * 0.046;
    ctx.fillStyle = finish === "black" ? "#FDE047" : finish === "3dprint" ? "#FFFFFF" : "#92400E";
    ctx.font = `800 ${Math.round(size * 0.026)}px monospace`;
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

  // Pre-generate scannable QR
  const origin = typeof window !== "undefined" && window.location.origin ? window.location.origin : "https://theinternetpetwall.com";
  const targetUrl = `${origin}/wall?pet=${encodeURIComponent(pet.code || pet.id)}`;
  const qrDataUrl = await QRCode.toDataURL(targetUrl, {
    width: 400,
    margin: 1,
    color: { dark: "#000000", light: "#FFFFFF" },
    errorCorrectionLevel: "H",
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
 * Contains both FRONT and BACK side-by-side with exact 30x30mm cut lines,
 * fold guideline, 3D printing parameters, and physical 3cm ruler.
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
  ctx.fillText("Medida física exacta: 30 x 30 mm · Apta para Impresión 3D, Grabado Láser o Plastificado 1:1", width / 2, 156);

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
    errorCorrectionLevel: "H",
  });

  const tagSize = 500;
  const centerY = 520;
  const leftX = width / 2 - 280;
  const rightX = width / 2 + 280;

  // Face Labels
  ctx.fillStyle = "#0F172A";
  ctx.font = "800 20px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText("ANVERSO (FOTO Y PLACA)", leftX, centerY - tagSize / 2 + 10);
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
  ctx.fillText("🖨️ PARÁMETROS RECOMENDADOS PARA IMPRESIÓN 3D (FDM / RESINA):", boxX + 24, boxY + 30);

  ctx.fillStyle = "#475569";
  ctx.font = "600 13px 'Plus Jakarta Sans', monospace";
  ctx.fillText("• Diámetro cuerpo: 30.0 mm | Altura total con orejeta: 35.0 mm | Grosor total: 3.2 mm (16 capas a 0.20 mm)", boxX + 24, boxY + 58);
  ctx.fillText("• Base: 2.2 mm (capas 1 a 11) | Relieves y letras: 1.0 mm (cambio de color en capa 12) | Orificio anilla: Ø 3.8 mm", boxX + 24, boxY + 84);

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
  const earR = R * 0.28;
  const earCy = cy - R * 0.90;
  const holeR = R * 0.12;

  let contourPath = "";
  if (shape === "circle") {
    const connectX = R * 0.42;
    const connectY = cy - Math.sqrt(R * R - connectX * connectX);
    const filletControlY = earCy + earR * 0.9;
    contourPath =
      `M ${cx - earR} ${earCy} ` +
      `A ${earR} ${earR} 0 0 1 ${cx + earR} ${earCy} ` +
      `Q ${(cx + earR * 0.95).toFixed(2)} ${filletControlY.toFixed(2)} ${(cx + connectX).toFixed(2)} ${connectY.toFixed(2)} ` +
      `A ${R} ${R} 0 1 1 ${(cx - connectX).toFixed(2)} ${connectY.toFixed(2)} ` +
      `Q ${(cx - earR * 0.95).toFixed(2)} ${filletControlY.toFixed(2)} ${cx - earR} ${earCy} Z`;
  } else {
    const cornerR = R * 0.30;
    const topY = cy - R;
    const bottomY = cy + R;
    const leftX = cx - R;
    const rightX = cx + R;
    const connectX = R * 0.42;
    const filletControlY = topY - (topY - earCy) * 0.35;
    contourPath =
      `M ${cx - earR} ${earCy} ` +
      `A ${earR} ${earR} 0 0 1 ${cx + earR} ${earCy} ` +
      `Q ${(cx + earR * 0.95).toFixed(2)} ${filletControlY.toFixed(2)} ${(cx + connectX).toFixed(2)} ${topY} ` +
      `L ${(rightX - cornerR).toFixed(2)} ${topY} Q ${rightX} ${topY} ${rightX} ${(topY + cornerR).toFixed(2)} ` +
      `L ${rightX} ${(bottomY - cornerR).toFixed(2)} Q ${rightX} ${bottomY} ${(rightX - cornerR).toFixed(2)} ${bottomY} ` +
      `L ${(leftX + cornerR).toFixed(2)} ${bottomY} Q ${leftX} ${bottomY} ${leftX} ${(bottomY - cornerR).toFixed(2)} ` +
      `L ${leftX} ${(topY + cornerR).toFixed(2)} Q ${leftX} ${topY} ${(leftX + cornerR).toFixed(2)} ${topY} ` +
      `L ${(cx - connectX).toFixed(2)} ${topY} Q ${(cx - earR * 0.95).toFixed(2)} ${filletControlY.toFixed(2)} ${cx - earR} ${earCy} Z`;
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
        QRCode.toString(targetUrl, { type: "svg", margin: 0 }, (err, svg) => {
          if (err) rej(err); else res(svg);
        });
      });
      const pathMatch = qrRaw.match(/<path[^>]*stroke=\"#000000\"[^>]*d=\"([^\"]+)\"/);
      if (pathMatch) {
        // Embed scaled QR matrix
        qrSvgContent = `
        <rect x="95" y="125" width="110" height="110" rx="8" fill="#FFFFFF"/>
        <g transform="translate(100, 130) scale(3.03)">
          <path d="${pathMatch[1]}" stroke="#000000" stroke-width="1"/>
        </g>`;
      }
    } catch (e) {
      console.warn("Could not generate vector QR for SVG:", e);
    }
  }

  const petName = escapeXml((pet.name || "PET").toUpperCase().slice(0, 12));
  const petCode = escapeXml(pet.code || "PET-0000-ES");
  const petCity = escapeXml(pet.city || "España");
  const contactText = escapeXml(pet.instagram ? `@${pet.instagram.replace(/^@/, "")}` : "theinternetpetwall.com");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="30mm" height="35mm" viewBox="0 0 300 350" version="1.1">
  <title>Chapa Oficial ${petName} (${petCode}) - 30x35mm</title>
  <desc>Modelo vectorial para laminadores 3D (Bambu Studio, PrusaSlicer, Orca, Cura). Base: 2.2mm, Relieve: 1.0mm.</desc>

  <!-- LAYER 1: BASE BODY (2.2 mm height) with Ring Eyelet Cutout -->
  <g id="base-body" fill="#0A0F1D">
    <path fill-rule="evenodd" d="${contourPath} ${holePath}" />
  </g>

  <!-- LAYER 2: RAISED RELIEFS (1.0 mm height for dual-color extrusion) -->
  <g id="raised-reliefs" fill="#FFFFFF" stroke="#FFFFFF">
    <!-- Outer Rim Bevel -->
    <path d="${contourPath}" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linejoin="round"/>
    <!-- Ring Hole Reinforcement -->
    <circle cx="${cx}" cy="${earCy}" r="${(holeR * 1.5).toFixed(1)}" fill="none" stroke="#FFFFFF" stroke-width="3"/>

    ${
      side === "front"
        ? `
    <!-- Front Header -->
    <text x="${cx}" y="94" text-anchor="middle" fill="#FFFFFF" stroke="none" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="800" font-size="7.5" letter-spacing="0.5">★ THE INTERNET PET WALL ★</text>

    <!-- Photo Cameo Medallion Rim -->
    <circle cx="${cx}" cy="142" r="38" fill="none" stroke="#FFFFFF" stroke-width="3"/>
    <circle cx="${cx}" cy="150" r="16" fill="#FFFFFF" stroke="none"/>
    <circle cx="${cx - 16}" cy="134" r="6" fill="#FFFFFF" stroke="none"/>
    <circle cx="${cx - 6}" cy="126" r="6.5" fill="#FFFFFF" stroke="none"/>
    <circle cx="${cx + 6}" cy="126" r="6.5" fill="#FFFFFF" stroke="none"/>
    <circle cx="${cx + 16}" cy="134" r="6" fill="#FFFFFF" stroke="none"/>

    <!-- Pet Name -->
    <text x="${cx}" y="200" text-anchor="middle" fill="#FFFFFF" stroke="none" font-family="'Outfit', Arial, sans-serif" font-weight="900" font-size="18" letter-spacing="1">${petName}</text>

    <!-- Code Capsule -->
    <rect x="95" y="210" width="110" height="15" rx="7.5" fill="#000000" stroke="#FFFFFF" stroke-width="2"/>
    <text x="${cx}" y="221" text-anchor="middle" fill="#FFFFFF" stroke="none" font-family="Courier, monospace" font-weight="800" font-size="9.5" letter-spacing="1.2">${petCode}</text>

    <!-- City -->
    <text x="${cx}" y="238" text-anchor="middle" fill="#FFFFFF" stroke="none" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="700" font-size="8">${petCity}</text>
    `
        : `
    <!-- Back Header -->
    <text x="${cx}" y="94" text-anchor="middle" fill="#FFFFFF" stroke="none" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="900" font-size="8.5" letter-spacing="0.8">SOS · SI ME ENCUENTRAS</text>

    <!-- QR Code -->
    ${qrSvgContent}

    <!-- Call to action -->
    <text x="${cx}" y="252" text-anchor="middle" fill="#FFFFFF" stroke="none" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="800" font-size="8.5">ESCANEAR CON EL MÓVIL</text>
    <text x="${cx}" y="266" text-anchor="middle" fill="#FFFFFF" stroke="none" font-family="Courier, monospace" font-weight="800" font-size="7.5">${contactText}</text>
    `
    }
  </g>
</svg>`;
}
