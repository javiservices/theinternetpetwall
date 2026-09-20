import React from "react";
import { Star, Bone, Clock } from "lucide-react";
import { launchTreatSparkle } from "../utils/confetti";
import { useTranslation } from "../i18n/LanguageContext";
import { parsePetLocation } from "../data/worldLocations";
import { useTreatCooldown } from "../utils/treatCooldown";

export function PetCard({ pet, onSelectPet, onGiveTreat }) {
  const { t } = useTranslation();
  const [isQuoteExpanded, setIsQuoteExpanded] = React.useState(false);
  const locationInfo = parsePetLocation(pet.city, pet);
  const isLongQuote = Boolean(pet.quote && pet.quote.length > 70);
  const { isCooldown, formattedTime } = useTreatCooldown(pet?.id);

  const handleQuickTreat = (e) => {
    e.stopPropagation();
    if (isCooldown) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;
    launchTreatSparkle(x, y);
    onGiveTreat(pet.id);
  };

  return (
    <article
      className={`pet-card ${pet.isVip ? "is-vip" : ""} ${pet.isMemorial ? "card-memorial" : ""}`}
      onClick={() => onSelectPet(pet)}
      id={`pet-card-${pet.id}`}
      tabIndex={0}
      role="button"
      aria-label={`${t("discover_view_details")} ${pet.name}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelectPet(pet);
        }
      }}
    >
      <div className="card-image-wrap">
        <img
          src={pet.photoUrl}
          alt={pet.name}
          className="card-img"
          loading="lazy"
        />

        {/* Top-Left Code Tag (single badge, never stacked or cluttering the face) */}
        <div className={`card-code-tag ${pet.isMemorial ? "card-code-memorial" : ""}`}>
          {pet.isMemorial ? `🌈 ${pet.code}` : pet.code}
        </div>

        {pet.isVip && (
          <div className="card-vip-badge">
            <Star size={11} fill="#FFFFFF" />
            <span>VIP</span>
          </div>
        )}

        <button
          className={`card-treat-btn-quick ${isCooldown ? "is-cooldown" : ""}`}
          onClick={handleQuickTreat}
          disabled={isCooldown}
          title={
            isCooldown
              ? `${t("cooldown_available_in")}: ${formattedTime}`
              : pet.isMemorial
              ? t("memorial_send_light")
              : t("give_treat")
          }
          aria-label={
            isCooldown
              ? `${t("cooldown_available_in")}: ${formattedTime}`
              : `${pet.isMemorial ? t("memorial_send_light") : t("give_treat")} ${pet.name}`
          }
        >
          {isCooldown ? (
            <>
              <Clock size={12} className="cooldown-clock-icon" />
              <span className="cooldown-digits">{formattedTime}</span>
            </>
          ) : (
            <>
              <Bone size={13} color="#D97706" />
              <span>{pet.treats || 0}</span>
            </>
          )}
        </button>
      </div>

      <div className="card-body">
        <div className="card-header">
          <h3 className="card-name">
            {pet.name} {pet.isMemorial && <span style={{ fontSize: "0.8em" }}>🕊️</span>}
          </h3>
        </div>

        <p className="card-breed">
          {pet.breed} {pet.isMemorial && <span style={{ color: "#6366F1", fontWeight: 600 }}>{t("memorial_badge_card")}</span>}
        </p>

        {pet.quote && (
          <div className="card-quote-container">
            <p className={`card-quote ${isQuoteExpanded ? "expanded" : ""}`}>
              “{pet.quote}”
            </p>
            {isLongQuote && (
              <button
                type="button"
                className="card-quote-toggle"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsQuoteExpanded((prev) => !prev);
                }}
                aria-expanded={isQuoteExpanded}
              >
                {isQuoteExpanded ? t("read_less") : t("read_more")}
              </button>
            )}
          </div>
        )}

        <div className="card-footer">
          <div className="card-city" title={locationInfo.fullLabel}>
            <span style={{ fontSize: "13px", lineHeight: 1 }}>{locationInfo.flag}</span>
            <span>{locationInfo.displayLocation}</span>
          </div>
          <span>{pet.date}</span>
        </div>
      </div>
    </article>
  );
}
