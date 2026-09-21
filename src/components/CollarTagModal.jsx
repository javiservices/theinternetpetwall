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

  // Render tag whenever pet, shape, finish, or viewSide changes
  useEffect(() => {
    if (!pet) return;
    let isCurrent = true;
    setIsGenerating(true);

    generateCollarTagDataUrl(pet, { shape, finish, side: viewSide })
      .then((url) => {
        if (isCurrent) {
          setTagPreviewUrl(url);
          setIsGenerating(false);
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
      alert("No se pudo generar la plantilla imprimible.");
    } finally {
      setIsDownloading(false);
    }
  };

  // 3. Download Vector SVG for 3D Printing (Bambu / Prusa / Orca / Tinkercad)
  const handleDownloadSvg = async () => {
    setIsDownloading(true);
    try {
      const svgString = await generateCollarTagSvg(pet, { shape, side: viewSide });
      const filename = `Chapa_${pet.name}_${pet.code}_3x3cm_${viewSide}.svg`;
      const ok = await downloadSvgString(svgString, filename);
      if (ok) {
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Error generating SVG 3D:", err);
      alert("No se pudo generar el modelo vectorial SVG 3D.");
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
    const title = `Chapa Oficial para Collar de ${pet.name}`;
    const text = `Chapa oficial 3x3 cm de ${pet.name} con código QR escaneable de The Internet Pet Wall 🐾`;
    await shareImageFile(tagPreviewUrl, filename, title, text);
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 2300 }}>
      <div
        className="modal-content collar-modal"
        style={{
          maxWidth: "580px",
          textAlign: "center",
          padding: "28px 24px",
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

        <button className="modal-close-btn" onClick={onClose} aria-label="Cerrar modal">
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ marginBottom: "16px", padding: "0 28px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 12px",
              borderRadius: "20px",
              background: "rgba(217, 119, 6, 0.12)",
              color: "#D97706",
              fontSize: "0.78rem",
              fontWeight: 800,
              marginBottom: "8px",
            }}
          >
            <Sparkles size={14} />
            <span>Medida Física Real: 3 x 3 cm (30 mm)</span>
          </div>

          <h3
            style={{
              fontSize: "1.35rem",
              fontWeight: 800,
              fontFamily: "var(--font-heading)",
              color: "var(--text-primary)",
              margin: 0,
            }}
          >
            Chapa Oficial de Collar: {pet.name}
          </h3>
          <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: "4px" }}>
            Diseño metálico oficial con QR de rescate directo a su perfil en el muro.
          </p>
        </div>

        {/* Customization Toolbar: Shape & Finish & Face */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            background: "var(--bg-warm)",
            padding: "12px",
            borderRadius: "16px",
            marginBottom: "18px",
            border: "1px solid var(--border-subtle)",
          }}
        >
          {/* Row 1: Shape & Face */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            {/* Shape selection */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)" }}>Forma:</span>
              <div style={{ display: "inline-flex", gap: "4px", background: "var(--bg-surface)", padding: "3px", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
                <button
                  type="button"
                  onClick={() => setShape("circle")}
                  style={{
                    padding: "4px 10px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    borderRadius: "8px",
                    border: "none",
                    background: shape === "circle" ? "var(--accent-gold)" : "transparent",
                    color: shape === "circle" ? "#000" : "var(--text-secondary)",
                    cursor: "pointer",
                  }}
                >
                  ⭕ Redonda (Ø 30mm)
                </button>
                <button
                  type="button"
                  onClick={() => setShape("square")}
                  style={{
                    padding: "4px 10px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    borderRadius: "8px",
                    border: "none",
                    background: shape === "square" ? "var(--accent-gold)" : "transparent",
                    color: shape === "square" ? "#000" : "var(--text-secondary)",
                    cursor: "pointer",
                  }}
                >
                  ⬛ Placa (3x3 cm)
                </button>
              </div>
            </div>

            {/* Face Toggle */}
            <button
              type="button"
              onClick={toggleSide}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "10px",
                background: "var(--bg-surface)",
                border: "1px solid var(--border-color)",
                fontSize: "0.76rem",
                fontWeight: 700,
                color: "var(--accent-gold-dark)",
                cursor: "pointer",
              }}
            >
              <RotateCw size={13} />
              <span>Ver {viewSide === "front" ? "Reverso (QR)" : "Anverso (Foto)"}</span>
            </button>
          </div>

          {/* Row 2: Metallic Finishes */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)" }}>Acabado:</span>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                onClick={() => setFinish("gold")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "5px 12px",
                  borderRadius: "20px",
                  border: finish === "gold" ? "2px solid #D97706" : "1px solid var(--border-color)",
                  background: finish === "gold" ? "rgba(245, 158, 11, 0.15)" : "var(--bg-surface)",
                  color: finish === "gold" ? "#B45309" : "var(--text-secondary)",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "linear-gradient(135deg, #FDE047, #B45309)" }} />
                <span>Oro 24K</span>
              </button>

              <button
                type="button"
                onClick={() => setFinish("silver")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "5px 12px",
                  borderRadius: "20px",
                  border: finish === "silver" ? "2px solid #64748B" : "1px solid var(--border-color)",
                  background: finish === "silver" ? "rgba(100, 116, 139, 0.15)" : "var(--bg-surface)",
                  color: finish === "silver" ? "#334155" : "var(--text-secondary)",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "linear-gradient(135deg, #FFFFFF, #64748B)" }} />
                <span>Plata Titanio</span>
              </button>

              <button
                type="button"
                onClick={() => setFinish("black")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "5px 12px",
                  borderRadius: "20px",
                  border: finish === "black" ? "2px solid #D4AF37" : "1px solid var(--border-color)",
                  background: finish === "black" ? "rgba(17, 24, 39, 0.25)" : "var(--bg-surface)",
                  color: finish === "black" ? "var(--text-primary)" : "var(--text-secondary)",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "linear-gradient(135deg, #1E293B, #020617)", border: "1px solid #D4AF37" }} />
                <span>Ónix & Oro</span>
              </button>

              <button
                type="button"
                onClick={() => setFinish("3dprint")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "5px 12px",
                  borderRadius: "20px",
                  border: finish === "3dprint" ? "2px solid #3B82F6" : "1px solid var(--border-color)",
                  background: finish === "3dprint" ? "rgba(59, 130, 246, 0.15)" : "var(--bg-surface)",
                  color: finish === "3dprint" ? "#2563EB" : "var(--text-secondary)",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
                title="Modo relieve de alto contraste en blanco y negro para importar en laminadores 3D (Bambu Studio, Prusa, Cura)"
              >
                <span>🖨️ Relieve 3D (B/N)</span>
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
          title="Haz clic para voltear la chapa"
          style={{
            position: "relative",
            width: "280px",
            height: "280px",
            margin: "0 auto 18px",
            perspective: "1000px",
            transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transition: "transform 0.1s ease-out",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isGenerating ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
              <Loader2 size={32} className="animate-spin" color="#D97706" />
              <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Acuñando medalla 3D...</span>
            </div>
          ) : (
            <>
              <img
                src={tagPreviewUrl}
                alt={`Chapa de collar de ${pet.name}`}
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
                <span>Pulsa para ver {viewSide === "front" ? "Reverso" : "Anverso"}</span>
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
              Apta para Impresión 3D (FDM / Resina) · Cero Desbordes
            </span>
          </div>
          <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>
            Medida real: 30 x 30 mm · Orejeta para anilla: Ø 3.8 mm · Todo el texto e iconos contenidos 100%
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
            <span>¡Descarga iniciada con éxito!</span>
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
            <span>Descargar Chapa HD</span>
          </button>

          {/* Button 2: Download Vector SVG for 3D Printing */}
          <button
            type="button"
            className="btn-secondary"
            onClick={handleDownloadSvg}
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
            title="Descarga el modelo vectorial .SVG listo para laminar y extruir en Bambu Studio, PrusaSlicer, Orca o Tinkercad"
          >
            <Box size={16} color={finish === "3dprint" ? "#2563EB" : "currentColor"} />
            <span>Modelo SVG 3D (.svg)</span>
          </button>
        </div>

        {/* Secondary Row: Printable Sheet & Direct Print */}
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "10px", marginBottom: "12px" }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleDownloadSheet}
            disabled={isGenerating || isDownloading}
            style={{
              justifyContent: "center",
              padding: "9px 12px",
              fontSize: "0.80rem",
              borderColor: "var(--accent-gold)",
              color: "var(--accent-gold-dark)",
            }}
            title="Descarga la plantilla con anverso y reverso para recortar y plastificar a tamaño real (3x3 cm)"
          >
            <Layers size={15} />
            <span>Plantilla Imprimible (3x3)</span>
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={handlePrint}
            style={{ justifyContent: "center", fontSize: "0.80rem", padding: "9px 12px" }}
          >
            <Printer size={15} />
            <span>Imprimir Directo</span>
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
              <span>Compartir</span>
            </button>
          )}

          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            style={{ flex: 1, justifyContent: "center", fontSize: "0.82rem", padding: "8px 12px" }}
          >
            <X size={15} />
            <span>Cerrar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
