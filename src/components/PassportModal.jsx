import React, { useEffect, useState, useRef } from "react";
import { X, Download, Share2, Check, Sparkles, Loader2 } from "lucide-react";
import { generatePetPassportDataUrl } from "../utils/passportCanvas";
import { downloadDataUrl, shareImageFile } from "../utils/downloadHelper";
import { useTranslation } from "../i18n/LanguageContext";
import { trackEvent } from "../utils/analytics";

export function PassportModal({ pet, onClose, onOpenStory, onOpenCollarTag }) {
  const { t } = useTranslation();
  const [passportUrl, setPassportUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // 3D Tilt State
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const cardRef = useRef(null);

  useEffect(() => {
    if (!pet) return;
    let isMounted = true;
    setLoading(true);

    generatePetPassportDataUrl(pet)
      .then((url) => {
        if (isMounted) {
          setPassportUrl(url);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Error generating passport canvas:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [pet]);

  if (!pet) return null;

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -10; // max -10 to +10 deg
    const rotY = ((x - centerX) / centerX) * 10;

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTilt({ x: rotX, y: rotY });
    setGlare({ x: glareX, y: glareY, opacity: 0.4 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setGlare({ x: 50, y: 50, opacity: 0 });
  };

  const handleDownload = async () => {
    if (!passportUrl) return;
    setIsDownloading(true);
    const filename = `${pet.name.replace(/\s+/g, "_")}_Pasaporte_Oficial.png`;
    const ok = await downloadDataUrl(passportUrl, filename);
    setIsDownloading(false);
    if (ok) {
      setDownloadSuccess(true);
      trackEvent("download_passport", { code: pet?.code, name: pet?.name });
      setTimeout(() => setDownloadSuccess(false), 3000);
    }
  };

  const handleShare = async () => {
    const shareText = t("passport_share_text", { name: pet.name, code: pet.code });
    const shareUrl = window.location.href;
    const filename = `${pet.name}_Pasaporte.png`;
    const shareTitle = t("passport_share_title", { name: pet.name });

    if (passportUrl) {
      const shared = await shareImageFile(passportUrl, filename, shareTitle, `${shareText} ${shareUrl}`);
      if (shared) return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      alert(t("link_copied_alert"));
    }
  };

  const touchStartY = React.useRef(0);
  const containerRef = React.useRef(null);

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diffY = touchEndY - touchStartY.current;
    if (diffY > 75 && containerRef.current && containerRef.current.scrollTop <= 5) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 2200 }}>
      <div
        ref={containerRef}
        className="modal-content passport-modal"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        role="dialog"
        aria-modal="true"
        style={{ maxWidth: "520px" }}
      >
        {/* Mobile drag handle */}
        <div className="modal-drag-indicator mobile-only" aria-hidden="true">
          <div className="modal-drag-bar" />
        </div>

        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label={t("close_modal")}
          title={t("close_modal")}
        >
          <X size={18} />
        </button>

        <div style={{ padding: "0 28px", marginBottom: "10px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--accent-gold-dark)", marginBottom: "4px", fontWeight: 700, fontSize: "0.82rem" }}>
            <Sparkles size={15} />
            <span>{t("doc_verified")} · {t("passport_holo_3d")}</span>
          </div>

          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.45rem", fontWeight: 800, marginBottom: "2px" }}>
            {t("passport_of")} {pet.name}
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.84rem" }}>
            {pet.code} • {t("passport_sub")}
          </p>
        </div>

        {/* 3D Interactive Perspective Wrap */}
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="passport-img-wrap"
          style={{
            perspective: "1000px",
            transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transition: "transform 0.1s ease-out, box-shadow 0.2s ease",
            position: "relative",
            overflow: "hidden",
            borderRadius: "16px",
            boxShadow: `0 ${12 + Math.abs(tilt.x) * 2}px ${24 + Math.abs(tilt.y) * 2}px rgba(0,0,0,0.22)`,
            cursor: "grab",
            maxHeight: "min(390px, 45vh)",
            width: "fit-content",
            margin: "6px auto 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {loading ? (
            <div style={{ padding: "60px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
              <Loader2 size={36} className="animate-spin" color="#D97706" />
              <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                {t("generating_passport")}
              </p>
            </div>
          ) : (
            <>
              <img
                src={passportUrl}
                alt={`${t("passport_of")} ${pet.name}`}
                className="passport-preview-img"
                style={{
                  maxHeight: "min(390px, 45vh)",
                  width: "auto",
                  height: "auto",
                  maxWidth: "100%",
                  objectFit: "contain",
                  display: "block",
                }}
              />

              {/* Holographic dynamic light reflection sheen */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  pointerEvents: "none",
                  background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255, 235, 150, ${glare.opacity}) 0%, rgba(255, 255, 255, 0) 70%)`,
                  mixBlendMode: "color-dodge",
                  transition: "opacity 0.2s ease",
                }}
              />
            </>
          )}
        </div>

        {/* Primary and Viral Actions */}
        <div className="passport-actions" style={{ marginTop: "12px" }}>
          <button
            className="btn-primary"
            onClick={handleDownload}
            disabled={loading || !passportUrl || isDownloading}
            id="download-passport-btn"
            style={{ padding: "9px 14px", fontSize: "0.84rem", justifyContent: "center" }}
          >
            {isDownloading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : downloadSuccess ? (
              <Check size={16} />
            ) : (
              <Download size={16} />
            )}
            <span>{downloadSuccess ? t("btn_downloaded") : t("download_btn")}</span>
          </button>

          <button
            className="btn-secondary"
            onClick={handleShare}
            id="share-passport-btn"
            style={{ padding: "9px 14px", fontSize: "0.84rem", justifyContent: "center" }}
          >
            {copied ? <Check size={16} color="#10B981" /> : <Share2 size={16} />}
            <span>{copied ? t("copied_btn") : t("share_btn")}</span>
          </button>

          {onOpenStory && (
            <button
              className="btn-secondary"
              onClick={() => onOpenStory(pet)}
              title={t("story_modal_btn_desc")}
              style={{ padding: "9px 14px", fontSize: "0.84rem", justifyContent: "center" }}
            >
              <span>{t("story_modal_btn_label")}</span>
            </button>
          )}

          {onOpenCollarTag && (
            <button
              className="btn-secondary"
              onClick={() => onOpenCollarTag(pet)}
              title={t("collar_modal_btn_desc")}
              style={{ padding: "9px 14px", fontSize: "0.84rem", justifyContent: "center" }}
            >
              <span>{t("collar_modal_btn_label")}</span>
            </button>
          )}

          <button
            type="button"
            className="btn-secondary passport-close-btn"
            onClick={onClose}
            style={{
              width: "100%",
              justifyContent: "center",
              height: "38px",
              marginTop: "4px",
              fontWeight: 600,
              fontSize: "0.84rem",
            }}
          >
            <X size={15} />
            <span>{t("close_modal")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
