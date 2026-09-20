import React, { useState, useEffect } from "react";
import { X, Shield, FileText, Cookie, Scale, ExternalLink, Printer, Check } from "lucide-react";
import { LEGAL_TEXTS } from "./legalTexts";
import { useTranslation } from "../../i18n/LanguageContext";

export function LegalModal({ initialTab = "privacy", onClose }) {
  const { t, language } = useTranslation();
  const [activeTab, setActiveTab] = useState(initialTab || "privacy");

  useEffect(() => {
    if (initialTab && (LEGAL_TEXTS.es[initialTab] || LEGAL_TEXTS[initialTab])) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Prevent background scrolling while modal is open
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const langKey = LEGAL_TEXTS[language] ? language : "es";
  const currentDoc = (LEGAL_TEXTS[langKey] && LEGAL_TEXTS[langKey][activeTab]) || LEGAL_TEXTS.es[activeTab] || LEGAL_TEXTS.es.privacy;

  const handlePrint = () => {
    window.print();
  };

  const tabs = [
    { id: "privacy", label: t("legal_tab_privacy"), icon: Shield, badge: "RGPD" },
    { id: "terms", label: t("legal_tab_terms"), icon: FileText, badge: "TRLGDCU" },
    { id: "cookies", label: t("legal_tab_cookies"), icon: Cookie, badge: "LSSI" },
    { id: "legal", label: t("legal_tab_notice"), icon: Scale, badge: "Legal" },
  ];

  return (
    <div
      className="modal-overlay legal-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={currentDoc.title}
    >
      <div className="modal-content legal-modal-content">
        {/* Modal Header */}
        <div className="legal-modal-header">
          <div className="legal-header-info">
            <div className="legal-header-icon-wrap">
              <Shield size={20} color="#F59E0B" />
            </div>
            <div>
              <h2 className="legal-header-title">{t("legal_modal_title")}</h2>
              <p className="legal-header-subtitle">YourPixel • The Internet Pet Wall</p>
            </div>
          </div>

          <button
            type="button"
            className="modal-close-btn legal-close-btn"
            onClick={onClose}
            aria-label={t("legal_modal_close")}
            title="Cerrar (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation Bar (Scrollable on mobile) */}
        <div className="legal-tab-bar" role="tablist">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`legal-tab-btn ${isActive ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={15} />
                <span className="legal-tab-text">{tab.label}</span>
                <span className="legal-tab-badge">{tab.badge}</span>
              </button>
            );
          })}
        </div>

        {/* Document Body */}
        <div className="legal-doc-body">
          <header className="legal-doc-hero">
            <div className="legal-doc-badge-row">
              <span className="legal-doc-pill">{currentDoc.badge}</span>
              <span className="legal-doc-date">{t("legal_last_updated")} {currentDoc.lastUpdated}</span>
            </div>
            <h1 className="legal-doc-title">{currentDoc.title}</h1>
            <p className="legal-doc-desc">{currentDoc.subtitle}</p>
          </header>

          <div className="legal-doc-content">
            {currentDoc.sections.map((sec, idx) => (
              <article key={idx} className="legal-doc-section">
                <h3 className="legal-section-heading">{sec.heading}</h3>
                <div className="legal-section-text">
                  {sec.content.split("\n\n").map((para, pIdx) => {
                    const trimmed = para.trim();
                    if (!trimmed) return null;

                    // Render blockquote if starts with >
                    if (trimmed.startsWith(">")) {
                      return (
                        <blockquote key={pIdx} className="legal-blockquote">
                          {trimmed.replace(/^>\s*/, "").replace(/^"|"$/g, "")}
                        </blockquote>
                      );
                    }

                    // Render list if starts with -
                    if (trimmed.startsWith("- ")) {
                      const items = trimmed.split("\n- ").map((item) => item.replace(/^- /, ""));
                      return (
                        <ul key={pIdx} className="legal-list">
                          {items.map((it, iIdx) => (
                            <li key={iIdx} dangerouslySetInnerHTML={{ __html: formatMarkdown(it) }} />
                          ))}
                        </ul>
                      );
                    }

                    // Render numbered list if starts with 1.
                    if (/^\d+\.\s/.test(trimmed)) {
                      const items = trimmed.split(/\n\d+\.\s/).filter(Boolean);
                      return (
                        <ol key={pIdx} className="legal-ordered-list">
                          {items.map((it, iIdx) => (
                            <li key={iIdx} dangerouslySetInnerHTML={{ __html: formatMarkdown(it) }} />
                          ))}
                        </ol>
                      );
                    }

                    // Default paragraph
                    return (
                      <p
                        key={pIdx}
                        className="legal-para"
                        dangerouslySetInnerHTML={{ __html: formatMarkdown(trimmed) }}
                      />
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="legal-modal-footer">
          <div className="legal-footer-contact">
            <span>¿Tienes dudas legales? Escríbenos a </span>
            <a href="mailto:privacidad@yourpixel.org" className="legal-footer-email">
              privacidad@yourpixel.org
            </a>
          </div>

          <div className="legal-footer-actions">
            <button
              type="button"
              className="btn-secondary legal-print-btn"
              onClick={handlePrint}
              title="Imprimir o guardar como PDF"
            >
              <Printer size={14} />
              <span>Imprimir</span>
            </button>

            <button
              type="button"
              className="btn-primary legal-understood-btn"
              onClick={onClose}
            >
              <Check size={15} />
              <span>Entendido y Cerrar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple markdown formatter helper for bold, italics, code and links
function formatMarkdown(text) {
  if (!text) return "";
  let formatted = text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code class='legal-code'>$1</code>")
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="legal-link">$1</a>');
  return formatted;
}
