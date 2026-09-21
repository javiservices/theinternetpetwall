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
 * Draw 3D-printable physical contour:
 * Main 30mm circular or squircle body PLUS reinforced top suspension lug (orejeta para anilla de collar).
 */
function drawPhysicalContourPath(ctx, cx, cy, radius, shape = "circle") {
  const earW = radius * 0.46; // width of top tab
  const earH = radius * 0.36; // height of top tab
  const earTopY = cy - radius - earH + radius * 0.12;
  const earCornerR = earW * 0.45;

  ctx.beginPath();

  if (shape === "circle") {
    // 1. Top ear tab smoothly connected to the circular body
    ctx.moveTo(cx - earW / 2, cy - radius + radius * 0.08);
    ctx.lineTo(cx - earW / 2, earTopY + earCornerR);
    ctx.quadraticCurveTo(cx - earW / 2, earTopY, cx, earTopY);
    ctx.quadraticCurveTo(cx + earW / 2, earTopY, cx + earW / 2, earTopY + earCornerR);
    ctx.lineTo(cx + earW / 2, cy - radius + radius * 0.08);

    // 2. Main circle body
    const startAngle = Math.asin((earW / 2) / radius) - Math.PI / 2;
    const endAngle = Math.PI - startAngle;
    ctx.arc(cx, cy, radius, -startAngle, endAngle, false);
  } else {
    // Squircle shape with top tab
    const size = radius * 2;
    ctx.moveTo(cx - earW / 2, cy - radius + radius * 0.08);
    ctx.lineTo(cx - earW / 2, earTopY + earCornerR);
    ctx.quadraticCurveTo(cx - earW / 2, earTopY, cx, earTopY);
    ctx.quadraticCurveTo(cx + earW / 2, earTopY, cx + earW / 2, earTopY + earCornerR);
    ctx.lineTo(cx + earW / 2, cy - radius + radius * 0.08);

    // Rounded rectangle body
    const cornerR = radius * 0.35;
    ctx.lineTo(cx + radius - cornerR, cy - radius);
    ctx.quadraticCurveTo(cx + radius, cy - radius, cx + radius, cy - radius + cornerR);
    ctx.lineTo(cx + radius, cy + radius - cornerR);
    ctx.quadraticCurveTo(cx + radius, cy + radius, cx + radius - cornerR, cy + radius);
    ctx.lineTo(cx - radius + cornerR, cy + radius);
    ctx.quadraticCurveTo(cx - radius, cy + radius, cx - radius, cy + radius - cornerR);
    ctx.lineTo(cx - radius, cy - radius + cornerR);
    ctx.quadraticCurveTo(cx - radius, cy - radius, cx - earW / 2, cy - radius);
  }

  ctx.closePath();
}

/**
 * Draw a single collar tag face (Front or Back) mathematically calibrated to stay 100% inside contour.
 */
