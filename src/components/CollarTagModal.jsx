import React, { useState, useEffect, useRef } from "react";
import { X, Printer, Download } from "lucide-react";
import QRCode from "qrcode";
import { parsePetLocation } from "../data/worldLocations";
import { useTranslation } from "../i18n/LanguageContext";

export function CollarTagModal({ pet, onClose }) {
  const { t } = useTranslation();
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [tagShape, setTagShape] = useState("circle"); // 'circle' | 'rectangle'
  const tagRef = useRef(null);

  const loc = pet ? parsePetLocation(pet.city, pet) : null;
  const petUrl = pet ? `${window.location.origin}/wall?pet=${pet.code}` : "";

  useEffect(() => {
    if (!petUrl) return;
    QRCode.toDataURL(petUrl, {
      width: 300,
      margin: 1,
      color: { dark: "#18181B", light: "#FFFFFF" },
    }).then(setQrDataUrl);
  }, [petUrl]);

  if (!pet) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 2300 }}>
      <div
        className="modal-content"
        style={{ maxWidth: "520px", textAlign: "center", padding: "28px 24px" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        <div className="modal-drag-indicator mobile-only" aria-hidden="true">
          <div className="modal-drag-bar" />
        </div>

        <button className="modal-close-btn" onClick={onClose} aria-label={t("close_modal")}>
          <X size={18} />
        </button>

        <div style={{ marginBottom: "18px", padding: "0 36px" }}>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 800, fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}>
            {t("collar_modal_title")}
          </h3>
          <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: "4px" }}>
            {t("collar_modal_desc")}
          </p>
        </div>

        {/* Shape selector */}
        <div style={{ display: "inline-flex", gap: "8px", background: "var(--bg-subtle)", padding: "4px", borderRadius: "var(--radius-full)", marginBottom: "20px" }}>
          <button
            className={`btn-secondary ${tagShape === "circle" ? "active" : ""}`}
            style={{
              padding: "6px 14px",
              fontSize: "0.78rem",
              borderRadius: "var(--radius-full)",
              background: tagShape === "circle" ? "var(--bg-surface)" : "transparent",
              border: tagShape === "circle" ? "1px solid var(--border-subtle)" : "none",
              fontWeight: 700,
            }}
            onClick={() => setTagShape("circle")}
          >
            {t("collar_shape_circle")}
          </button>
          <button
            className={`btn-secondary ${tagShape === "rectangle" ? "active" : ""}`}
            style={{
              padding: "6px 14px",
              fontSize: "0.78rem",
              borderRadius: "var(--radius-full)",
              background: tagShape === "rectangle" ? "var(--bg-surface)" : "transparent",
              border: tagShape === "rectangle" ? "1px solid var(--border-subtle)" : "none",
              fontWeight: 700,
            }}
            onClick={() => setTagShape("rectangle")}
          >
            {t("collar_shape_rect")}
          </button>
        </div>

        {/* Printable Physical Tag Preview */}
        <div
          ref={tagRef}
          id="printable-collar-tag"
          style={{
            margin: "0 auto 24px",
            width: tagShape === "circle" ? "280px" : "320px",
            height: tagShape === "circle" ? "280px" : "200px",
            borderRadius: tagShape === "circle" ? "50%" : "20px",
            border: "4px solid #D97706",
            background: "#FFFFFF",
            boxShadow: "0 8px 24px rgba(217, 119, 6, 0.18)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            position: "relative",
            color: "#18181B",
          }}
        >
          {/* Hole ring punch indicator for collar ring */}
          <div
            style={{
              position: "absolute",
              top: "10px",
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: "#E5E7EB",
              border: "2px solid #9CA3AF",
            }}
          />

          <div style={{ marginTop: "10px", textAlign: "center" }}>
            <span style={{ fontSize: "1.15rem", fontWeight: 800, fontFamily: "var(--font-heading)", display: "block", color: "#18181B", lineHeight: 1.1 }}>
              {pet.name} {loc.flag}
            </span>
            <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#D97706", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              {pet.code}
            </span>
          </div>

          {/* QR Code */}
          {qrDataUrl && (
            <div style={{ width: "96px", height: "96px", margin: "8px 0" }}>
              <img
                src={qrDataUrl}
                alt="QR Code"
                style={{ width: "100%", height: "100%", display: "block" }}
              />
            </div>
          )}

          <div style={{ textAlign: "center" }}>
            <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#4B5563", display: "block" }}>
              {t("collar_scan_hint")}
            </span>
            <span style={{ fontSize: "0.6rem", color: "#9CA3AF" }}>
              The Internet Pet Wall
            </span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            className="btn-primary"
            onClick={handlePrint}
            style={{ flex: 1, minWidth: "140px", justifyContent: "center" }}
          >
            <Printer size={16} />
            <span>{t("collar_print_btn")}</span>
          </button>

          <button
            className="btn-secondary"
            onClick={() => {
              if (qrDataUrl) {
                const a = document.createElement("a");
                a.href = qrDataUrl;
                a.download = `QR_${pet.name}_${pet.code}.png`;
                a.click();
              }
            }}
            style={{ flex: 1, minWidth: "140px", justifyContent: "center" }}
          >
            <Download size={16} />
            <span>{t("collar_download_btn")}</span>
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
