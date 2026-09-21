import QRCode from "qrcode";
import { parsePetLocation } from "../data/worldLocations";

/**
 * Ultra-realistic Physical Collar Tag Generator (Chapa de Collar 3x3 cm / 30 mm)
 * Generates high-definition (300+ DPI equivalent) printable collar medals
 * with metallic finishes (Gold, Silver, Black Enamel) and real scannable QR.
 */

// Helper to load image safely without throwing CORS exceptions
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
        // Ignore fallback error
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
 * Draw a single collar medal (Front or Back) at a given (cx, cy) center coordinate with diameter/size
 */
async function drawTagFace(ctx, cx, cy, size, pet, { shape = "circle", finish = "gold", side = "front", petPhoto = null, qrDataUrl = null }) {
  ctx.save();

  const radius = size / 2;
  const topHoleY = cy - radius + size * 0.12;
  const holeRadius = size * 0.055;

  // 1. Tag Metallic Shadow (Realistic depth)
  ctx.shadowColor = "rgba(0, 0, 0, 0.28)";
  ctx.shadowBlur = size * 0.06;
  ctx.shadowOffsetY = size * 0.03;

  // 2. Base Metallic Body
  ctx.beginPath();
  if (shape === "circle") {
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  } else {
    roundRect(ctx, cx - radius, cy - radius, size, size, size * 0.22);
  }

  // Metallic body gradients
  let bodyGrad;
  if (finish === "gold") {
    bodyGrad = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
    bodyGrad.addColorStop(0, "#FFF3B0");
    bodyGrad.addColorStop(0.2, "#E5B942");
    bodyGrad.addColorStop(0.4, "#B8860B");
    bodyGrad.addColorStop(0.7, "#FDE047");
    bodyGrad.addColorStop(0.9, "#996515");
    bodyGrad.addColorStop(1, "#5B3A04");
  } else if (finish === "silver") {
    bodyGrad = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
    bodyGrad.addColorStop(0, "#FFFFFF");
    bodyGrad.addColorStop(0.25, "#E2E8F0");
    bodyGrad.addColorStop(0.5, "#94A3B8");
    bodyGrad.addColorStop(0.75, "#CBD5E1");
    bodyGrad.addColorStop(1, "#64748B");
  } else {
    // Luxury Black Enamel
    bodyGrad = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
    bodyGrad.addColorStop(0, "#1E293B");
    bodyGrad.addColorStop(0.5, "#0F172A");
    bodyGrad.addColorStop(1, "#020617");
  }

  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Reset shadow for inner details
  ctx.restore();
  ctx.save();

  // 3. Beveled Metallic Rim & Milling
  ctx.lineWidth = size * 0.024;
  ctx.strokeStyle = finish === "gold" ? "#F59E0B" : finish === "silver" ? "#E2E8F0" : "#D4AF37";
  if (shape === "circle") {
    ctx.beginPath();
    ctx.arc(cx, cy, radius - size * 0.02, 0, Math.PI * 2);
    ctx.stroke();

    // Secondary decorative engraved ring
    ctx.lineWidth = size * 0.008;
    ctx.strokeStyle = finish === "black" ? "rgba(212, 175, 55, 0.4)" : "rgba(0, 0, 0, 0.2)";
    ctx.beginPath();
    ctx.arc(cx, cy, radius - size * 0.045, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    roundRect(ctx, cx - radius + size * 0.02, cy - radius + size * 0.02, size - size * 0.04, size - size * 0.04, size * 0.2);
    ctx.stroke();

    ctx.lineWidth = size * 0.008;
    ctx.strokeStyle = finish === "black" ? "rgba(212, 175, 55, 0.4)" : "rgba(0, 0, 0, 0.2)";
    roundRect(ctx, cx - radius + size * 0.045, cy - radius + size * 0.045, size - size * 0.09, size - size * 0.09, size * 0.17);
    ctx.stroke();
  }

  // 4. Perforated Collar Suspension Ring Hole (Anilla de sujeción)
  // Outer metal eyelet grommet
  ctx.fillStyle = finish === "gold" ? "#AA771C" : finish === "silver" ? "#64748B" : "#B45309";
  ctx.beginPath();
  ctx.arc(cx, topHoleY, holeRadius * 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Hole cut-through (shows inner hollow)
  ctx.fillStyle = "#E2E8F0";
  ctx.beginPath();
  ctx.arc(cx, topHoleY, holeRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = size * 0.006;
  ctx.strokeStyle = "rgba(0,0,0,0.5)";
  ctx.stroke();

  // Highlight reflection on hole rim
  ctx.strokeStyle = "rgba(255,255,255,0.7)";
  ctx.lineWidth = size * 0.005;
  ctx.beginPath();
  ctx.arc(cx, topHoleY, holeRadius * 1.4, Math.PI * 0.8, Math.PI * 1.4);
  ctx.stroke();

  // 5. CONTENT: CARA A (FRONT)
  if (side === "front") {
    // Brand arc / top header
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = finish === "black" ? "#F59E0B" : "#451A03";
    ctx.font = `800 ${Math.round(size * 0.038)}px 'Plus Jakarta Sans', sans-serif`;
    ctx.letterSpacing = "1.5px";
    ctx.fillText("THE INTERNET PET WALL", cx, topHoleY + size * 0.1);

    // Pet Photo or Pet Silhouette in Center Medallion
    const medallionY = cy + size * 0.02;
    const medallionR = size * 0.22;

    // Medallion outer ring
    ctx.lineWidth = size * 0.016;
    ctx.strokeStyle = finish === "gold" ? "#F59E0B" : finish === "silver" ? "#FFFFFF" : "#D4AF37";
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(cx, medallionY, medallionR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (petPhoto) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, medallionY, medallionR - size * 0.008, 0, Math.PI * 2);
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
      ctx.drawImage(petPhoto, sx, sy, sw, sh, cx - medallionR, medallionY - medallionR, medallionR * 2, medallionR * 2);
      ctx.restore();
    } else {
      // Silhouette placeholder
      ctx.fillStyle = "#64748B";
      ctx.font = `${Math.round(size * 0.18)}px sans-serif`;
      ctx.fillText(pet.type === "cat" ? "🐱" : "🐶", cx, medallionY + size * 0.02);
    }

    // Name (Bold Engraved Typography)
    const nameY = medallionY + medallionR + size * 0.1;
    ctx.fillStyle = finish === "black" ? "#FFFFFF" : "#1E293B";
    ctx.font = `900 ${Math.round(size * 0.088)}px 'Outfit', sans-serif`;
    ctx.letterSpacing = "1px";
    const displayName = (pet.name || "Mascota").toUpperCase().slice(0, 14);
    ctx.fillText(displayName, cx, nameY);

    // Official Plaque Code & Location Pill
    const codeY = nameY + size * 0.08;
    const pillW = size * 0.52;
    const pillH = size * 0.07;
    ctx.fillStyle = finish === "black" ? "rgba(212, 175, 55, 0.18)" : "rgba(0, 0, 0, 0.08)";
    ctx.strokeStyle = finish === "black" ? "#F59E0B" : "rgba(0, 0, 0, 0.15)";
    ctx.lineWidth = 1;
    roundRect(ctx, cx - pillW / 2, codeY - pillH / 2, pillW, pillH, pillH / 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = finish === "black" ? "#FDE047" : "#B45309";
    ctx.font = `800 ${Math.round(size * 0.042)}px monospace`;
    ctx.letterSpacing = "1.5px";
    ctx.fillText(pet.code || "PET-0000-ES", cx, codeY);

    // Bottom City & Flag
    const loc = parsePetLocation(pet.city, pet);
    const bottomY = codeY + size * 0.07;
    ctx.fillStyle = finish === "black" ? "#CBD5E1" : "#475569";
    ctx.font = `700 ${Math.round(size * 0.038)}px 'Plus Jakarta Sans', sans-serif`;
    const locationStr = `${loc.cityName || pet.city || "España"} ${loc.flag || "🇪🇸"}`;
    ctx.fillText(locationStr, cx, bottomY);
  }

  // 6. CONTENT: CARA B (BACK - RESCUE QR CODE)
  if (side === "back") {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Emergency rescue header
    ctx.fillStyle = finish === "black" ? "#EF4444" : "#DC2626";
    ctx.font = `900 ${Math.round(size * 0.046)}px 'Plus Jakarta Sans', sans-serif`;
    ctx.letterSpacing = "1.5px";
    ctx.fillText("SOS · SI ME ENCUENTRAS", cx, topHoleY + size * 0.1);

    // QR Code Container Frame
    const qrSize = size * 0.44;
    const qrY = cy + size * 0.02;

    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = finish === "gold" ? "#F59E0B" : finish === "silver" ? "#94A3B8" : "#D4AF37";
    ctx.lineWidth = size * 0.012;
    roundRect(ctx, cx - qrSize / 2, qrY - qrSize / 2, qrSize, qrSize, size * 0.04);
    ctx.fill();
    ctx.stroke();

    // Draw QR code image
    if (qrDataUrl) {
      const qrImg = await loadSafeImage(qrDataUrl);
      if (qrImg) {
        ctx.drawImage(qrImg, cx - qrSize / 2 + size * 0.02, qrY - qrSize / 2 + size * 0.02, qrSize - size * 0.04, qrSize - size * 0.04);
      }
    }

    // Call to action below QR
    const scanY = qrY + qrSize / 2 + size * 0.06;
    ctx.fillStyle = finish === "black" ? "#FFFFFF" : "#1E293B";
    ctx.font = `800 ${Math.round(size * 0.044)}px 'Plus Jakarta Sans', sans-serif`;
    ctx.fillText("ESCANEA CON CUALQUIER MÓVIL", cx, scanY);

    // Owner info or web URL
    const contactY = scanY + size * 0.06;
    ctx.fillStyle = finish === "black" ? "#F59E0B" : "#B45309";
    ctx.font = `700 ${Math.round(size * 0.038)}px 'Plus Jakarta Sans', monospace`;
    const contactText = pet.instagram ? `IG: ${pet.instagram}` : "theinternetpetwall.com";
    ctx.fillText(contactText, cx, contactY);

    // Bottom scale note
    const bottomNoteY = contactY + size * 0.055;
    ctx.fillStyle = finish === "black" ? "#94A3B8" : "#64748B";
    ctx.font = `600 ${Math.round(size * 0.028)}px 'Plus Jakarta Sans', sans-serif`;
    ctx.fillText("CHAPA OFICIAL · 3 x 3 CM (30 MM)", cx, bottomNoteY);
  }

  // 7. Realistic metallic sheen reflection (Light glare pass)
  const sheenGrad = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
  sheenGrad.addColorStop(0, "rgba(255, 255, 255, 0.45)");
  sheenGrad.addColorStop(0.3, "rgba(255, 255, 255, 0.1)");
  sheenGrad.addColorStop(0.5, "transparent");
  sheenGrad.addColorStop(0.8, "rgba(255, 255, 255, 0.15)");
  sheenGrad.addColorStop(1, "transparent");

  ctx.globalCompositeOperation = "screen";
  ctx.fillStyle = sheenGrad;
  if (shape === "circle") {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
  } else {
    roundRect(ctx, cx - radius, cy - radius, size, size, size * 0.22);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Generate a single high-resolution collar tag view (Front or Back)
 */
export async function generateCollarTagDataUrl(pet, { shape = "circle", finish = "gold", side = "front" } = {}) {
  const canvas = document.createElement("canvas");
  const size = 900; // Ultra high-res (approx 750 DPI at 30mm)
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  // Transparent or subtle backdrop
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

  const tagSize = size * 0.88;
  await drawTagFace(ctx, size / 2, size / 2, tagSize, pet, {
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
 * fold guideline, and physical 3cm ruler.
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
  ctx.strokeStyle = "#E2E8F0";
  ctx.lineWidth = 4;
  ctx.strokeRect(40, 40, width - 80, height - 80);

  // Header Title
  ctx.textAlign = "center";
  ctx.fillStyle = "#0F172A";
  ctx.font = "800 36px 'Outfit', sans-serif";
  ctx.fillText("PLANTILLA OFICIAL DE CHAPA PARA COLLAR (3 x 3 CM)", width / 2, 100);

  ctx.fillStyle = "#D97706";
  ctx.font = "700 20px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText(`THE INTERNET PET WALL · ${pet.name.toUpperCase()} (${pet.code})`, width / 2, 138);

  ctx.fillStyle = "#64748B";
  ctx.font = "500 16px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText("Imprimir al 100% de escala (sin ajustar a página) · Recortar por la línea exterior · Plastificar o usar como guía de grabado", width / 2, 172);

  // Divider
  ctx.strokeStyle = "#CBD5E1";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(100, 205);
  ctx.lineTo(width - 100, 205);
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

  const tagSize = 460;
  const centerY = 560;
  const leftX = width / 2 - 280;
  const rightX = width / 2 + 280;

  // Labels above tags
  ctx.fillStyle = "#334155";
  ctx.font = "800 22px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText("ANVERSO (CARA FRONTAL)", leftX, centerY - tagSize / 2 - 24);
  ctx.fillText("REVERSO (CÓDIGO QR Y SOS)", rightX, centerY - tagSize / 2 - 24);

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
  ctx.moveTo(width / 2, centerY - tagSize / 2 - 40);
  ctx.lineTo(width / 2, centerY + tagSize / 2 + 40);
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = "#64748B";
  ctx.font = "600 15px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText("✂️ LÍNEA DE CORTE / PLEGADO ✂️", width / 2, centerY + tagSize / 2 + 70);

  // 7. REAL PHYSICAL MILLIMETER RULER GUIDE (3.0 cm = 30 mm)
  const rulerY = height - 190;
  const rulerW = 420; // 3cm visual scale calibration
  const rulerX = (width - rulerW) / 2;

  ctx.fillStyle = "#F8FAFC";
  ctx.strokeStyle = "#94A3B8";
  ctx.lineWidth = 2;
  roundRect(ctx, rulerX, rulerY, rulerW, 70, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#0F172A";
  ctx.font = "700 14px monospace";
  ctx.textAlign = "left";
  ctx.fillText("📏 GUÍA DE ESCALA FÍSICA: 3 CM (30 MM)", rulerX + 16, rulerY + 24);

  // Ruler ticks (0cm, 1cm, 2cm, 3cm)
  const tickY = rulerY + 45;
  const step = (rulerW - 40) / 3;
  ctx.strokeStyle = "#0F172A";
  ctx.lineWidth = 2;
  for (let i = 0; i <= 3; i++) {
    const tx = rulerX + 20 + i * step;
    ctx.beginPath();
    ctx.moveTo(tx, tickY);
    ctx.lineTo(tx, tickY + 16);
    ctx.stroke();

    ctx.font = "700 12px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`${i} cm`, tx, tickY + 28);
  }

  // Footer instructions
  ctx.textAlign = "center";
  ctx.fillStyle = "#64748B";
  ctx.font = "500 14px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText("Medida física final recomendada: 30 x 30 mm · Perforación para anilla: Ø 3 mm", width / 2, height - 70);

  return canvas.toDataURL("image/png");
}
