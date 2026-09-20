import React from "react";
import { Sparkles, Compass } from "lucide-react";
import { useTranslation } from "../i18n/LanguageContext";

export function Hero({ totalPets, totalTreats, totalCountries = 0, onOpenAddPet, onNavigateToWall }) {
  const { t } = useTranslation();

  return (
    <section className="hero">
      <div className="container">
        <div className="hero-tag">
          <span>{t("hero_tag")}</span>
        </div>

        <h1 className="hero-title">
          {t("hero_title_1")}{" "}
          <span className="hero-title-highlight">{t("hero_title_highlight")}</span>
        </h1>

        <p className="hero-description">{t("hero_desc")}</p>

        {/* Charity Cause Pill */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 16px", borderRadius: "var(--radius-full)", background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.25)", color: "#059669", fontSize: "0.82rem", fontWeight: 700, marginBottom: "28px" }}>
          <span>🐾 1 Inscripción = 1 Huella de Ayuda · 20% donado a protectoras de animales</span>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginBottom: "36px", flexWrap: "wrap" }}>
          <button
            className="btn-primary"
            onClick={onOpenAddPet}
            id="hero-add-pet-btn"
            style={{ padding: "14px 28px", fontSize: "1.05rem" }}
          >
            <Sparkles size={18} />
            <span>{t("hero_cta_add")}</span>
          </button>
          
          <button
            className="btn-secondary"
            onClick={onNavigateToWall}
            id="hero-explore-btn"
            style={{ padding: "14px 24px", fontSize: "1rem" }}
          >
            <Compass size={18} />
            <span>{t("hero_cta_explore")}</span>
          </button>
        </div>

        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-value">{totalPets}</span>
            <span className="stat-label">{t("stat_registered")}</span>
          </div>

          <div className="stat-divider" />

          <div className="stat-item">
            <span className="stat-value">🦴 {totalTreats}</span>
            <span className="stat-label">{t("stat_treats")}</span>
          </div>

          <div className="stat-divider" />

          <div className="stat-item">
            <span className="stat-value">🌍 {totalCountries}</span>
            <span className="stat-label">{t("stat_countries")}</span>
          </div>

          <div className="stat-divider" />

          <div className="stat-item">
            <span className="stat-value" style={{ color: "#10B981" }}>100%</span>
            <span className="stat-label">{t("stat_love")}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
