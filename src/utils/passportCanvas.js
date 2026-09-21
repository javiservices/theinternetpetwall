/**
 * Generates an ultra-premium Official Pet Passport / Certificate of Immortality
 * rendered onto an HTML5 Canvas and returned as a high-res PNG Data URL.
 */
export async function generatePetPassportDataUrl(pet) {
  const width = 1080;
  const height = 1440;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  // 1. Background gradient - warm luxury parchment
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, "#FCFBF7");
  bgGrad.addColorStop(0.5, "#F8F5EC");
  bgGrad.addColorStop(1, "#F3EDE0");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle geometric background watermark pattern
  ctx.strokeStyle = "rgba(217, 180, 110, 0.08)";
  ctx.lineWidth = 1;
  for (let i = -width; i < width * 2; i += 40) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + height, height);
    ctx.stroke();
  }

  // 2. Luxury Double Gold Borders
  ctx.strokeStyle = "#D4AF37";
  ctx.lineWidth = 6;
  ctx.strokeRect(36, 36, width - 72, height - 72);

  ctx.strokeStyle = "rgba(180, 130, 40, 0.4)";
  ctx.lineWidth = 2;
  ctx.strokeRect(48, 48, width - 96, height - 96);

  // Corner ornaments
  const drawCorner = (cx, cy) => {
    ctx.save();
    ctx.fillStyle = "#D4AF37";
    ctx.beginPath();
    ctx.arc(cx, cy, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };
  drawCorner(58, 58);
  drawCorner(width - 58, 58);
  drawCorner(58, height - 58);
  drawCorner(width - 58, height - 58);

  // 3. Header: The Internet Pet Wall
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Paw icon in gold
  ctx.fillStyle = "#D4AF37";
  ctx.beginPath();
  ctx.arc(width / 2, 110, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(width / 2 - 14, 88, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(width / 2 + 14, 88, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(width / 2 - 24, 102, 5.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(width / 2 + 24, 102, 5.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#1E293B";
  ctx.font = "800 24px 'Outfit', sans-serif";
  ctx.letterSpacing = "6px";
  ctx.fillText("THE INTERNET PET WALL", width / 2, 160);

  ctx.fillStyle = "#B45309";
  ctx.font = "700 15px 'Plus Jakarta Sans', sans-serif";
  ctx.letterSpacing = "3px";
  ctx.fillText("CERTIFICADO OFICIAL DE INMORTALIDAD", width / 2, 195);

  // Decorative divider line
  const divGrad = ctx.createLinearGradient(width / 2 - 200, 225, width / 2 + 200, 225);
  divGrad.addColorStop(0, "rgba(212, 175, 55, 0)");
  divGrad.addColorStop(0.5, "rgba(212, 175, 55, 1)");
  divGrad.addColorStop(1, "rgba(212, 175, 55, 0)");
  ctx.strokeStyle = divGrad;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 220, 225);
  ctx.lineTo(width / 2 + 220, 225);
  ctx.stroke();

  // 4. Pet Photo Frame
  const photoSize = 440;
  const photoX = (width - photoSize) / 2;
  const photoY = 265;
  const radius = 24;

  // Frame outer shadow
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.15)";
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 15;
  ctx.fillStyle = "#FFFFFF";
  roundRect(ctx, photoX - 10, photoY - 10, photoSize + 20, photoSize + 20, radius + 4);
  ctx.fill();
  ctx.restore();

  const isVip = Boolean(pet.isVip ?? pet.is_vip);

  // Golden inner border
  ctx.strokeStyle = isVip ? "#F59E0B" : "#D4AF37";
  ctx.lineWidth = isVip ? 6 : 4;
  roundRect(ctx, photoX - 10, photoY - 10, photoSize + 20, photoSize + 20, radius + 4);
  ctx.stroke();

  // Load and draw image inside clipped rounded rect
  try {
    const targetPhoto = pet.photoUrl || pet.photo_url || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80";
    const img = await loadImage(targetPhoto);
    if (img) {
      ctx.save();
      roundRect(ctx, photoX, photoY, photoSize, photoSize, radius);
      ctx.clip();

      // Center crop fill
      const aspect = img.width / img.height;
      let sWidth, sHeight, sx, sy;
      if (aspect > 1) {
        sHeight = img.height;
        sWidth = img.height;
        sx = (img.width - img.height) / 2;
        sy = 0;
      } else {
        sWidth = img.width;
        sHeight = img.width;
        sx = 0;
        sy = (img.height - img.width) / 2;
      }
      ctx.drawImage(img, sx, sy, sWidth, sHeight, photoX, photoY, photoSize, photoSize);
      ctx.restore();
    } else {
      throw new Error("Image could not be loaded");
    }
  } catch (err) {
    console.warn("Canvas photo fallback triggered:", err);
    // Fallback if image fails to load in canvas
    ctx.save();
    ctx.fillStyle = "#E2E8F0";
    roundRect(ctx, photoX, photoY, photoSize, photoSize, radius);
    ctx.fill();
    ctx.fillStyle = "#64748B";
    ctx.font = "600 28px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText("🐾 " + pet.name, width / 2, photoY + photoSize / 2);
    ctx.restore();
  }

  // VIP Badge on photo if VIP
  if (isVip) {
    const badgeW = 200;
    const badgeH = 42;
    const badgeX = (width - badgeW) / 2;
    const badgeY = photoY + photoSize - 26;
    ctx.save();
    ctx.fillStyle = "#F59E0B";
    ctx.shadowColor = "rgba(245, 158, 11, 0.5)";
    ctx.shadowBlur = 12;
    roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 20);
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "800 15px 'Plus Jakarta Sans', sans-serif";
    ctx.letterSpacing = "2px";
    ctx.fillText("★ GOLDEN VIP ★", width / 2, badgeY + badgeH / 2);
    ctx.restore();
  }

  // 5. Pet Name & Registration Details
  const detailsY = 760;
  ctx.fillStyle = "#0F172A";
  ctx.font = "800 48px 'Outfit', sans-serif";
  ctx.letterSpacing = "1px";
  ctx.fillText(pet.name.toUpperCase(), width / 2, detailsY);

  ctx.fillStyle = "#475569";
  ctx.font = "600 20px 'Plus Jakarta Sans', sans-serif";
  const breedText = (pet.breed || "Mascota") + " • " + (pet.city || "Ciudadano del Mundo");
  ctx.fillText(breedText, width / 2, detailsY + 44);

  // Plaque Pill Badge
  const pillW = 320;
  const pillH = 46;
  const pillX = (width - pillW) / 2;
  const pillY = detailsY + 76;
  ctx.fillStyle = "#F1F5F9";
  ctx.strokeStyle = "#CBD5E1";
  ctx.lineWidth = 1.5;
  roundRect(ctx, pillX, pillY, pillW, pillH, 23);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#0F172A";
  ctx.font = "700 17px 'Outfit', monospace";
  ctx.letterSpacing = "2px";
  ctx.fillText("PLACA OFICIAL: " + (pet.code || "PET-0000"), width / 2, pillY + pillH / 2);

  // Quote / Dedication
  if (pet.quote) {
    ctx.save();
    ctx.fillStyle = "#334155";
    ctx.font = "italic 500 21px 'Plus Jakarta Sans', serif";
    const maxWidth = width - 260;
    wrapText(ctx, `“${pet.quote}”`, width / 2, detailsY + 160, maxWidth, 32);
    ctx.restore();
  }

  // 6. Bottom Seals & Security Marks
  const bottomY = height - 260;

  // Golden Stamp Seal (Left)
  drawOfficialStamp(ctx, 220, bottomY + 70, pet.date);

  // Simulated QR Code (Right)
  drawDecorativeQR(ctx, width - 340, bottomY - 10, 160);

  // Bottom Legal & Copyright
  ctx.fillStyle = "#94A3B8";
  ctx.font = "500 14px 'Plus Jakarta Sans', sans-serif";
  ctx.letterSpacing = "1px";
  ctx.fillText("THE INTERNET PET WALL • PERPETUAL REGISTRATION • VERIFICADO POR AMOR", width / 2, height - 60);

  return canvas.toDataURL("image/png");
}

function loadImage(src) {
  return new Promise((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = async () => {
      try {
        const response = await fetch(src, { mode: "cors" });
        if (response.ok) {
          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(blob);
          const blobImg = new Image();
          blobImg.onload = () => {
            resolve(blobImg);
          };
          blobImg.onerror = () => resolve(null);
          blobImg.src = objectUrl;
          return;
        }
      } catch (err) {
        console.warn("Could not fetch image as blob:", err);
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

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let currentY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, currentY);
      line = words[n] + " ";
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, currentY);
}

function drawOfficialStamp(ctx, cx, cy, dateStr) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.08);

  ctx.strokeStyle = "#B45309";
  ctx.fillStyle = "#B45309";
  ctx.lineWidth = 3;

  // Double circle
  ctx.beginPath();
  ctx.arc(0, 0, 72, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, 64, 0, Math.PI * 2);
  ctx.stroke();

  // Central star and text
  ctx.font = "800 11px 'Plus Jakarta Sans', sans-serif";
  ctx.letterSpacing = "1.5px";
  ctx.fillText("★ OFICIAL ★", 0, -32);

  ctx.font = "700 13px 'Outfit', sans-serif";
  ctx.fillText("INMORTALIZADO", 0, -8);

  ctx.font = "600 10px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText(dateStr || "2026", 0, 14);

  ctx.font = "800 10px 'Plus Jakarta Sans', sans-serif";
  ctx.letterSpacing = "1px";
  ctx.fillText("VALIDEZ ETERNA", 0, 36);

  ctx.restore();
}

function drawDecorativeQR(ctx, x, y, size) {
  ctx.save();
  // Frame
  ctx.fillStyle = "#FFFFFF";
  ctx.strokeStyle = "#D4AF37";
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, size, size, 12);
  ctx.fill();
  ctx.stroke();

  // Draw simulated QR matrix blocks
  const innerMargin = 16;
  const innerSize = size - innerMargin * 2;
  const modules = 15;
  const cellSize = innerSize / modules;

  ctx.fillStyle = "#1E293B";

  // Corner locators
  const drawLocator = (lx, ly) => {
    ctx.fillRect(lx, ly, cellSize * 4, cellSize * 4);
    ctx.clearRect(lx + cellSize, ly + cellSize, cellSize * 2, cellSize * 2);
    ctx.fillRect(lx + cellSize * 1.3, ly + cellSize * 1.3, cellSize * 1.4, cellSize * 1.4);
  };
  drawLocator(x + innerMargin, y + innerMargin);
  drawLocator(x + innerMargin + (modules - 4) * cellSize, y + innerMargin);
  drawLocator(x + innerMargin, y + innerMargin + (modules - 4) * cellSize);

  // Pattern dots
  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      if (
        (r < 5 && c < 5) ||
        (r < 5 && c >= modules - 5) ||
        (r >= modules - 5 && c < 5)
      ) {
        continue;
      }
      if ((r * c + r * 3 + c * 7) % 3 === 0) {
        ctx.fillRect(
          x + innerMargin + c * cellSize,
          y + innerMargin + r * cellSize,
          cellSize * 0.9,
          cellSize * 0.9
        );
      }
    }
  }

  // Label under QR
  ctx.fillStyle = "#64748B";
  ctx.font = "600 11px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText("ESCANEAR EN EL MURO", x + size / 2, y + size + 20);

  ctx.restore();
}
