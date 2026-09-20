import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bone, ArrowRight, Bookmark, Award, Sparkles, Star, ChevronLeft, ChevronRight, Share2, Clock } from "lucide-react";
import { launchTreatSparkle } from "../utils/confetti";
import { playTreatSound } from "../utils/soundEffects";
import { parsePetLocation } from "../data/worldLocations";
import { getMyPetIds, saveMyPetId, removeMyPetId } from "../utils/storage";
import { useTranslation } from "../i18n/LanguageContext";
import { useTreatCooldown } from "../utils/treatCooldown";

export function DiscoverView({ pets, onGiveTreat, onSelectPet }) {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const total = pets.length;
  const currentPet = pets[currentIndex] || pets[0];
  const loc = currentPet ? parsePetLocation(currentPet.city, currentPet) : null;
  const { isCooldown, formattedTime } = useTreatCooldown(currentPet?.id);

  useEffect(() => {
    if (currentPet) {
      const myIds = getMyPetIds();
      setIsBookmarked(myIds.includes(currentPet.id));
    }
  }, [currentPet]);

  // Keyboard navigation: ArrowRight / Space = Treat, ArrowLeft = Next
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        handleTreat();
      } else if (e.key === "ArrowLeft") {
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, currentPet]);

  if (!currentPet) {
    return (
      <div className="container" style={{ padding: "80px 20px", textAlign: "center" }}>
        <h2>{t("discover_empty_title")}</h2>
        <Link to="/" className="btn-primary" style={{ marginTop: "16px", display: "inline-flex" }}>
          {t("discover_back_home")}
        </Link>
      </div>
    );
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  const handleTreat = (e) => {
    if (isCooldown) return;
    playTreatSound();
    launchTreatSparkle(0.5, 0.5);
    onGiveTreat(currentPet.id);
  };

  const handleToggleBookmark = () => {
    if (isBookmarked) {
      removeMyPetId(currentPet.id);
      setIsBookmarked(false);
    } else {
      saveMyPetId(currentPet.id);
      setIsBookmarked(true);
    }
  };

  return (
    <div style={{ minHeight: "85vh", padding: "40px 16px 80px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      {/* Top Banner */}
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "4px 14px",
            borderRadius: "var(--radius-full)",
            background: "rgba(245, 158, 11, 0.12)",
            color: "var(--accent-gold-dark)",
            fontSize: "0.82rem",
            fontWeight: 800,
            marginBottom: "8px",
          }}
        >
          <Sparkles size={14} />
          <span>{t("discover_badge")}</span>
        </div>
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          {t("discover_pet_progress")} {currentIndex + 1} {t("discover_of")} {total} · {t("discover_hint")}
        </p>
      </div>

      {/* Discovery Main Card */}
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          background: "var(--bg-surface)",
          borderRadius: "var(--radius-xl)",
          border: currentPet.isVip ? "2px solid #F59E0B" : "1px solid var(--border-subtle)",
          boxShadow: currentPet.isVip ? "0 20px 45px rgba(245, 158, 11, 0.2)" : "var(--shadow-xl)",
          overflow: "hidden",
          transition: "all var(--transition-normal)",
          position: "relative",
        }}
      >
        {/* Large Pet Image */}
        <div style={{ position: "relative", width: "100%", height: "420px", background: "#000" }}>
          <img
            src={currentPet.photoUrl}
            alt={currentPet.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />

          {/* Badges on photo */}
          <div style={{ position: "absolute", top: "16px", left: "16px", display: "flex", gap: "8px" }}>
            <span
              style={{
                fontFamily: "monospace",
                fontWeight: 800,
                fontSize: "0.82rem",
                padding: "4px 10px",
                borderRadius: "var(--radius-full)",
                background: "rgba(17, 24, 39, 0.85)",
                backdropFilter: "blur(4px)",
                color: "#FBBF24",
                border: "1px solid rgba(245, 158, 11, 0.4)",
              }}
            >
              {currentPet.code}
            </span>

            {currentPet.isVip && (
              <span className="card-vip-badge" style={{ position: "static" }}>
                <Star size={12} fill="#FFFFFF" />
                <span>GOLDEN VIP</span>
              </span>
            )}
          </div>

          <button
            onClick={handleToggleBookmark}
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              background: "rgba(17, 24, 39, 0.7)",
              backdropFilter: "blur(4px)",
              color: isBookmarked ? "#F59E0B" : "#FFFFFF",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            title={isBookmarked ? t("nav_my_saved_pets") : t("nav_my_pets")}
          >
            <Bookmark size={18} fill={isBookmarked ? "#F59E0B" : "none"} />
          </button>
        </div>

        {/* Card Details Body */}
        <div style={{ padding: "24px 24px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
            <div>
              <h2 style={{ fontSize: "1.75rem", fontWeight: 800, fontFamily: "var(--font-heading)", color: "var(--text-primary)", lineHeight: 1.1 }}>
                {currentPet.name}{" "}
                <span style={{ fontSize: "1.2rem" }}>
                  {currentPet.type === "dog" ? "🐶" : currentPet.type === "cat" ? "🐱" : "🐾"}
                </span>
              </h2>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                {currentPet.breed} · {loc?.flag} {loc?.displayLocation}
              </p>
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                background: "rgba(245, 158, 11, 0.12)",
                padding: "6px 12px",
                borderRadius: "var(--radius-full)",
                color: "var(--accent-gold-dark)",
                fontWeight: 800,
                fontSize: "0.85rem",
              }}
            >
              <Bone size={14} />
              <span>{currentPet.treats || 0}</span>
            </div>
          </div>

          {currentPet.quote && (
            <div
              style={{
                fontSize: "0.92rem",
                color: "var(--text-primary)",
                fontStyle: "italic",
                lineHeight: 1.5,
                margin: "12px 0 20px",
                padding: "10px 14px",
                background: "var(--bg-warm)",
                borderRadius: "var(--radius-sm)",
                borderLeft: "3px solid var(--accent-gold)",
              }}
            >
              “{currentPet.quote}”
            </div>
          )}

          {/* Action Bar */}
          <div style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: "16px" }}>
            <button
              className="btn-secondary"
              onClick={handleNext}
              style={{ flex: "0 0 54px", height: "54px", padding: 0, justifyContent: "center", borderRadius: "50%" }}
              title={t("discover_next_tooltip")}
            >
              <ArrowRight size={22} />
            </button>

            <button
              className={`btn-primary ${isCooldown ? "btn-treat-cooldown" : ""}`}
              onClick={handleTreat}
              disabled={isCooldown}
              style={{
                flex: 1,
                height: "54px",
                justifyContent: "center",
                fontSize: "1.05rem",
                background: isCooldown
                  ? "rgba(100, 116, 139, 0.16)"
                  : "linear-gradient(135deg, #F59E0B, #D97706)",
                boxShadow: isCooldown
                  ? "none"
                  : "0 6px 20px rgba(245, 158, 11, 0.35)",
                cursor: isCooldown ? "not-allowed" : "pointer",
                border: isCooldown ? "1px solid rgba(245, 158, 11, 0.25)" : "none",
                color: isCooldown ? "#D97706" : "#FFFFFF",
              }}
              title={isCooldown ? `${t("cooldown_available_in")}: ${formattedTime}` : t("discover_give_treat")}
            >
              {isCooldown ? (
                <>
                  <Clock size={20} className="cooldown-clock-icon" />
                  <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 700 }}>
                    {t("cooldown_available_in")} {formattedTime}
                  </span>
                </>
              ) : (
                <>
                  <Bone size={20} />
                  <span>{t("discover_give_treat")}</span>
                </>
              )}
            </button>

            <button
              className="btn-secondary"
              onClick={() => onSelectPet(currentPet)}
              style={{ flex: "0 0 54px", height: "54px", padding: 0, justifyContent: "center", borderRadius: "50%" }}
              title={t("discover_view_details")}
            >
              <Award size={20} color="#D97706" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
