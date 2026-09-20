import React from "react";
import { Crown, Trophy, Bone, Star, Award, Sparkles, Clock } from "lucide-react";
import { parsePetLocation } from "../../data/worldLocations";
import { useTranslation } from "../../i18n/LanguageContext";
import { useTreatCooldown } from "../../utils/treatCooldown";

function PodiumTreatButton({ petId, onGiveTreat }) {
  const { t } = useTranslation();
  const { isCooldown, formattedTime } = useTreatCooldown(petId);

  return (
    <button
      className={`btn-treat ${isCooldown ? "btn-treat-cooldown" : ""}`}
      onClick={(e) => {
        e.stopPropagation();
        if (!isCooldown) onGiveTreat(petId);
      }}
      disabled={isCooldown}
      style={{
        flex: 1,
        padding: "8px 12px",
        fontSize: "0.8rem",
        cursor: isCooldown ? "not-allowed" : "pointer",
        opacity: isCooldown ? 0.85 : 1,
      }}
      title={isCooldown ? `${t("cooldown_available_in")}: ${formattedTime}` : t("give_treat")}
    >
      {isCooldown ? (
        <>
          <Clock size={13} className="cooldown-clock-icon" />
          <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 700 }}>{formattedTime}</span>
        </>
      ) : (
        <>
          <Bone size={14} />
          <span>{t("give_treat")}</span>
        </>
      )}
    </button>
  );
}

export function MuroDeHonorSection({ pets, onSelectPet, onGiveTreat }) {
  const { t } = useTranslation();

  // Sort by treats descending and take top 3
  const topThree = React.useMemo(() => {
    return [...pets]
      .sort((a, b) => (b.treats || 0) - (a.treats || 0))
      .slice(0, 3);
  }, [pets]);

  if (topThree.length < 3) return null;

  const first = topThree[0];
  const second = topThree[1];
  const third = topThree[2];

  const podiumOrder = [
    { pet: second, rank: 2, medal: "🥈", label: t("honor_rank_2"), color: "#94A3B8", height: "180px", crownColor: "#CBD5E1" },
    { pet: first, rank: 1, medal: "🥇", label: t("honor_champ"), color: "#F59E0B", height: "220px", crownColor: "#F59E0B", isChamp: true },
    { pet: third, rank: 3, medal: "🥉", label: t("honor_rank_3"), color: "#D97706", height: "150px", crownColor: "#B45309" },
  ];

  return (
    <section className="section-muro-honor" style={{ padding: "64px 0", background: "radial-gradient(ellipse at top, rgba(245, 158, 11, 0.08) 0%, transparent 70%)" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px",
              background: "rgba(245, 158, 11, 0.12)",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              borderRadius: "var(--radius-full)",
              color: "var(--accent-gold-dark)",
              fontSize: "0.82rem",
              fontWeight: 800,
              marginBottom: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            <Trophy size={15} />
            <span>{t("honor_tag")}</span>
          </div>

          <h2 style={{ fontSize: "2rem", fontWeight: 800, fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}>
            {t("honor_title")}
          </h2>
          <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", maxWidth: "540px", margin: "8px auto 0" }}>
            {t("honor_desc")}
          </p>
        </div>

        {/* Podium Layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "24px",
            alignItems: "end",
            maxWidth: "960px",
            margin: "0 auto",
          }}
        >
          {podiumOrder.map(({ pet, rank, medal, label, color, isChamp }) => {
            const loc = parsePetLocation(pet.city, pet);

            return (
              <div
                key={pet.id}
                style={{
                  background: "var(--bg-surface)",
                  border: isChamp ? "2.5px solid #F59E0B" : "1.5px solid var(--border-subtle)",
                  borderRadius: "var(--radius-xl)",
                  padding: "24px 20px",
                  textAlign: "center",
                  boxShadow: isChamp ? "0 12px 35px rgba(245, 158, 11, 0.22)" : "var(--shadow-md)",
                  transform: isChamp ? "scale(1.05)" : "none",
                  transition: "all var(--transition-normal)",
                  position: "relative",
                }}
              >
                {/* Crown / Rank Banner */}
                <div
                  style={{
                    position: "absolute",
                    top: "-16px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: isChamp ? "linear-gradient(135deg, #F59E0B, #D97706)" : "var(--bg-subtle)",
                    color: isChamp ? "#FFFFFF" : "var(--text-primary)",
                    padding: "4px 14px",
                    borderRadius: "var(--radius-full)",
                    fontSize: "0.78rem",
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    boxShadow: "var(--shadow-sm)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {isChamp ? <Crown size={14} fill="#FFFFFF" /> : <span>{medal}</span>}
                  <span>{label}</span>
                </div>

                {/* Photo thumbnail */}
                <div
                  onClick={() => onSelectPet(pet)}
                  style={{
                    width: isChamp ? "110px" : "90px",
                    height: isChamp ? "110px" : "90px",
                    borderRadius: "50%",
                    margin: "12px auto 16px",
                    overflow: "hidden",
                    border: isChamp ? "4px solid #F59E0B" : "3px solid var(--border-subtle)",
                    cursor: "pointer",
                    boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
                    position: "relative",
                  }}
                >
                  <img
                    src={pet.photoUrl}
                    alt={pet.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <span style={{ fontSize: "0.75rem", fontFamily: "monospace", color: "var(--accent-gold-dark)", fontWeight: 700 }}>
                    {pet.code}
                  </span>
                  <h3
                    onClick={() => onSelectPet(pet)}
                    style={{
                      fontSize: isChamp ? "1.45rem" : "1.25rem",
                      fontWeight: 800,
                      fontFamily: "var(--font-heading)",
                      color: "var(--text-primary)",
                      cursor: "pointer",
                      marginTop: "2px",
                    }}
                  >
                    {pet.name}
                  </h3>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                    {pet.breed} · {loc.flag} {loc.cityName || pet.city}
                  </p>
                </div>

                {/* Treats Count */}
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "rgba(245, 158, 11, 0.12)",
                    padding: "6px 14px",
                    borderRadius: "var(--radius-full)",
                    color: "var(--accent-gold-dark)",
                    fontWeight: 800,
                    fontSize: "0.9rem",
                    marginBottom: "16px",
                  }}
                >
                  <Bone size={15} />
                  <span>{pet.treats || 0} {t("treats_unit")}</span>
                </div>

                <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                  <PodiumTreatButton petId={pet.id} onGiveTreat={onGiveTreat} />

                  <button
                    className="btn-secondary"
                    onClick={() => onSelectPet(pet)}
                    style={{ padding: "8px 12px", fontSize: "0.8rem" }}
                  >
                    {t("discover_view_details")}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
