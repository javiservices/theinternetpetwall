import React from "react";
import { Sparkles, Grid, ArrowRight } from "lucide-react";
import { PetCard } from "../PetCard";
import { useTranslation } from "../../i18n/LanguageContext";

export function RecentPetsSection({ pets, onSelectPet, onGiveTreat, onNavigateToWall }) {
  const { t } = useTranslation();

  // Get most recent pets (first 4 in array)
  const recentPets = pets.slice(0, 4);

  return (
    <section className="home-sub-section" style={{ background: "var(--bg-surface)", padding: "64px 0" }}>
      <div className="container">
        <div className="section-header-flex">
          <div>
            <div className="section-tag" style={{ background: "#DBEAFE", color: "#1D4ED8" }}>
              <Sparkles size={14} />
              <span>{t("recent_badge")}</span>
            </div>
            <h2 className="section-title">{t("recent_title")}</h2>
            <p className="section-description">{t("recent_desc")}</p>
          </div>

          <button className="btn-secondary" onClick={onNavigateToWall} style={{ alignSelf: "flex-end" }}>
            <span>{t("wall_banner_btn")}</span>
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="home-cards-grid" style={{ marginBottom: "56px" }}>
          {recentPets.map((pet) => (
            <PetCard
              key={`recent-${pet.id}`}
              pet={pet}
              onSelectPet={onSelectPet}
              onGiveTreat={onGiveTreat}
            />
          ))}
        </div>

        {/* Big Interactive Banner to Enter the Full Wall */}
        <div className="full-wall-cta-banner">
          <div className="cta-banner-content">
            <div className="cta-banner-icon">
              <Grid size={32} />
            </div>
            <div>
              <h3 className="cta-banner-title">{t("wall_banner_title")}</h3>
              <p className="cta-banner-desc">{t("wall_banner_desc")}</p>
            </div>
          </div>
          <button
            className="btn-primary"
            onClick={onNavigateToWall}
            style={{ padding: "14px 28px", fontSize: "1rem", whiteSpace: "nowrap" }}
          >
            <span>{t("wall_banner_btn")}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
