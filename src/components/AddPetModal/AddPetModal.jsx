import React, { useState, useMemo } from "react";
import { X, Upload, ArrowRight, ArrowLeft, Check, Sparkles, Star, ShieldCheck, CreditCard, Smartphone, CheckCircle2 } from "lucide-react";
import { launchPetConfetti } from "../../utils/confetti";
import { playCelebrationFanfare } from "../../utils/soundEffects";
import { compressImageFile } from "../../utils/imageCompressor";
import { useTranslation } from "../../i18n/LanguageContext";
import {
  getAllCountries,
  getCountryByCode,
  getStatesForCountry,
  getCitiesForState
} from "../../data/worldLocations";
import { apiService } from "../../services/api";

export function AddPetModal({ onClose, onPetCreated, currentCount, onOpenLegal }) {
  const { t, language } = useTranslation();
  const allCountries = useMemo(() => getAllCountries(language), [language]);

  const [step, setStep] = useState(1);

  // Form State
  const [photoUrl, setPhotoUrl] = useState("");
  const [compressionInfo, setCompressionInfo] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("dog");
  const [breed, setBreed] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] = useState("ES");
  const [selectedStateCode, setSelectedStateCode] = useState("M");
  const [selectedCity, setSelectedCity] = useState("Madrid");
  const [customCity, setCustomCity] = useState("");
  const [isCustomCity, setIsCustomCity] = useState(false);
  const [quote, setQuote] = useState("");
  const [owner, setOwner] = useState("");
  const [instagram, setInstagram] = useState("");
  const [isVip, setIsVip] = useState(false);
  const [isMemorial, setIsMemorial] = useState(false);
  const [isGift, setIsGift] = useState(false);
  const [giftRecipient, setGiftRecipient] = useState("");
  const [hasAcceptedLegal, setHasAcceptedLegal] = useState(false);

  // Available states for chosen country
  const availableStates = useMemo(() => {
    return getStatesForCountry(selectedCountryCode);
  }, [selectedCountryCode]);

  // Available cities for chosen state
  const availableCities = useMemo(() => {
    const currentState = availableStates.find((s) => s.code === selectedStateCode) || availableStates[0];
    return getCitiesForState(selectedCountryCode, selectedStateCode, currentState?.name || "");
  }, [selectedCountryCode, selectedStateCode, availableStates]);

  const handleCountryChange = (countryCode) => {
    setSelectedCountryCode(countryCode);
    const newStates = getStatesForCountry(countryCode);
    const firstState = newStates[0];
    const newStateCode = firstState ? firstState.code : "";
    setSelectedStateCode(newStateCode);
    const newCities = getCitiesForState(countryCode, newStateCode, firstState?.name || "");
    if (newCities.length > 0 && newCities[0] !== "Localidad Principal") {
      setSelectedCity(newCities[0]);
      setIsCustomCity(false);
    } else {
      setIsCustomCity(true);
      setCustomCity("");
    }
  };

  const handleStateChange = (stateCode) => {
    setSelectedStateCode(stateCode);
    const currentState = availableStates.find((s) => s.code === stateCode);
    const newCities = getCitiesForState(selectedCountryCode, stateCode, currentState?.name || "");
    if (newCities.length > 0 && newCities[0] !== "Localidad Principal") {
      setSelectedCity(newCities[0]);
      setIsCustomCity(false);
    } else {
      setIsCustomCity(true);
      setCustomCity("");
    }
  };

  // Payment & Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle local file upload with automated Canvas compression & Supabase CDN upload
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type || !file.type.startsWith("image/")) {
        alert(t("alert_invalid_image"));
        e.target.value = "";
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        alert(t("alert_image_too_heavy"));
        e.target.value = "";
        return;
      }
      try {
        setIsCompressing(true);
        const result = await compressImageFile(file, 600, 0.82);
        setCompressionInfo(result);

        // Upload to Supabase Storage CDN if cloud mode is enabled
        if (apiService.isCloudEnabled()) {
          const cdnUrl = await apiService.uploadPetPhoto(file);
          setPhotoUrl(cdnUrl || result.dataUrl);
        } else {
          setPhotoUrl(result.dataUrl);
        }
        setIsCompressing(false);
      } catch (err) {
        console.error("Compression/upload error:", err);
        setIsCompressing(false);
      }
    }
  };

  // Sample quick presets for testing
  const setQuickSample = (sampleUrl, sampleName, sampleBreed, sampleType, sampleCountry = "ES", sampleState = "AS", sampleCity = "Gijón") => {
    setPhotoUrl(sampleUrl);
    setCompressionInfo({ originalSizeKb: 850, compressedSizeKb: 48, savingsPercent: 94 });
    setName(sampleName);
    setBreed(sampleBreed);
    setType(sampleType);
    setSelectedCountryCode(sampleCountry);
    setSelectedStateCode(sampleState);
    setSelectedCity(sampleCity);
    setIsCustomCity(false);
    setQuote(t("placeholder_quote"));
  };

  // Complete Payment & Creation
  const handleCompletePayment = async () => {
    if (!hasAcceptedLegal) {
      alert(t("legal_consent_required_alert"));
      return;
    }

    setIsSubmitting(true);

    const countryObj = getCountryByCode(selectedCountryCode, language);
    const stateObj = availableStates.find((s) => s.code === selectedStateCode);
    const stateName = stateObj ? stateObj.name : "";
    const finalCity = isCustomCity && customCity.trim() ? customCity.trim() : selectedCity;
    const finalFullLocation = `${finalCity}${stateName ? `, ${stateName}` : ""}, ${countryObj.name}`;
    const nextNum = String(currentCount + 1).padStart(4, "0");
    const newPet = {
      id: `pet-${Date.now()}`,
      code: `PET-${nextNum}-${countryObj.code}`,
      name: name.trim() || t("your_pet"),
      type,
      breed: breed.trim() || (type === "dog" ? t("type_dog") : type === "cat" ? t("type_cat") : t("type_other")),
      photoUrl: photoUrl || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80",
      city: finalCity,
      state: stateName,
      country: countryObj.name,
      countryCode: countryObj.code,
      locationLabel: finalFullLocation,
      date: t("date_today"),
      quote: quote.trim() || t("default_pet_quote"),
      owner: owner.trim() || t("default_pet_owner"),
      instagram: instagram.trim() ? (instagram.startsWith("@") ? instagram : `@${instagram}`) : "",
      isVip,
      isMemorial,
      isGift,
      giftRecipient: isGift ? giftRecipient.trim() : "",
      treats: 1,
    };

    // 1. Try real Stripe Checkout first
    try {
      const session = await apiService.createStripeCheckoutSession(newPet);
      if (session && session.url) {
        sessionStorage.setItem("pending_pet_checkout", JSON.stringify(newPet));
        window.location.href = session.url;
        return;
      }
    } catch (err) {
      console.warn("Stripe Checkout not available, falling back to local demo:", err);
    }

    // 2. Local fallback if backend/Stripe not configured yet
    setTimeout(() => {
      launchPetConfetti();
      playCelebrationFanfare();
      setIsSubmitting(false);
      onPetCreated(newPet);
    }, 1000);
  };

  const price = isVip ? "2,00€" : "1,00€";
  const cityDisplay = isCustomCity && customCity.trim() ? customCity.trim() : selectedCity;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content add-pet-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button className="modal-close-btn" onClick={onClose} aria-label={t("close_modal")}>
          <X size={18} />
        </button>

        {/* Stepper Header */}
        <div className="stepper">
          <div className={`step-node ${step === 1 ? "active" : step > 1 ? "completed" : ""}`}>
            <div className="step-circle">{step > 1 ? <Check size={16} /> : "1"}</div>
            <span className="step-label">{t("step_photo")}</span>
          </div>

          <div className={`step-node ${step === 2 ? "active" : step > 2 ? "completed" : ""}`}>
            <div className="step-circle">{step > 2 ? <Check size={16} /> : "2"}</div>
            <span className="step-label">{t("step_details")}</span>
          </div>

          <div className={`step-node ${step === 3 ? "active" : step > 3 ? "completed" : ""}`}>
            <div className="step-circle">{step > 3 ? <Check size={16} /> : "3"}</div>
            <span className="step-label">{t("step_plan")}</span>
          </div>

          <div className={`step-node ${step === 4 ? "active" : ""}`}>
            <div className="step-circle">4</div>
            <span className="step-label">{t("step_pay")}</span>
          </div>
        </div>

        {/* STEP 1: UPLOAD PHOTO */}
        {step === 1 && (
          <div>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", marginBottom: "6px" }}>
              {t("step1_heading")}
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: "20px" }}>
              {t("step1_sub")}
            </p>

            {photoUrl ? (
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <div className="upload-preview-wrap">
                  <img src={photoUrl} alt={t("photo_preview_alt")} className="upload-preview-img" />
                </div>

                {compressionInfo && (
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "4px 12px",
                      background: "#ECFDF5",
                      border: "1px solid #A7F3D0",
                      borderRadius: "var(--radius-full)",
                      fontSize: "0.78rem",
                      color: "#065F46",
                      fontWeight: 600,
                      marginBottom: "12px",
                    }}
                  >
                    <CheckCircle2 size={13} color="#059669" />
                    <span>
                      {t("optimized_to")} {compressionInfo.compressedSizeKb} KB ({compressionInfo.savingsPercent}% {t("savings_of_space")})
                    </span>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="photo-upload-input"
                    className="btn-secondary"
                    style={{ display: "inline-flex", cursor: "pointer", fontSize: "0.85rem" }}
                  >
                    <Upload size={14} />
                    <span>{t("change_photo")}</span>
                  </label>
                </div>
              </div>
            ) : (
              <label htmlFor="photo-upload-input" className="upload-dropzone">
                <div className="upload-icon-wrap">
                  <Upload size={24} />
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)" }}>
                    {isCompressing ? t("compressing_photo") : t("click_upload")}
                  </p>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    {t("upload_hint")}
                  </p>
                </div>
              </label>
            )}

            <input
              id="photo-upload-input"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />

            {/* Quick Test Samples */}
            <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px dashed var(--border-subtle)" }}>
              <p style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "8px", textTransform: "uppercase" }}>
                {t("quick_sample_prompt")}
              </p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ fontSize: "0.8rem", padding: "6px 12px" }}
                  onClick={() =>
                    setQuickSample(
                      "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80",
                      "Max",
                      "Beagle",
                      "dog"
                    )
                  }
                >
                  {t("sample_dog")}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ fontSize: "0.8rem", padding: "6px 12px" }}
                  onClick={() =>
                    setQuickSample(
                      "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=800&q=80",
                      "Misi",
                      "Gatito Europeo",
                      "cat"
                    )
                  }
                >
                  {t("sample_cat")}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ fontSize: "0.8rem", padding: "6px 12px" }}
                  onClick={() =>
                    setQuickSample(
                      "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=800&q=80",
                      "Tambor",
                      "Conejo Enano",
                      "other"
                    )
                  }
                >
                  {t("sample_bunny")}
                </button>
              </div>
            </div>

            <div className="step-actions">
              <span />
              <button
                className="btn-primary"
                disabled={!photoUrl || isCompressing}
                onClick={() => setStep(2)}
                id="step-1-next-btn"
                style={{ opacity: photoUrl ? 1 : 0.5 }}
              >
                <span>{t("btn_continue")}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PET DETAILS */}
        {step === 2 && (
          <div>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", marginBottom: "6px" }}>
              {t("step2_heading")}
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: "18px" }}>
              {t("step2_sub")}
            </p>

            <div className="form-group">
              <label className="form-label">{t("label_name")}</label>
              <input
                type="text"
                className="form-input"
                placeholder={t("placeholder_name")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="form-row-2col">
              <div className="form-group">
                <label className="form-label">{t("label_type")}</label>
                <select
                  className="form-select"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="dog">{t("filter_dogs")}</option>
                  <option value="cat">{t("filter_cats")}</option>
                  <option value="other">{t("filter_others")}</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">{t("label_breed")}</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={t("placeholder_breed")}
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row-3col">
              {/* PAÍS */}
              <div className="form-group">
                <label className="form-label">{t("label_country")}</label>
                <select
                  className="form-select"
                  value={selectedCountryCode}
                  onChange={(e) => handleCountryChange(e.target.value)}
                >
                  {allCountries.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* PROVINCIA / ESTADO */}
              <div className="form-group">
                <label className="form-label">{t("label_state")}</label>
                <select
                  className="form-select"
                  value={selectedStateCode}
                  onChange={(e) => handleStateChange(e.target.value)}
                >
                  {availableStates.map((st) => (
                    <option key={st.code} value={st.code}>
                      {st.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* LOCALIDAD / CIUDAD */}
              <div className="form-group">
                <label className="form-label">{t("label_city")}</label>
                {!isCustomCity ? (
                  <select
                    className="form-select"
                    value={selectedCity}
                    onChange={(e) => {
                      if (e.target.value === "__CUSTOM__") {
                        setIsCustomCity(true);
                      } else {
                        setSelectedCity(e.target.value);
                      }
                    }}
                  >
                    {availableCities.map((cityItem) => (
                      <option key={cityItem} value={cityItem}>
                        {cityItem}
                      </option>
                    ))}
                    <option value="__CUSTOM__">{t("custom_city_option")}</option>
                  </select>
                ) : (
                  <div style={{ display: "flex", gap: "6px" }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder={t("placeholder_custom_city")}
                      value={customCity}
                      onChange={(e) => setCustomCity(e.target.value)}
                      autoFocus
                    />
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ padding: "0 10px", fontSize: "0.8rem", flexShrink: 0 }}
                      onClick={() => {
                        setIsCustomCity(false);
                        setSelectedCity(availableCities[0] || "");
                      }}
                      title={t("back_to_list")}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label className="form-label" style={{ margin: 0 }}>{t("label_quote")}</label>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: quote.length >= 180 ? (quote.length >= 200 ? "#EF4444" : "#F59E0B") : "var(--text-muted)",
                    transition: "color 0.2s ease",
                  }}
                >
                  {quote.length} / 200
                </span>
              </div>
              <textarea
                className="form-textarea"
                placeholder={t("placeholder_quote")}
                value={quote}
                maxLength={200}
                onChange={(e) => setQuote(e.target.value)}
              />
            </div>

            <div className="form-row-2col">
              <div className="form-group">
                <label className="form-label">{t("label_owner")}</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={t("placeholder_owner")}
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t("label_instagram")}</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={t("placeholder_instagram")}
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                />
              </div>
            </div>

            {/* Memorial & Gift Options */}
            <div style={{ background: "rgba(59, 130, 246, 0.06)", border: "1px solid rgba(59, 130, 246, 0.2)", borderRadius: "var(--radius-md)", padding: "12px 14px", marginTop: "14px" }}>
              <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={isMemorial}
                  onChange={(e) => setIsMemorial(e.target.checked)}
                  style={{ width: "18px", height: "18px", marginTop: "2px", accentColor: "#3B82F6", cursor: "pointer" }}
                />
                <div>
                  <span style={{ fontWeight: 800, fontSize: "0.85rem", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>{t("add_memorial_label")}</span>
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginTop: "2px" }}>
                    {t("add_memorial_desc")}
                  </span>
                </div>
              </label>
            </div>

            <div style={{ background: "rgba(245, 158, 11, 0.06)", border: "1px solid rgba(245, 158, 11, 0.2)", borderRadius: "var(--radius-md)", padding: "12px 14px", marginTop: "10px" }}>
              <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={isGift}
                  onChange={(e) => setIsGift(e.target.checked)}
                  style={{ width: "18px", height: "18px", marginTop: "2px", accentColor: "#F59E0B", cursor: "pointer" }}
                />
                <div>
                  <span style={{ fontWeight: 800, fontSize: "0.85rem", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>{t("add_gift_label")}</span>
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginTop: "2px" }}>
                    {t("add_gift_desc")}
                  </span>
                </div>
              </label>
              {isGift && (
                <input
                  type="text"
                  className="form-input"
                  placeholder={t("add_gift_placeholder")}
                  value={giftRecipient}
                  onChange={(e) => setGiftRecipient(e.target.value)}
                  style={{ marginTop: "10px", fontSize: "0.82rem" }}
                />
              )}
            </div>

            <div className="step-actions">
              <button className="btn-secondary" onClick={() => setStep(1)}>
                <ArrowLeft size={16} />
                <span>{t("btn_back")}</span>
              </button>

              <button
                className="btn-primary"
                disabled={!name.trim()}
                onClick={() => setStep(3)}
                id="step-2-next-btn"
                style={{ opacity: name.trim() ? 1 : 0.5 }}
              >
                <span>{t("btn_continue")}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: TIER SELECTION */}
        {step === 3 && (
          <div>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", marginBottom: "6px" }}>
              {t("step3_heading")}
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: "20px" }}>
              {t("step3_sub")}
            </p>

            <div className="tiers-grid">
              {/* Standard Tier */}
              <div
                className={`tier-card ${!isVip ? "selected" : ""}`}
                onClick={() => setIsVip(false)}
                id="tier-standard-btn"
              >
                <h3 className="tier-name">{t("tier_standard_name")}</h3>
                <div className="tier-price">{t("tier_standard_price")}</div>
                <ul className="tier-features">
                  <li className="tier-feature-item">
                    <Check size={14} color="#10B981" />
                    <span>{t("tier_std_feat1")}</span>
                  </li>
                  <li className="tier-feature-item">
                    <Check size={14} color="#10B981" />
                    <span>{t("tier_std_feat2")}</span>
                  </li>
                  <li className="tier-feature-item">
                    <Check size={14} color="#10B981" />
                    <span>{t("tier_std_feat3")}</span>
                  </li>
                  <li className="tier-feature-item">
                    <Check size={14} color="#10B981" />
                    <span>{t("tier_std_feat4")}</span>
                  </li>
                </ul>
              </div>

              {/* VIP Tier */}
              <div
                className={`tier-card is-vip ${isVip ? "selected" : ""}`}
                onClick={() => setIsVip(true)}
                id="tier-vip-btn"
              >
                <span className="tier-badge">{t("tier_vip_badge")}</span>
                <h3 className="tier-name">{t("tier_vip_name")}</h3>
                <div className="tier-price" style={{ color: "var(--accent-gold-dark)" }}>{t("tier_vip_price")}</div>
                <ul className="tier-features">
                  <li className="tier-feature-item">
                    <Check size={14} color="#D97706" />
                    <strong>{t("tier_vip_feat1")}</strong>
                  </li>
                  <li className="tier-feature-item">
                    <Star size={14} color="#D97706" fill="#D97706" />
                    <strong>{t("tier_vip_feat2")}</strong>
                  </li>
                  <li className="tier-feature-item">
                    <Star size={14} color="#D97706" fill="#D97706" />
                    <strong>{t("tier_vip_feat3")}</strong>
                  </li>
                  <li className="tier-feature-item">
                    <Star size={14} color="#D97706" fill="#D97706" />
                    <strong>{t("tier_vip_feat4")}</strong>
                  </li>
                </ul>
              </div>
            </div>

            <div className="step-actions">
              <button className="btn-secondary" onClick={() => setStep(2)}>
                <ArrowLeft size={16} />
                <span>{t("btn_back")}</span>
              </button>

              <button className="btn-primary" onClick={() => setStep(4)} id="step-3-next-btn">
                <span>{t("btn_continue")} ({price})</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: ORDER SUMMARY & SECURE PAYMENT */}
        {step === 4 && (
          <div>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", marginBottom: "6px" }}>
              {t("step4_heading")} {price}
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: "18px" }}>
              {t("step4_sub")}
            </p>

            {/* Pet Summary Card */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "14px 16px",
                marginBottom: "14px",
              }}
            >
              <img
                src={photoUrl || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80"}
                alt={name || t("type_other")}
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "var(--radius-sm)",
                  objectFit: "cover",
                  border: isVip ? "2px solid var(--accent-gold)" : "1px solid var(--border-subtle)",
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontWeight: 800, fontSize: "1.05rem", color: "var(--text-primary)" }}>
                    {name || t("your_pet")}
                  </span>
                  {isVip && (
                    <span
                      style={{
                        background: "linear-gradient(135deg, #FEF08A, #F59E0B)",
                        color: "#78350F",
                        fontSize: "0.7rem",
                        fontWeight: 800,
                        padding: "2px 6px",
                        borderRadius: "4px",
                      }}
                    >
                      VIP
                    </span>
                  )}
                </div>
                <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: "2px 0 0 0" }}>
                  {breed || (type === "dog" ? t("type_dog") : type === "cat" ? t("type_cat") : t("type_other"))} • {cityDisplay}
                </p>
                <p
                  style={{
                    fontSize: "0.78rem",
                    color: isVip ? "var(--accent-gold-dark)" : "var(--accent-teal)",
                    fontWeight: 700,
                    margin: "2px 0 0 0",
                  }}
                >
                  {isVip ? t("tier_summary_vip") : t("tier_summary_std")}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--accent-gold-dark)" }}>
                  {price}
                </span>
                <span style={{ display: "block", fontSize: "0.7rem", color: "var(--text-muted)" }}>
                  {t("one_time_payment")}
                </span>
              </div>
            </div>

            {/* Causa Solidaria Badge */}
            <div
              style={{
                background: "rgba(16, 185, 129, 0.08)",
                border: "1px solid rgba(16, 185, 129, 0.25)",
                borderRadius: "var(--radius-sm)",
                padding: "10px 12px",
                marginBottom: "14px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span style={{ fontSize: "1.3rem" }}>🐾</span>
              <div>
                <span style={{ fontWeight: 800, fontSize: "0.82rem", color: "#065F46", display: "block" }}>
                  {t("cause_box_title")}
                </span>
                <span style={{ fontSize: "0.75rem", color: "#047857" }}>
                  {t("cause_box_desc")}
                </span>
              </div>
            </div>

            {/* Stripe Payment Gateway Callout */}
            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "16px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "10px",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)" }}>
                  {t("gateway_methods_label")}
                </span>
                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  <span
                    style={{
                      background: "#000000",
                      color: "#FFFFFF",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                    }}
                  >
                     Pay
                  </span>
                  <span
                    style={{
                      background: "#FFFFFF",
                      color: "#3C4043",
                      border: "1px solid #DADCE0",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                    }}
                  >
                    G Pay
                  </span>
                  <span
                    style={{
                      background: "#1E293B",
                      color: "#FFFFFF",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                    }}
                  >
                    {t("gateway_cards_label")}
                  </span>
                </div>
              </div>
              <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.45 }}>
                {t("gateway_stripe_note")}
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#10B981", fontSize: "0.82rem", marginBottom: "14px" }}>
              <ShieldCheck size={16} />
              <span>{t("ssl_security")}</span>
            </div>

            {/* Legal Consent Checkbox (RGPD & TRLGDCU) */}
            <div className="legal-checkout-box">
              <label className="legal-checkout-label" htmlFor="checkout-legal-consent">
                <input
                  type="checkbox"
                  id="checkout-legal-consent"
                  checked={hasAcceptedLegal}
                  onChange={(e) => setHasAcceptedLegal(e.target.checked)}
                  className="legal-checkout-checkbox"
                />
                <span className="legal-checkout-text">
                  {t("legal_consent_accept")}{" "}
                  <a
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="legal-inline-link"
                    title="Terms and Conditions"
                  >
                    {t("legal_consent_terms_link")}
                  </a>{" "}
                  {t("legal_consent_and")}{" "}
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="legal-inline-link"
                    title="Privacy Policy"
                  >
                    {t("legal_consent_privacy_link")}
                  </a>
                  .
                </span>
              </label>
            </div>

            <div className="step-actions">
              <button className="btn-secondary" onClick={() => setStep(3)} disabled={isSubmitting}>
                <ArrowLeft size={16} />
                <span>{t("btn_back")}</span>
              </button>

              <button
                className="btn-primary"
                onClick={handleCompletePayment}
                disabled={isSubmitting || !hasAcceptedLegal}
                id="submit-payment-btn"
                style={{
                  padding: "14px 28px",
                  opacity: !hasAcceptedLegal ? 0.6 : 1,
                  cursor: !hasAcceptedLegal ? "not-allowed" : "pointer",
                }}
                title={!hasAcceptedLegal ? t("legal_consent_required_alert") : ""}
              >
                <Sparkles size={16} />
                <span>{isSubmitting ? t("processing_payment") : `${t("btn_pay_prefix")} ${price} ${t("btn_pay_suffix")}`}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
