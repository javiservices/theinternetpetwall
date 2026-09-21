import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Printer,
  Download,
  Share2,
  Sparkles,
  RotateCw,
  Loader2,
  Check,
  Layers,
  ShieldCheck,
  Box,
} from "lucide-react";
import {
  generateCollarTagDataUrl,
  generatePrintableTagSheetDataUrl,
  generateCollarTagSvg,
} from "../utils/collarTagCanvas";
import {
  downloadDataUrl,
  downloadSvgString,
  shareImageFile,
} from "../utils/downloadHelper";
import { useTranslation } from "../i18n/LanguageContext";

export function CollarTagModal({ pet, onClose }) {
  const { t } = useTranslation();

  // Customization state
  const [shape, setShape] = useState("circle"); // 'circle' | 'square'
  const [finish, setFinish] = useState("gold"); // 'gold' | 'silver' | 'black'
  const [viewSide, setViewSide] = useState("front"); // 'front' | 'back'

  // Generated images
  const [tagPreviewUrl, setTagPreviewUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // 3D Tilt effect
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const tagWrapRef = useRef(null);

  // In-memory memoized previews for instant switching
  const previewCacheRef = useRef(new Map());

  // Render tag whenever pet, shape, finish, or viewSide changes
  useEffect(() => {
    if (!pet) return;
    let isCurrent = true;

    const cacheKey = `${pet.code || pet.id}_${shape}_${finish}_${viewSide}`;
    if (previewCacheRef.current.has(cacheKey)) {
      setTagPreviewUrl(previewCacheRef.current.get(cacheKey));
      setIsGenerating(false);
      return;
    }

    setIsGenerating(true);

    generateCollarTagDataUrl(pet, { shape, finish, side: viewSide })
      .then((url) => {
        if (isCurrent) {
          previewCacheRef.current.set(cacheKey, url);
          setTagPreviewUrl(url);
          setIsGenerating(false);

          // Pre-warm opposite side in background for 0ms instant flip
          const oppSide = viewSide === "front" ? "back" : "front";
          const oppKey = `${pet.code || pet.id}_${shape}_${finish}_${oppSide}`;
          if (!previewCacheRef.current.has(oppKey)) {
            setTimeout(() => {
              generateCollarTagDataUrl(pet, { shape, finish, side: oppSide })
                .then((oppUrl) => {
                  previewCacheRef.current.set(oppKey, oppUrl);
                })
                .catch(() => {});
            }, 60);
          }
        }
      })
      .catch((err) => {
        console.error("Error generating collar tag:", err);
        if (isCurrent) setIsGenerating(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [pet, shape, finish, viewSide]);

  if (!pet) return null;

  // 3D Tilt interaction
  const handleMouseMove = (e) => {
    if (!tagWrapRef.current) return;
    const rect = tagWrapRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -12;
    const rotY = ((x - centerX) / centerX) * 12;

    setTilt({ x: rotX, y: rotY });
    setGlare({ x: (x / rect.width) * 100, y: (y / rect.height) * 100, opacity: 0.35 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setGlare({ x: 50, y: 50, opacity: 0 });
  };

  // Flip face
  const toggleSide = () => {
    setViewSide((prev) => (prev === "front" ? "back" : "front"));
  };

  // 1. Download active medal view (PNG HD)
  const handleDownloadSingle = async () => {
    if (!tagPreviewUrl) return;
    setIsDownloading(true);
    const filename = `Chapa_${pet.name}_${pet.code}_3x3cm_${viewSide}.png`;
    const ok = await downloadDataUrl(tagPreviewUrl, filename);
    setIsDownloading(false);
    if (ok) {
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    }
  };

  // 2. Download Complete Printable Sheet (Plantilla para recortar 3x3 cm)
  const handleDownloadSheet = async () => {
    setIsDownloading(true);
    try {
      const sheetUrl = await generatePrintableTagSheetDataUrl(pet, { shape, finish });
      const filename = `Plantilla_Chapa_Collar_${pet.name}_3x3cm.png`;
      const ok = await downloadDataUrl(sheetUrl, filename);
      if (ok) {
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Error generating printable sheet:", err);
      alert(t("collar_sheet_error"));
    } finally {
      setIsDownloading(false);
    }
  };

  // 3. Download Vector SVG for 3D Printing (Bambu / Prusa / Orca / Tinkercad)
  const handleDownloadSvg = async (targetSide = viewSide) => {
    setIsDownloading(true);
    try {
      const svgString = await generateCollarTagSvg(pet, { shape, side: targetSide });
      const sideLabel = targetSide === "both" ? "Completa_AmbasCaras" : targetSide === "front" ? "Anverso" : "Reverso";
      const filename = `Chapa_${pet.name}_${pet.code}_3x3cm_${sideLabel}.svg`;
      const ok = await downloadSvgString(svgString, filename);
      if (ok) {
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Error generating SVG 3D:", err);
      alert(t("collar_svg_error"));
    } finally {
      setIsDownloading(false);
    }
  };

  // 4. Print
  const handlePrint = () => {
    window.print();
  };

  // 4. Mobile Share
  const handleShare = async () => {
    if (!tagPreviewUrl) return;
    const filename = `Chapa_${pet.name}_3x3cm.png`;
    const title = t("collar_share_title", { name: pet.name });
    const text = t("collar_share_text", { name: pet.name });
    await shareImageFile(tagPreviewUrl, filename, title, text);
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 2300 }}>
      <div
        className="modal-content collar-modal"
        style={{
          maxWidth: "580px",
          textAlign: "center",
          padding: "22px 24px max(24px, env(safe-area-inset-bottom, 20px))",
          background: "var(--bg-surface)",
          border: "1px solid var(--border-color)",
          borderRadius: "24px",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.45)",
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

        {/* Modal Header */}
        <div style={{ marginBottom: "12px", padding: "0 24px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "3px 10px",
              borderRadius: "20px",
              background: "rgba(217, 119, 6, 0.12)",
              color: "#D97706",
              fontSize: "0.76rem",
              fontWeight: 800,
              marginBottom: "6px",
            }}
          >
            <Sparkles size={13} />
            <span>{t("collar_badge_real_size")}</span>
          </div>

          <h3
            style={{
              fontSize: "1.3rem",
              fontWeight: 800,
              fontFamily: "var(--font-heading)",
              color: "var(--text-primary)",
              margin: 0,
            }}
          >
            {t("collar_modal_heading", { name: pet.name })}
          </h3>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "3px" }}>
            {t("collar_modal_sub")}
          </p>
        </div>

        {/* Customization Toolbar: Shape & Finish & Face */}
        <div className="collar-toolbar">
          {/* Row 1: Shape & Face */}
          <div className="collar-toolbar-row">
            {/* Shape selection */}
            <div className="collar-shape-group">
              <span className="collar-toolbar-label">{t("collar_shape_label")}</span>
              <div className="collar-shape-toggle">
                <button
                  type="button"
                  onClick={() => setShape("circle")}
                  className={`collar-shape-btn ${shape === "circle" ? "active" : ""}`}
                >
                  {t("collar_shape_circle_btn")}
                </button>
                <button
                  type="button"
                  onClick={() => setShape("square")}
                  className={`collar-shape-btn ${shape === "square" ? "active" : ""}`}
                >
                  {t("collar_shape_square_btn")}
                </button>
              </div>
            </div>

            {/* Face Toggle */}
            <button
              type="button"
              onClick={toggleSide}
              className="collar-face-btn"
            >
              <RotateCw size={13} />
              <span>{viewSide === "front" ? t("collar_toggle_side_front") : t("collar_toggle_side_back")}</span>
            </button>
          </div>

          {/* Row 2: Metallic Finishes */}
          <div className="collar-finish-section">
            <span className="collar-toolbar-label">{t("collar_finish_label")}</span>
            <div className="collar-finish-grid">
              <button
                type="button"
                onClick={() => setFinish("gold")}
                className={`collar-finish-btn ${finish === "gold" ? "active-gold" : ""}`}
              >
                <span className="collar-finish-dot finish-dot-gold" />
                <span>{t("collar_finish_gold")}</span>
              </button>

              <button
                type="button"
                onClick={() => setFinish("silver")}
                className={`collar-finish-btn ${finish === "silver" ? "active-silver" : ""}`}
              >
                <span className="collar-finish-dot finish-dot-silver" />
                <span>{t("collar_finish_silver")}</span>
              </button>

              <button
                type="button"
                onClick={() => setFinish("black")}
                className={`collar-finish-btn ${finish === "black" ? "active-black" : ""}`}
              >
                <span className="collar-finish-dot finish-dot-black" />
                <span>{t("collar_finish_black")}</span>
              </button>

              <button
                type="button"
                onClick={() => setFinish("3dprint")}
                className={`collar-finish-btn ${finish === "3dprint" ? "active-3dprint" : ""}`}
                title={t("collar_finish_3dprint_title")}
              >
                <span>{t("collar_finish_3dprint")}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3D Interactive Tag Preview Card */}
        <div
          ref={tagWrapRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={toggleSide}
          title={t("collar_flip_title")}
          style={{
            position: "relative",
            width: "min(220px, 30vh, 65vw)",
            height: "min(220px, 30vh, 65vw)",
            margin: "0 auto 12px",
            perspective: "1000px",
            transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transition: "transform 0.1s ease-out",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            touchAction: "pan-y",
          }}
        >
          {isGenerating ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
              <Loader2 size={32} className="animate-spin" color="#D97706" />
              <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{t("collar_minting")}</span>
            </div>
          ) : (
            <>
              <img
                src={tagPreviewUrl}
                alt={t("collar_modal_heading", { name: pet.name })}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  display: "block",
                  filter: "drop-shadow(0 15px 30px rgba(0,0,0,0.35))",
                }}
              />

              {/* Glossy light sheen */}
              <div
                style={{
                  position: "absolute",
                  inset: "5%",
                  borderRadius: shape === "circle" ? "50%" : "22%",
                  pointerEvents: "none",
                  background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, ${glare.opacity}) 0%, rgba(255, 255, 255, 0) 65%)`,
                  mixBlendMode: "overlay",
                }}
              />

              {/* Tap to flip badge */}
              <div
                style={{
                  position: "absolute",
                  bottom: "-6px",
                  background: "rgba(0, 0, 0, 0.75)",
                  color: "#FFFFFF",
                  backdropFilter: "blur(6px)",
                  padding: "4px 10px",
                  borderRadius: "12px",
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <RotateCw size={10} />
                <span>{viewSide === "front" ? t("collar_tap_flip_front") : t("collar_tap_flip_back")}</span>
              </div>
            </>
          )}
        </div>

        {/* Real Scale & 3D Print indicator badge */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(16, 185, 129, 0.08)",
            border: "1px solid rgba(16, 185, 129, 0.25)",
            padding: "8px 14px",
            borderRadius: "12px",
            marginBottom: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <ShieldCheck size={16} color="#10B981" />
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-primary)" }}>
              {t("collar_3d_opt_title")}
            </span>
          </div>
          <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>
            {t("collar_3d_opt_desc")}
          </span>
        </div>

        {/* Download Success Flash */}
        {downloadSuccess && (
          <div
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              background: "#ECFDF5",
              color: "#059669",
              fontSize: "0.82rem",
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              marginBottom: "12px",
            }}
          >
            <Check size={15} />
            <span>{t("collar_download_success")}</span>
          </div>
        )}

        {/* Actions Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
          {/* Button 1: Download Active Medal View */}
          <button
            type="button"
            className="btn-primary"
            onClick={handleDownloadSingle}
            disabled={isGenerating || isDownloading}
            style={{ justifyContent: "center", padding: "10px 12px", fontSize: "0.83rem" }}
          >
            {isDownloading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )}
            <span>{t("collar_download_single")}</span>
          </button>

          {/* Button 2: Download Vector SVG for 3D Printing (Active Face) */}
          <button
            type="button"
            className="btn-secondary"
            onClick={() => handleDownloadSvg(viewSide)}
            disabled={isGenerating || isDownloading}
            style={{
              justifyContent: "center",
              padding: "10px 12px",
              fontSize: "0.83rem",
              borderColor: finish === "3dprint" ? "#2563EB" : "var(--border-color)",
              background: finish === "3dprint" ? "rgba(37, 99, 235, 0.12)" : "var(--bg-surface)",
              color: finish === "3dprint" ? "#2563EB" : "var(--text-primary)",
              fontWeight: 800,
            }}
            title={t("collar_svg_title")}
          >
            <Box size={16} color={finish === "3dprint" ? "#2563EB" : "currentColor"} />
            <span>{t("collar_download_svg_single", { side: viewSide === "front" ? t("collar_side_front") : t("collar_side_back") })}</span>
          </button>
        </div>

        {/* Secondary Row: Both Sides 3D SVG, Printable Sheet & Direct Print */}
        <div className="collar-secondary-grid" style={{ display: "grid", gridTemplateColumns: "1.1fr 1.1fr 0.8fr", gap: "8px", marginBottom: "12px" }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => handleDownloadSvg("both")}
            disabled={isGenerating || isDownloading}
            style={{
              justifyContent: "center",
              padding: "9px 8px",
              fontSize: "0.76rem",
              borderColor: "#3B82F6",
              color: "#2563EB",
              background: "rgba(59, 130, 246, 0.06)",
              fontWeight: 700,
            }}
            title={t("collar_both_svg_title")}
          >
            <Box size={14} color="#2563EB" />
            <span>{t("collar_download_svg_both")}</span>
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={handleDownloadSheet}
            disabled={isGenerating || isDownloading}
            style={{
              justifyContent: "center",
              padding: "9px 8px",
              fontSize: "0.76rem",
              borderColor: "var(--accent-gold)",
              color: "var(--accent-gold-dark)",
            }}
            title={t("collar_sheet_title")}
          >
            <Layers size={14} />
            <span>{t("collar_download_sheet")}</span>
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={handlePrint}
            style={{ justifyContent: "center", fontSize: "0.76rem", padding: "9px 8px" }}
          >
            <Printer size={14} />
            <span>{t("collar_print_action")}</span>
          </button>
        </div>

        {/* Third Row: Share & Close */}
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          {navigator.share && (
            <button
              type="button"
              className="btn-secondary"
              onClick={handleShare}
              style={{ flex: 1, justifyContent: "center", fontSize: "0.82rem", padding: "8px 12px" }}
            >
              <Share2 size={15} />
              <span>{t("collar_share_action")}</span>
            </button>
          )}

          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            style={{ flex: 1, justifyContent: "center", fontSize: "0.82rem", padding: "8px 12px" }}
          >
            <X size={15} />
            <span>{t("close_modal")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
