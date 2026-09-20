import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Shield,
  FileText,
  Cookie,
  Scale,
  ArrowLeft,
  Printer,
  Sparkles,
  Sliders,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { LEGAL_TEXTS } from "./legalTexts";
import { reopenCookieConsent } from "../CookieBanner/CookieBanner";
import { useTranslation } from "../../i18n/LanguageContext";

export function LegalPageView({ type = "privacy" }) {
  const navigate = useNavigate();
  const { t, language } = useTranslation();

  // Scroll to top on mount or route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [type]);

  const langKey = LEGAL_TEXTS[language] ? language : "es";
  const currentDoc = (LEGAL_TEXTS[langKey] && LEGAL_TEXTS[langKey][type]) || LEGAL_TEXTS.es[type] || LEGAL_TEXTS.es.privacy;

  const legalNavItems = [
    { id: "privacy", path: "/privacy", label: t("legal_nav_privacy"), icon: Shield, badge: "RGPD" },
    { id: "terms", path: "/terms", label: t("legal_nav_terms"), icon: FileText, badge: "TRLGDCU" },
    { id: "cookies", path: "/cookies", label: t("legal_nav_cookies"), icon: Cookie, badge: "LSSI-CE" },
    { id: "legal", path: "/legal", label: t("legal_nav_notice"), icon: Scale, badge: "Legal" },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="legal-page-layout">
      {/* Top Breadcrumb & Back Bar */}
      <div className="legal-page-topbar">
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <button
            type="button"
            className="legal-page-back-btn"
            onClick={() => navigate("/wall")}
          >
            <ArrowLeft size={16} />
            <span>{t("legal_back_wall")}</span>
          </button>

          <div className="legal-page-breadcrumbs">
            <Link to="/" className="legal-crumb-link">{t("nav_home")}</Link>
            <span className="legal-crumb-sep">/</span>
            <span className="legal-crumb-current">{currentDoc.title}</span>
          </div>

          <button
            type="button"
            className="btn-secondary legal-page-print-btn"
            onClick={handlePrint}
            title={t("legal_print_title")}
          >
            <Printer size={14} />
            <span>{t("legal_print")}</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="container" style={{ padding: "40px 16px 80px" }}>
        {/* Navigation Tabs Bar */}
        <nav className="legal-page-nav-bar" aria-label="Navegación legal">
          {legalNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = type === item.id;
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`legal-page-nav-link ${isActive ? "active" : ""}`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
                <span className="legal-page-nav-pill">{item.badge}</span>
              </Link>
            );
          })}
        </nav>

        {/* Hero Section */}
        <header className="legal-page-hero">
          <div className="legal-page-hero-meta">
            <span className="legal-page-badge">{currentDoc.badge}</span>
            <span className="legal-page-date">{t("legal_last_updated")} {currentDoc.lastUpdated}</span>
          </div>
          <h1 className="legal-page-title">{currentDoc.title}</h1>
          <p className="legal-page-subtitle">{currentDoc.subtitle}</p>
        </header>

        {/* SPECIAL VISUAL HERO FOR COOKIES PAGE: Cute Puppy Eating Cookie */}
        {type === "cookies" && (
          <div className="cookie-puppy-showcase-card">
            <div className="cookie-puppy-img-col">
              <img
                src="/images/cookie-puppy.jpg"
                alt={t("cookie_hero_img_alt")}
                className="cookie-puppy-hero-img"
              />
            </div>
            <div className="cookie-puppy-info-col">
              <div className="cookie-puppy-badge">
                <span>{t("cookie_hero_badge")}</span>
              </div>
              <h2 className="cookie-puppy-heading">
                {t("cookie_hero_heading")}
              </h2>
              <p className="cookie-puppy-text">
                {t("cookie_hero_text")}
              </p>
              <div className="cookie-puppy-actions">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={reopenCookieConsent}
                  id="open-cookie-settings-hero-btn"
                  style={{ gap: "8px" }}
                >
                  <Sliders size={16} />
                  <span>{t("cookie_hero_btn")}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Document Content Sections */}
        <main className="legal-page-main-card">
          {currentDoc.sections.map((sec, idx) => (
            <article key={idx} className="legal-page-section">
              <h2 className="legal-page-section-title">{sec.heading}</h2>
              <div className="legal-page-section-body">
                {sec.content.split("\n\n").map((para, pIdx) => {
                  const trimmed = para.trim();
                  if (!trimmed) return null;

                  // Blockquote
                  if (trimmed.startsWith(">")) {
                    return (
                      <blockquote key={pIdx} className="legal-page-blockquote">
                        {trimmed.replace(/^>\s*/, "").replace(/^"|"$/g, "")}
                      </blockquote>
                    );
                  }

                  // Bullet List
                  if (trimmed.startsWith("- ")) {
                    const items = trimmed.split("\n- ").map((item) => item.replace(/^- /, ""));
                    return (
                      <ul key={pIdx} className="legal-page-list">
                        {items.map((it, iIdx) => (
                          <li key={iIdx} dangerouslySetInnerHTML={{ __html: formatMarkdown(it) }} />
                        ))}
                      </ul>
                    );
                  }

                  // Ordered List
                  if (/^\d+\.\s/.test(trimmed)) {
                    const items = trimmed.split(/\n\d+\.\s/).filter(Boolean);
                    return (
                      <ol key={pIdx} className="legal-page-ordered-list">
                        {items.map((it, iIdx) => (
                          <li key={iIdx} dangerouslySetInnerHTML={{ __html: formatMarkdown(it) }} />
                        ))}
                      </ol>
                    );
                  }

                  // Table support
                  if (trimmed.includes("|")) {
                    return (
                      <div key={pIdx} className="legal-table-wrap">
                        {renderTable(trimmed)}
                      </div>
                    );
                  }

                  // Default Paragraph
                  return (
                    <p
                      key={pIdx}
                      className="legal-page-paragraph"
                      dangerouslySetInnerHTML={{ __html: formatMarkdown(trimmed) }}
                    />
                  );
                })}
              </div>
            </article>
          ))}

          {/* Bottom Card Footer */}
          <footer className="legal-page-footer-strip">
            <div className="legal-page-footer-text">
              <CheckCircle size={18} color="#10B981" />
              <span>
                {t("legal_footer_guarantee")}
              </span>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <button
                type="button"
                className="btn-primary"
                onClick={() => navigate("/wall")}
                style={{ padding: "10px 20px" }}
              >
                <Sparkles size={16} />
                <span>{t("legal_explore_wall")}</span>
              </button>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

// Markdown formatting helper
function formatMarkdown(text) {
  if (!text) return "";
  let formatted = text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code class='legal-code'>$1</code>")
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="legal-link">$1</a>');
  return formatted;
}

// Simple markdown table parser
function renderTable(tableText) {
  const lines = tableText.trim().split("\n");
  if (lines.length < 3) return null;

  const headerCols = lines[0].split("|").map((c) => c.trim()).filter(Boolean);
  const rows = lines.slice(2).map((line) =>
    line.split("|").map((c) => c.trim()).filter(Boolean)
  );

  return (
    <table className="legal-table">
      <thead>
        <tr>
          {headerCols.map((col, idx) => (
            <th key={idx}>{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rIdx) => (
          <tr key={rIdx}>
            {row.map((cell, cIdx) => (
              <td key={cIdx} dangerouslySetInnerHTML={{ __html: formatMarkdown(cell) }} />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
