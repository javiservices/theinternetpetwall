import React, { useRef, useEffect, useState } from "react";
import { X, Download, Share2, Check, Loader2 } from "lucide-react";
import QRCode from "qrcode";
import { parsePetLocation } from "../data/worldLocations";
import { downloadDataUrl, shareImageFile } from "../utils/downloadHelper";
import { useTranslation } from "../i18n/LanguageContext";

export function StoryShareModal({ pet, onClose }) {
  const { t } = useTranslation();
  const canvasRef = useRef(null);
  const [dataUrl, setDataUrl] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const loc = pet ? parsePetLocation(pet.city, pet) : null;

  useEffect(() => {
    if (!pet) return;
    let isCancelled = false;

    async function renderStory() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const W = 1080;
      const H = 1920;

      canvas.width = W;
      canvas.height = H;

      // 1. Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, W, H);
      if (pet.isMemorial) {
        bgGrad.addColorStop(0, "#0F172A");
        bgGrad.addColorStop(0.5, "#1E293B");
        bgGrad.addColorStop(1, "#090D16");
      } else if (pet.isVip) {
        bgGrad.addColorStop(0, "#1A150A");
        bgGrad.addColorStop(0.4, "#291E0B");
        bgGrad.addColorStop(1, "#0D0A05");
      } else {
        bgGrad.addColorStop(0, "#111827");
        bgGrad.addColorStop(0.5, "#1F2937");
        bgGrad.addColorStop(1, "#0A0D14");
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Subtle ambient bokeh circles
      ctx.save();
      const circleGrad = ctx.createRadialGradient(W / 2, H * 0.38, 50, W / 2, H * 0.38, 500);
      circleGrad.addColorStop(0, pet.isVip ? "rgba(245, 158, 11, 0.2)" : "rgba(59, 130, 246, 0.15)");
      circleGrad.addColorStop(1, "transparent");
      ctx.fillStyle = circleGrad;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();

      // 2. Top Header Brand
      ctx.fillStyle = "#FBBF24";
      ctx.font = "800 40px 'Outfit', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("🐾 THE INTERNET PET WALL", W / 2, 145);

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "700 24px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText("EL GRAN MOSAICO DIGITAL DE MASCOTAS", W / 2, 190);

      // 3. Load & Draw Pet Photo safely without canvas taint
      const targetPhoto = pet.photoUrl || pet.photo_url || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800";
      let petImg = null;
      try {
        petImg = await new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = async () => {
            try {
              const res = await fetch(targetPhoto, { mode: "cors" });
              if (res.ok) {
                const blob = await res.blob();
                const bImg = new Image();
                bImg.onload = () => resolve(bImg);
                bImg.onerror = () => resolve(null);
                bImg.src = URL.createObjectURL(blob);
                return;
              }
            } catch {
              // fallback
            }
            resolve(null);
          };
          img.src = targetPhoto;
        });
      } catch {
        petImg = null;
      }

      if (isCancelled) return;

      const photoSize = 640;
      const photoX = (W - photoSize) / 2;
      const photoY = 280;
      const radius = 64;

      // Glow behind photo
      ctx.save();
      ctx.shadowColor = pet.isVip ? "rgba(245, 158, 11, 0.7)" : "rgba(255, 255, 255, 0.35)";
      ctx.shadowBlur = 45;
      ctx.strokeStyle = pet.isVip ? "#F59E0B" : "#FFFFFF";
      ctx.lineWidth = 14;

      ctx.beginPath();
      ctx.roundRect(photoX, photoY, photoSize, photoSize, radius);
      ctx.stroke();
      ctx.restore();

      // Clip and draw image
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(photoX, photoY, photoSize, photoSize, radius);
      ctx.clip();

      // Aspect ratio fill
      const aspect = petImg.width / petImg.height;
      let drawW = photoSize;
      let drawH = photoSize;
      let offX = photoX;
      let offY = photoY;
      if (aspect > 1) {
        drawW = photoSize * aspect;
        offX = photoX - (drawW - photoSize) / 2;
      } else {
        drawH = photoSize / aspect;
        offY = photoY - (drawH - photoSize) / 2;
      }
      ctx.drawImage(petImg, offX, offY, drawW, drawH);
      ctx.restore();

      // Plaque Badge on top of photo
      const badgeW = 320;
      const badgeH = 62;
      const badgeX = (W - badgeW) / 2;
      const badgeY = photoY + photoSize - 31;

      ctx.fillStyle = "#111827";
      ctx.strokeStyle = pet.isVip ? "#FBBF24" : "#FFFFFF";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 31);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = pet.isVip ? "#FDE047" : "#FFFFFF";
      ctx.font = "900 28px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`★ ${pet.code} ★`, W / 2, badgeY + 41);

      // 4. Pet Name
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "900 84px 'Outfit', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(pet.name, W / 2, 1020);

      // 5. Breed & Location (Crisp Pure White)
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "700 36px 'Plus Jakarta Sans', sans-serif";
      const speciesIcon = pet.type === "dog" ? "🐶" : pet.type === "cat" ? "🐱" : "🐾";
      ctx.fillText(`${pet.breed} ${speciesIcon} · ${loc.flag} ${loc.displayLocation}`, W / 2, 1075);

      // 6. Quote (Multi-line bold wrapping)
      let currentQuoteY = 1140;
      if (pet.quote) {
        ctx.fillStyle = "#F9FAFB";
        ctx.font = "italic 600 32px 'Plus Jakarta Sans', sans-serif";
        const maxQuoteW = 860;
        const words = `“${pet.quote}”`.split(" ");
        let line = "";
        const lines = [];

        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + " ";
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxQuoteW && n > 0) {
            lines.push(line.trim());
            line = words[n] + " ";
          } else {
            line = testLine;
          }
        }
        lines.push(line.trim());

        // Draw up to 3 lines
        for (let i = 0; i < Math.min(lines.length, 3); i++) {
          ctx.fillText(lines[i], W / 2, currentQuoteY);
          currentQuoteY += 44;
        }
      }

      // 7. QR Code box (High contrast, clearly visible card)
      const qrUrl = `${window.location.origin}/wall?pet=${pet.code}`;
      const qrDataUri = await QRCode.toDataURL(qrUrl, {
        width: 240,
        margin: 1,
        color: { dark: "#000000", light: "#FFFFFF" },
      });

      const qrImg = new Image();
      qrImg.src = qrDataUri;
      await new Promise((r) => (qrImg.onload = r));

      const qrBoxW = 560;
      const qrBoxH = 210;
      const qrBoxX = (W - qrBoxW) / 2;
      const qrBoxY = Math.max(currentQuoteY + 30, 1340);

      // Background Card
      ctx.fillStyle = "rgba(255, 255, 255, 0.14)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(qrBoxX, qrBoxY, qrBoxW, qrBoxH, 28);
      ctx.fill();
      ctx.stroke();

      // Draw QR image with rounded white container
      ctx.drawImage(qrImg, qrBoxX + 24, qrBoxY + 25, 160, 160);

      // QR Text labels
      ctx.textAlign = "left";
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "800 32px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText("¡Escanea aquí!", qrBoxX + 206, qrBoxY + 74);

      ctx.fillStyle = "#FDE047";
      ctx.font = "800 24px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText("DALE UNA CHUCHE 🦴", qrBoxX + 206, qrBoxY + 115);

      ctx.fillStyle = "#E2E8F0";
      ctx.font = "600 22px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText("y visita su placa oficial", qrBoxX + 206, qrBoxY + 152);

      // 8. Bottom Footer (High contrast pill badge)
      const footerW = 740;
      const footerH = 56;
      const footerX = (W - footerW) / 2;
      const footerY = 1750;

      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(footerX, footerY, footerW, footerH, 28);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = "center";
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "800 22px 'Plus Jakarta Sans', sans-serif";
      ctx.letterSpacing = "2px";
      ctx.fillText("✨ INMORTALIZADO EN EL GRAN MURO MUNDIAL ✨", W / 2, footerY + 36);

      try {
        const finalUrl = canvas.toDataURL("image/png");
        setDataUrl(finalUrl);
        setIsReady(true);
      } catch (canvasErr) {
        console.error("Story canvas toDataURL error:", canvasErr);
      }
    }

    renderStory();

    return () => {
      isCancelled = true;
    };
  }, [pet]);

  const handleDownload = async () => {
    if (!dataUrl) return;
    setIsDownloading(true);
    const filename = `Story_${pet.name}_${pet.code}.png`;
    const ok = await downloadDataUrl(dataUrl, filename);
    setIsDownloading(false);
    if (ok) {
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    }
  };

  const handleShare = async () => {
    const petDirectUrl = `${window.location.origin}/wall?pet=${pet.code}`;
    const filename = `Story_${pet.name}_${pet.code}.png`;

    if (dataUrl) {
      const shared = await shareImageFile(
        dataUrl,
        filename,
        `Story de ${pet.name} en The Internet Pet Wall`,
        `¡Mira la placa oficial de ${pet.name}! Dale una chuche en ${petDirectUrl}`
      );
      if (shared) return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: `¡Mira a ${pet.name} en The Internet Pet Wall! 🐾`,
          text: `Inmortalicé a ${pet.name} en el gran mosaico digital. ¡Entra a darle una chuche! ${petDirectUrl}`,
          url: petDirectUrl,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    await navigator.clipboard?.writeText(petDirectUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  if (!pet) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 2300 }}>
      <div
        className="modal-content"
        style={{
          maxWidth: "480px",
          textAlign: "center",
          padding: "22px 24px max(24px, env(safe-area-inset-bottom, 20px))",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        <div className="modal-drag-indicator mobile-only" aria-hidden="true">
          <div className="modal-drag-bar" />
        </div>

        <button className="modal-close-btn" onClick={onClose} aria-label={t("close_modal")}>
          <X size={18} />
        </button>

        <div style={{ marginBottom: "12px", padding: "0 28px" }}>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 800, fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}>
            {t("story_modal_title")}
          </h3>
          <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: "4px" }}>
            {t("story_modal_desc")}
          </p>
        </div>

        {/* Hidden full resolution rendering canvas */}
        <canvas ref={canvasRef} style={{ display: "none" }} />

        {/* Live Preview Frame */}
        <div
          style={{
            position: "relative",
            width: "min(210px, calc(42vh * 9 / 16))",
            height: "min(375px, 42vh)",
            margin: "0 auto 14px",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
            border: "2px solid var(--border-subtle)",
            background: "#111",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {dataUrl ? (
            <img
              src={dataUrl}
              alt="Story Preview"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
              {t("story_generating")}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            className="btn-primary"
            onClick={handleDownload}
            disabled={!isReady || isDownloading}
            style={{ flex: 1, minWidth: "140px", justifyContent: "center" }}
          >
            {isDownloading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : downloadSuccess ? (
              <Check size={16} />
            ) : (
              <Download size={16} />
            )}
            <span>{downloadSuccess ? "¡Descargada!" : t("story_download_btn")}</span>
          </button>

          <button
            className="btn-secondary"
            onClick={handleShare}
            disabled={!isReady}
            style={{ flex: 1, minWidth: "140px", justifyContent: "center" }}
          >
            {isCopied ? <Check size={16} color="#10B981" /> : <Share2 size={16} />}
            <span>{isCopied ? t("share_copied") : t("share_btn_text")}</span>
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            style={{ width: "100%", justifyContent: "center", height: "42px", marginTop: "4px", fontWeight: 600 }}
          >
            <X size={16} />
            <span>{t("close_modal") || "Cerrar"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
