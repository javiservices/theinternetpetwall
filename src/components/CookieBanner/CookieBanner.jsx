import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Settings, Check, X, ChevronRight, Sliders, Cookie } from "lucide-react";
import { useTranslation } from "../../i18n/LanguageContext";

const STORAGE_KEY = "pet_wall_cookie_consent_v1";

export function CookieBanner() {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Preference switches
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true and locked
    personalization: true, // Language and dark mode
    analytics: false, // Performance/analytics
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        // Delay slightly for smooth page entry
        const timer = setTimeout(() => setIsVisible(true), 600);
        return () => clearTimeout(timer);
      } else {
        const parsed = JSON.parse(saved);
        if (parsed) {
          setPreferences({
            necessary: true,
            personalization: Boolean(parsed.personalization),
            analytics: Boolean(parsed.analytics),
          });
        }
      }
    } catch {
      setIsVisible(true);
    }

    // Listen to custom event to re-open settings anytime from footer or cookies page
    const handleReopen = () => {
      setShowConfigModal(true);
    };

    window.addEventListener("open-cookie-settings", handleReopen);
    return () => window.removeEventListener("open-cookie-settings", handleReopen);
  }, []);

  const saveConsent = (consentObj) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          ...consentObj,
          timestamp: Date.now(),
        })
      );
    } catch (e) {
      console.warn("Could not save cookie consent:", e);
    }
    setIsVisible(false);
    setShowConfigModal(false);
  };

  const handleAcceptAll = () => {
    const fullConsent = { necessary: true, personalization: true, analytics: true };
    setPreferences(fullConsent);
    saveConsent(fullConsent);
  };

  const handleRejectNonEssential = () => {
    const minimalConsent = { necessary: true, personalization: false, analytics: false };
    setPreferences(minimalConsent);
    saveConsent(minimalConsent);
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
  };

  if (!isVisible && !showConfigModal) return null;

  return (
    <>
      {/* 1. Main Bottom Cookie Banner */}
      {isVisible && !showConfigModal && (
        <aside
          className="cookie-banner-wrap"
          role="region"
          aria-label={t("cookie_modal_title")}
        >
          <div className="cookie-banner-card">
            {/* Cute Puppy Eating Cookie Avatar */}
            <div className="cookie-banner-avatar-col">
              <img
                src="/images/cookie-puppy.jpg"
                alt={t("cookie_puppy_alt")}
                className="cookie-puppy-img"
              />
            </div>

            {/* Banner Content */}
            <div className="cookie-banner-content">
              <div className="cookie-banner-header">
                <span className="cookie-banner-tag">
                  <Cookie size={13} />
                  <span>{t("cookie_banner_tag")}</span>
                </span>
                <h3 className="cookie-banner-title">
                  {t("cookie_banner_title")}
                </h3>
              </div>

              <p className="cookie-banner-desc">
                {t("cookie_banner_desc")}{" "}
                <Link to="/cookies" className="cookie-banner-link">
                  {t("cookie_banner_link_text")}
                </Link>
                .
              </p>

              {/* Action Buttons */}
              <div className="cookie-banner-actions">
                <button
                  type="button"
                  className="btn-primary cookie-btn-accept"
                  onClick={handleAcceptAll}
                  id="accept-all-cookies-btn"
                >
                  <Check size={16} />
                  <span>{t("cookie_btn_accept_all")}</span>
                </button>

                <button
                  type="button"
                  className="btn-secondary cookie-btn-reject"
                  onClick={handleRejectNonEssential}
                  id="reject-cookies-btn"
                >
                  <span>{t("cookie_btn_necessary_only")}</span>
                </button>

                <button
                  type="button"
                  className="btn-text cookie-btn-config"
                  onClick={() => setShowConfigModal(true)}
                  id="config-cookies-btn"
                >
                  <Sliders size={14} />
                  <span>{t("cookie_btn_customize")}</span>
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* 2. Preferences Configuration Modal */}
      {showConfigModal && (
        <div
          className="modal-overlay cookie-config-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowConfigModal(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-label={t("cookie_modal_title")}
        >
          <div className="modal-content cookie-config-modal">
            {/* Modal Header */}
            <div className="cookie-config-header">
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <img
                  src="/images/cookie-puppy.jpg"
                  alt={t("cookie_puppy_alt")}
                  className="cookie-config-header-img"
                />
                <div>
                  <h3 className="cookie-config-title">{t("cookie_modal_title")}</h3>
                  <p className="cookie-config-sub">
                    {t("cookie_modal_sub")}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowConfigModal(false)}
                aria-label={t("cookie_modal_close")}
              >
                <X size={18} />
              </button>
            </div>

            {/* Cookie Categories List */}
            <div className="cookie-config-body">
              {/* Category 1: Strictly Necessary */}
              <div className="cookie-cat-item">
                <div className="cookie-cat-header">
                  <div className="cookie-cat-title-wrap">
                    <span className="cookie-cat-name">{t("cookie_cat_tech_title")}</span>
                    <span className="cookie-cat-badge always-active">{t("cookie_cat_tech_badge")}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={true}
                    disabled={true}
                    className="cookie-switch-input"
                    aria-label={t("cookie_cat_tech_badge")}
                  />
                </div>
                <p className="cookie-cat-desc">
                  {t("cookie_cat_tech_desc")}
                </p>
              </div>

              {/* Category 2: Preferences */}
              <div className="cookie-cat-item">
                <div className="cookie-cat-header">
                  <div className="cookie-cat-title-wrap">
                    <span className="cookie-cat-name">{t("cookie_cat_pref_title")}</span>
                    <span className="cookie-cat-badge optional">{t("cookie_cat_pref_badge")}</span>
                  </div>
                  <label className="cookie-toggle-label">
                    <input
                      type="checkbox"
                      checked={preferences.personalization}
                      onChange={(e) =>
                        setPreferences((prev) => ({ ...prev, personalization: e.target.checked }))
                      }
                      className="cookie-switch-input"
                    />
                    <span className="cookie-toggle-slider"></span>
                  </label>
                </div>
                <p className="cookie-cat-desc">
                  {t("cookie_cat_pref_desc")}
                </p>
              </div>

              {/* Category 3: Analytics */}
              <div className="cookie-cat-item">
                <div className="cookie-cat-header">
                  <div className="cookie-cat-title-wrap">
                    <span className="cookie-cat-name">{t("cookie_cat_analytics_title")}</span>
                    <span className="cookie-cat-badge optional">{t("cookie_cat_pref_badge")}</span>
                  </div>
                  <label className="cookie-toggle-label">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) =>
                        setPreferences((prev) => ({ ...prev, analytics: e.target.checked }))
                      }
                      className="cookie-switch-input"
                    />
                    <span className="cookie-toggle-slider"></span>
                  </label>
                </div>
                <p className="cookie-cat-desc">
                  {t("cookie_cat_analytics_desc")}
                </p>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="cookie-config-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleRejectNonEssential}
              >
                {t("cookie_btn_reject_optional")}
              </button>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleSavePreferences}
                >
                  {t("cookie_btn_save_prefs")}
                </button>

                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleAcceptAll}
                >
                  <Check size={16} />
                  <span>{t("cookie_btn_accept_all")}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Helper to trigger reopening the cookie settings modal from anywhere in the app
export function reopenCookieConsent() {
  window.dispatchEvent(new CustomEvent("open-cookie-settings"));
}
