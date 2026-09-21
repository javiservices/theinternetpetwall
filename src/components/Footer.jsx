import React from "react";
import { Link } from "react-router-dom";
import { Heart, ShieldCheck, Sparkles, Shield, Cookie } from "lucide-react";
import { useTranslation } from "../i18n/LanguageContext";
import { reopenCookieConsent } from "./CookieBanner/CookieBanner";

export function Footer({ onOpenAddPet, onOpenLegal }) {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="container">
        {/* Quick FAQ Strip */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
            marginBottom: "48px",
            paddingBottom: "36px",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <div>
            <h4 style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: "var(--font-heading)", fontSize: "1.05rem", marginBottom: "8px", color: "var(--text-primary)" }}>
              <ShieldCheck size={18} color="#10B981" />
              <span>{t("faq1_q")}</span>
            </h4>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              {t("faq1_a")}
            </p>
          </div>

          <div>
            <h4 style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: "var(--font-heading)", fontSize: "1.05rem", marginBottom: "8px", color: "var(--text-primary)" }}>
              <Sparkles size={18} color="#D97706" />
              <span>{t("faq2_q")}</span>
            </h4>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              {t("faq2_a")}
            </p>
          </div>

          <div>
            <h4 style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: "var(--font-heading)", fontSize: "1.05rem", marginBottom: "8px", color: "var(--text-primary)" }}>
              <Heart size={18} color="#E11D48" />
              <span>{t("faq3_q")}</span>
            </h4>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              {t("faq3_a")}
            </p>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-inner">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "10px",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 3px 10px rgba(245, 158, 11, 0.3)",
                flexShrink: 0,
              }}
            >
              <img
                src="/images/logo.png"
                alt="The Internet Pet Wall"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div>
              <p style={{ fontWeight: 800, fontFamily: "var(--font-heading)", fontSize: "1.05rem" }}>
                The Internet Pet Wall
              </p>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                {t("footer_tagline")}
              </p>
            </div>
          </div>

          <div>
            <button className="btn-primary" onClick={onOpenAddPet} style={{ fontSize: "0.88rem", padding: "10px 18px" }}>
              <Sparkles size={15} />
              <span>{t("nav_cta")}</span>
            </button>
          </div>
        </div>

        {/* Legal Links Bar */}
        <div className="footer-legal-bar">
          <nav className="footer-legal-nav" aria-label="Enlaces Legales">
            <Link to="/privacy" className="footer-legal-btn">
              {t("legal_nav_privacy")}
            </Link>
            <span className="footer-legal-bullet">•</span>
            <Link to="/terms" className="footer-legal-btn">
              {t("legal_nav_terms")}
            </Link>
            <span className="footer-legal-bullet">•</span>
            <Link to="/cookies" className="footer-legal-btn">
              {t("legal_nav_cookies")}
            </Link>
            <span className="footer-legal-bullet">•</span>
            <Link to="/legal" className="footer-legal-btn">
              {t("legal_nav_notice")}
            </Link>
            <span className="footer-legal-bullet">•</span>
            <button
              type="button"
              className="footer-legal-btn footer-cookie-settings-btn"
              onClick={reopenCookieConsent}
              title={t("cookie_settings_tooltip")}
            >
              <Cookie size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
              <span>{t("cookie_settings_btn")}</span>
            </button>
          </nav>
        </div>

        <div className="footer-bottom" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <p>{t("footer_copy")}</p>
          <Link
            to="/admin"
            style={{
              fontSize: "0.76rem",
              color: "var(--text-muted)",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              opacity: 0.65,
              transition: "opacity var(--transition-fast)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.65")}
            title={t("footer_admin_tooltip")}
          >
            <Shield size={12} />
            <span>{t("footer_admin_access")}</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
