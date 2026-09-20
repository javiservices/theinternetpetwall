import React from "react";
import { Crown, Sparkles, ArrowRight } from "lucide-react";
import { PetCard } from "../PetCard";
import { useTranslation } from "../../i18n/LanguageContext";

export function TopPetsSection({ pets, onSelectPet, onGiveTreat, onNavigateToWall }) {
  const { t } = useTranslation();

  // Get top pets by treats or VIP
  const topPets = [...pets]
    .sort((a, b) => {
      if (a.isVip && !b.isVip) return -1;
      if (!a.isVip && b.isVip) return 1;
      return (b.treats || 0) - (a.treats || 0);
    })
    .slice(0, 4);

  return (
    <section className="home-sub-section">
      <div className="container">
        <div className="section-header-flex">
          <div>
            <div className="section-tag" style={{ background: "#FEF3C7", color: "#B45309" }}>
              <Crown size={14} />
              <span>{t("top_badge")}</span>
            </div>
            <h2 className="section-title">{t("top_title")}</h2>
            <p className="section-description">{t("top_desc")}</p>
          </div>

          <button className="btn-secondary" onClick={onNavigateToWall} style={{ alignSelf: "flex-end" }}>
            <span>{t("wall_banner_btn")}</span>
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="home-cards-grid">
          {topPets.map((pet) => (
            <PetCard
              key={`top-${pet.id}`}
              pet={pet}
              onSelectPet={onSelectPet}
              onGiveTreat={onGiveTreat}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