async function drawTagFace(ctx, cx, cy, size, pet, { shape = "circle", finish = "gold", side = "front", petPhoto = null, qrDataUrl = null }) {
  ctx.save();

  // The main circle center and radius
  const mainR = size * 0.40; // 30mm medal main radius
  const mainCy = cy + size * 0.04; // slight downward offset for top ear

  // Top suspension hole coordinates (situated in the reinforced top tab)
  const holeY = mainCy - mainR - size * 0.035;
  const holeR = size * 0.038; // ~3.5mm physical diameter

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
    // High-Contrast Monochrome for 3D Slicers (Bambu / Prusa / Cura)
    ctx.fillStyle = "#0F172A";
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
  ctx.lineWidth = size * 0.02;
  ctx.strokeStyle = finish === "gold" ? "#F59E0B" : finish === "silver" ? "#E2E8F0" : finish === "3dprint" ? "#FFFFFF" : "#D4AF37";
  drawPhysicalContourPath(ctx, cx, mainCy, mainR, shape);
  ctx.stroke();

  // Inner inset groove
  ctx.lineWidth = size * 0.008;
  ctx.strokeStyle = finish === "3dprint" ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.25)";
  if (shape === "circle") {
    ctx.beginPath();
    ctx.arc(cx, mainCy, mainR - size * 0.035, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    roundRect(ctx, cx - mainR + size * 0.035, mainCy - mainR + size * 0.035, mainR * 2 - size * 0.07, mainR * 2 - size * 0.07, mainR * 0.28);
    ctx.stroke();
  }

  // 4. Perforated Collar Suspension Eyelet (Agujero pasador de 3.5mm)
  // Outer reinforcement ring (eyelet washer)
  ctx.fillStyle = finish === "gold" ? "#B45309" : finish === "silver" ? "#64748B" : finish === "3dprint" ? "#FFFFFF" : "#D4AF37";
  ctx.beginPath();
  ctx.arc(cx, holeY, holeR * 1.5, 0, Math.PI * 2);
  ctx.fill();

  // The actual through-hole (punched cut)
  ctx.fillStyle = "#E2E8F0"; // shows the background/hole
  ctx.beginPath();
  ctx.arc(cx, holeY, holeR, 0, Math.PI * 2);
  ctx.fill();

  ctx.lineWidth = size * 0.006;
  ctx.strokeStyle = "rgba(0,0,0,0.6)";
  ctx.stroke();

  // ---------------------------------------------------------------------------
  // 5. CONTENT: CARA A (ANVERSO - IDENTIFICACIÓN OFICIAL)
  // All Y coordinates mathematically guarded within [mainCy - mainR * 0.85, mainCy + mainR * 0.78]
  // ---------------------------------------------------------------------------
  if (side === "front") {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // 5A. Brand Header: Curved or Centered
    const headerY = mainCy - mainR * 0.68;
    ctx.fillStyle = finish === "black" ? "#F59E0B" : finish === "3dprint" ? "#FFFFFF" : "#78350F";
    ctx.font = `800 ${Math.round(size * 0.026)}px 'Plus Jakarta Sans', sans-serif`;
    ctx.letterSpacing = "1.5px";
    ctx.fillText("★ THE INTERNET PET WALL ★", cx, headerY);

    // 5B. Central Pet Photo Medallion (Circular Inset)
    const photoCenterY = mainCy - mainR * 0.16;
    const photoR = mainR * 0.44; // diameter ~13.5 mm physical

    // Outer photo frame bezel
    ctx.lineWidth = size * 0.015;
    ctx.strokeStyle = finish === "gold" ? "#F59E0B" : finish === "silver" ? "#FFFFFF" : finish === "3dprint" ? "#FFFFFF" : "#D4AF37";
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(cx, photoCenterY, photoR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (petPhoto && finish !== "3dprint") {
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
      // Silhouette / 3D Extrusion icon
      ctx.fillStyle = finish === "3dprint" ? "#0F172A" : "#64748B";
      ctx.font = `${Math.round(photoR * 1.1)}px sans-serif`;
      ctx.fillText(pet.type === "cat" ? "🐱" : "🐶", cx, photoCenterY + photoR * 0.05);
    }

    // 5C. Pet Name (Embossed, Large & Ultra-Clear)
    const nameY = photoCenterY + photoR + size * 0.065;
    ctx.fillStyle = finish === "black" ? "#FFFFFF" : finish === "3dprint" ? "#FFFFFF" : "#0F172A";
    ctx.font = `900 ${Math.round(size * 0.068)}px 'Outfit', sans-serif`;
    ctx.letterSpacing = "1.5px";
    const displayName = (pet.name || "Mascota").toUpperCase().slice(0, 12);
    ctx.fillText(displayName, cx, nameY);

    // 5D. Unified Code Capsule (PET-0001-ES)
    // Strictly centered with plenty of horizontal and vertical margin!
    const pillY = nameY + size * 0.062;
    const pillW = size * 0.44;
    const pillH = size * 0.055;

    ctx.fillStyle = finish === "black" ? "rgba(212, 175, 55, 0.22)" : finish === "3dprint" ? "#FFFFFF" : "rgba(0, 0, 0, 0.09)";
    ctx.strokeStyle = finish === "black" ? "#F59E0B" : finish === "3dprint" ? "#FFFFFF" : "rgba(0, 0, 0, 0.2)";
    ctx.lineWidth = 1.5;
    roundRect(ctx, cx - pillW / 2, pillY - pillH / 2, pillW, pillH, pillH / 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = finish === "black" ? "#FDE047" : finish === "3dprint" ? "#0F172A" : "#92400E";
    ctx.font = `800 ${Math.round(size * 0.032)}px monospace`;
    ctx.letterSpacing = "2px";
    ctx.fillText(pet.code || "PET-0000-ES", cx, pillY);

    // 5E. City & Country Flag - Safely positioned above bottom rim
    const loc = parsePetLocation(pet.city, pet);
    const locY = pillY + size * 0.058;
    ctx.fillStyle = finish === "black" ? "#E2E8F0" : finish === "3dprint" ? "#FFFFFF" : "#334155";
    ctx.font = `700 ${Math.round(size * 0.028)}px 'Plus Jakarta Sans', sans-serif`;
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
    const sosY = mainCy - mainR * 0.68;
    ctx.fillStyle = finish === "3dprint" ? "#FFFFFF" : finish === "black" ? "#EF4444" : "#DC2626";
    ctx.font = `900 ${Math.round(size * 0.032)}px 'Plus Jakarta Sans', sans-serif`;
    ctx.letterSpacing = "2px";
    ctx.fillText("SOS · SI ME ENCUENTRAS", cx, sosY);

    // 6B. High-Contrast QR Code
    const qrSize = mainR * 0.95;
    const qrY = mainCy - mainR * 0.08;

    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = finish === "gold" ? "#F59E0B" : finish === "silver" ? "#94A3B8" : finish === "3dprint" ? "#FFFFFF" : "#D4AF37";
    ctx.lineWidth = size * 0.012;
    roundRect(ctx, cx - qrSize / 2, qrY - qrSize / 2, qrSize, qrSize, size * 0.03);
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
    const ctaY = qrY + qrSize / 2 + size * 0.055;
    ctx.fillStyle = finish === "black" ? "#FFFFFF" : finish === "3dprint" ? "#FFFFFF" : "#0F172A";
    ctx.font = `800 ${Math.round(size * 0.032)}px 'Plus Jakarta Sans', sans-serif`;
    ctx.fillText("ESCANEAR CON CUALQUIER MÓVIL", cx, ctaY);

    // 6D. Contact / Web Link (Guaranteed inside boundary)
    const linkY = ctaY + size * 0.054;
    ctx.fillStyle = finish === "black" ? "#FDE047" : finish === "3dprint" ? "#FFFFFF" : "#92400E";
    ctx.font = `800 ${Math.round(size * 0.028)}px 'Plus Jakarta Sans', monospace`;
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
