import React, { useState, useEffect } from "react";
import { X, Star, Calendar, User, Bone, Award, Flag, Bookmark, Check, Share2, Maximize2, Sparkles, Clock } from "lucide-react";
import { launchTreatSparkle } from "../utils/confetti";
import { playTreatSound } from "../utils/soundEffects";
import { useTranslation } from "../i18n/LanguageContext";
import { parsePetLocation } from "../data/worldLocations";
import { useTreatCooldown } from "../utils/treatCooldown";
import {
  reportPetInStorage,
  getMyPetIds,
  saveMyPetId,
  removeMyPetId,
} from "../utils/storage";

export function PetDetailModal({ pet, onClose, onGiveTreat, onViewPassport, onOpenStory, onOpenCollarTag }) {
  const { t } = useTranslation();

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [reportState, setReportState] = useState("idle"); // 'idle' | 'reporting' | 'reported'
  const [reportReason, setReportReason] = useState("Foto inapropiada o no permitida");
  const [shareFeedback, setShareFeedback] = useState(false);
  const [showFullPhoto, setShowFullPhoto] = useState(false);
  const [isQuoteExpanded, setIsQuoteExpanded] = useState(false);
  const { isCooldown, formattedTime } = useTreatCooldown(pet?.id);

  useEffect(() => {
    if (!pet) return;
    const myIds = getMyPetIds();
    setIsBookmarked(myIds.includes(pet.id));
    setIsQuoteExpanded(false);
  }, [pet?.id]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (showFullPhoto) {
          setShowFullPhoto(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showFullPhoto, onClose]);

  if (!pet) return null;

  const locationInfo = parsePetLocation(pet.city, pet);
  const isLongQuote = Boolean(pet?.quote && pet.quote.length > 80);

  const handleTreat = (e) => {
    if (isCooldown) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;
    launchTreatSparkle(x, y);
    playTreatSound();
    onGiveTreat(pet.id);
  };

  const handleToggleBookmark = () => {
    if (isBookmarked) {
      removeMyPetId(pet.id);
      setIsBookmarked(false);
    } else {
      saveMyPetId(pet.id);
      setIsBookmarked(true);
    }
  };

  const handleSendReport = (e) => {
    e.preventDefault();
    reportPetInStorage(pet.id, reportReason);
    setReportState("reported");
    setTimeout(() => {
      setReportState("idle");
    }, 4000);
  };

  const handleShare = () => {
    const url = `${window.location.origin}/wall?pet=${pet.code}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setShareFeedback(true);
      setTimeout(() => setShareFeedback(false), 2500);
    }
  };

  const touchStartY = React.useRef(0);
  const containerRef = React.useRef(null);

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diffY = touchEndY - touchStartY.current;
    // Dismiss bottom sheet on swipe down if at top of scroll
    if (diffY > 75 && containerRef.current && containerRef.current.scrollTop <= 5) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        ref={containerRef}
        className={`modal-content detail-modal-container ${pet.isMemorial ? "modal-memorial-theme" : ""}`}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        role="dialog"
        aria-modal="true"
      >
        {/* Mobile drag handle */}
        <div className="modal-drag-indicator mobile-only" aria-hidden="true">
          <div className="modal-drag-bar" />
        </div>

        {/* Mobile floating close button: pinned at top-right of sheet, always visible & accessible */}
        <button
          type="button"
          className="detail-floating-close-btn mobile-only"
          onClick={onClose}
          aria-label={t("close_modal")}
          title={t("close_modal")}
        >
          <X size={20} />
        </button>

        <div className="detail-modal-grid">
          {/* Pet Photo Column: uncropped presentation with ambient blur backdrop */}
          <div
            className="detail-modal-photo-wrap"
            onClick={() => setShowFullPhoto(true)}
            title={t("photo_zoom_hint")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setShowFullPhoto(true);
              }
            }}
          >

            {/* Ambient blurred backdrop fills container with subtle matching mood */}
            <img
              src={pet.photoUrl}
              alt=""
              aria-hidden="true"
              className="detail-modal-photo-blur"
            />

            {/* Crisp uncropped photo centered with object-fit: contain */}
            <img
              src={pet.photoUrl}
              alt={pet.name}
              className="detail-modal-photo"
            />

            <div className="detail-modal-photo-zoom-hint">
              <Maximize2 size={12} />
              <span>{t("photo_view_full")}</span>
            </div>
          </div>

          {/* Pet Details Column */}
          <div className="detail-modal-body">
            {/* Clean, refined top header bar */}
            <div className="detail-header-bar">
              <div className="detail-header-tags">
                <div className={`detail-plaque ${pet.isMemorial ? "detail-plaque-memorial" : ""}`}>
                  {pet.isMemorial ? <Sparkles size={12} color="#93C5FD" /> : <Award size={12} color="#D97706" />}
                  <span>{pet.code}</span>
                </div>
                {pet.isMemorial && (
                  <span className="detail-memorial-chip">
                    {t("tag_memorial")}
                  </span>
                )}
                {pet.isVip && (
                  <span className="detail-vip-chip">
                    ⭐ VIP
                  </span>
                )}
              </div>

              {/* Quick icon actions: Bookmark, Share & Close in unified non-colliding row */}
              <div className="detail-icon-actions">
                <button
                  onClick={handleToggleBookmark}
                  className={`detail-icon-btn ${isBookmarked ? "active" : ""}`}
                  title={isBookmarked ? t("bookmark_saved") : t("bookmark_save")}
                  aria-label={t("bookmark_save")}
                >
                  <Bookmark size={15} fill={isBookmarked ? "#D97706" : "none"} />
                </button>

                <button
                  onClick={handleShare}
                  className="detail-icon-btn"
                  title={t("share_copy_link")}
                  aria-label={t("share_btn_text")}
                >
                  {shareFeedback ? <Check size={15} color="#10B981" /> : <Share2 size={15} />}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="detail-icon-btn detail-close-action-btn"
                  title={t("close_modal")}
                  aria-label={t("close_modal")}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Pet Name & Subtitle */}
            <div className="detail-title-section">
              <h2 className="detail-name">{pet.name}</h2>
              <p className="detail-breed">
                {pet.breed} {pet.type === "dog" ? "🐶" : pet.type === "cat" ? "🐱" : "🐾"}
                {pet.isMemorial && (
                  <span className="detail-memorial-subtitle"> {t("memorial_subtitle")}</span>
                )}
              </p>
            </div>

            {pet.quote && (
              <div className="detail-quote-container">
                <div className={`detail-quote-box ${isLongQuote ? (isQuoteExpanded ? "expanded" : "clamped") : ""}`}>
                  “{pet.quote}”
                </div>
                {isLongQuote && (
                  <button
                    type="button"
                    className="detail-quote-toggle"
                    onClick={() => setIsQuoteExpanded((prev) => !prev)}
                    aria-expanded={isQuoteExpanded}
                  >
                    {isQuoteExpanded ? t("read_less") : t("read_more")}
                  </button>
                )}
              </div>
            )}

            <div className="detail-meta-list">
              <div className="detail-meta-item">
                <span style={{ fontSize: "16px", lineHeight: 1 }}>{locationInfo.flag}</span>
                <span>{locationInfo.fullLabel}</span>
              </div>
              <div className="detail-meta-item">
                <Calendar size={15} color={pet.isMemorial ? "#94A3B8" : "#71717A"} />
                <span>{pet.isMemorial ? t("memorial_immortalized_on") : t("immortalized_on")} {pet.date}</span>
              </div>
              {pet.owner && (
                <div className="detail-meta-item">
                  <User size={15} color={pet.isMemorial ? "#94A3B8" : "#71717A"} />
                  <span>{t("owner_label")}: {pet.owner}</span>
                </div>
              )}
              {pet.instagram && (
                <div className="detail-meta-item">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                  </svg>
                  <a
                    href={`https://instagram.com/${encodeURIComponent(pet.instagram.replace(/^@/, "").replace(/[^a-zA-Z0-9._]/g, ""))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: pet.isMemorial ? "#93C5FD" : "var(--accent-gold-dark)", textDecoration: "none", fontWeight: 600 }}
                  >
                    {pet.instagram}
                  </a>
                </div>
              )}
            </div>

            <div className="detail-actions">
              <button
                className={`btn-treat ${pet.isMemorial ? "btn-memorial-treat" : ""} ${isCooldown ? "btn-treat-cooldown" : ""}`}
                onClick={handleTreat}
                disabled={isCooldown}
                id="modal-give-treat-btn"
                title={
                  isCooldown
                    ? `${t("cooldown_available_in")}: ${formattedTime}`
                    : pet.isMemorial
                    ? t("memorial_send_light")
                    : t("give_treat")
                }
              >
                {isCooldown ? (
                  <>
                    <Clock size={16} className="cooldown-clock-icon" />
                    <span>
                      {t("cooldown_available_in")} {formattedTime} ({pet.treats || 0} {pet.isMemorial ? "✨" : "🦴"})
                    </span>
                  </>
                ) : (
                  <>
                    {pet.isMemorial ? <Sparkles size={16} /> : <Bone size={16} />}
                    <span>
                      {pet.isMemorial
                        ? `${t("memorial_send_light")} (${pet.treats || 0})`
                        : `${t("give_treat")} (${pet.treats || 0})`}
                    </span>
                  </>
                )}
              </button>

              <div className="detail-secondary-actions">
                <button
                  className="btn-secondary"
                  onClick={() => onViewPassport(pet)}
                  id="modal-view-passport-btn"
                >
                  <Award size={15} color="#D97706" />
                  <span>{t("view_passport_btn")}</span>
                </button>

                {onOpenStory && (
                  <button
                    className="btn-secondary"
                    onClick={() => onOpenStory(pet)}
                    title={t("story_modal_title")}
                  >
                    <span>{t("modal_story_btn")}</span>
                  </button>
                )}

                {onOpenCollarTag && (
                  <button
                    className="btn-secondary"
                    onClick={() => onOpenCollarTag(pet)}
                    title={t("collar_modal_title")}
                  >
                    <span>{t("modal_collar_btn")}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Moderation / Report Inappropriate Content */}
            <div style={{ marginTop: "20px", paddingTop: "14px", borderTop: "1px solid var(--border-subtle)" }}>
              {reportState === "idle" && (
                <button
                  onClick={() => setReportState("reporting")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <Flag size={12} />
                  <span>{t("report_pet_btn")}</span>
                </button>
              )}

              {reportState === "reporting" && (
                <form
                  onSubmit={handleSendReport}
                  style={{
                    background: "var(--bg-subtle)",
                    padding: "12px",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "0.82rem",
                  }}
                >
                  <p style={{ fontWeight: 700, marginBottom: "6px", color: "var(--text-primary)" }}>
                    {t("report_reason_label")}
                  </p>
                  <select
                    className="form-input"
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    style={{ fontSize: "0.8rem", padding: "6px 10px", marginBottom: "8px" }}
                  >
                    <option value="Foto inapropiada o no permitida">{t("report_reason_photo")}</option>
                    <option value="Lenguaje o dedicatoria ofensiva">{t("report_reason_language")}</option>
                    <option value="Spam o publicidad">{t("report_reason_spam")}</option>
                    <option value="Datos incorrectos o suplantación">{t("report_reason_identity")}</option>
                  </select>
                  <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setReportState("idle")}
                      style={{ padding: "4px 10px", fontSize: "0.75rem" }}
                    >
                      {t("btn_cancel")}
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      style={{ padding: "4px 10px", fontSize: "0.75rem", background: "#EF4444", borderColor: "#DC2626" }}
                    >
                      {t("report_submit_btn")}
                    </button>
                  </div>
                </form>
              )}

              {reportState === "reported" && (
                <p style={{ fontSize: "0.78rem", color: "#16A34A", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                  <Check size={14} />
                  <span>{t("report_success_msg")}</span>
                </p>
              )}
            </div>

            {/* Bottom close button */}
            <div className="detail-bottom-close-wrap">
              <button
                type="button"
                className="btn-secondary detail-bottom-close-btn"
                onClick={onClose}
                id="modal-bottom-close-btn"
              >
                <X size={16} />
                <span>{t("close_modal") || "Cerrar ficha"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full Photo Lightbox Overlay */}
      {showFullPhoto && (
        <div
          className="photo-lightbox-overlay"
          onClick={() => setShowFullPhoto(false)}
          role="dialog"
          aria-modal="true"
        >
          <button
            className="photo-lightbox-close"
            onClick={() => setShowFullPhoto(false)}
            aria-label={t("photo_close_hint")}
          >
            <X size={22} />
          </button>
          <div
            className="photo-lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={pet.photoUrl}
              alt={pet.name}
              className="photo-lightbox-img"
            />
            <div className="photo-lightbox-caption">
              <strong>{pet.name}</strong> • {pet.breed}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

