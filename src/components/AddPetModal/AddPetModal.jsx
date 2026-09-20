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

  // Payment State
  const [payMethod, setPayMethod] = useState("card");
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [cardExp, setCardExp] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("888");
  const [bizumPhone, setBizumPhone] = useState("612 345 678");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle local file upload with automated Canvas compression & Supabase CDN upload
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type || !file.type.startsWith("image/")) {
        alert("Por favor, selecciona un archivo de imagen válido (JPG, PNG, WebP).");
        e.target.value = "";
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        alert("La imagen es demasiado pesada. El tamaño máximo permitido es 15 MB.");
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
      name: name.trim() || "Mascota Amiga",
      type,
      breed: breed.trim() || (type === "dog" ? "Perrito adorable" : type === "cat" ? "Gatito lindo" : "Compañero fiel"),
      photoUrl: photoUrl || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80",
      city: finalCity,
      state: stateName,
      country: countryObj.name,
      countryCode: countryObj.code,
      locationLabel: finalFullLocation,
      date: "Hoy",
      quote: quote.trim() || "Inmortalizado para siempre con todo el amor de su familia.",
      owner: owner.trim() || "Familia Humana",
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content add-pet-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button className="modal-close-btn" onClick={onClose} aria-label="Cerrar modal">
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
                  <img src={photoUrl} alt="Vista previa" className="upload-preview-img" />
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
                      Optimizada a {compressionInfo.compressedSizeKb} KB ({compressionInfo.savingsPercent}% ahorro de espacio)
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
                    {isCompressing ? "Comprimiendo y optimizando..." : t("click_upload")}
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
                      title="Volver a lista"
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
                  placeholder="Ej. Carlos G."
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t("label_instagram")}</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="@usuario"
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
                    <span>🌈🕊️ Homenaje "Cruzó el Arcoíris" (Memorial)</span>
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginTop: "2px" }}>
                    Activa un halo celestial especial para mascotas que ya están en las estrellas.
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
                    <span>🎁 Es un regalo para un familiar o amigo</span>
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginTop: "2px" }}>
                    Genera una tarjeta de regalo digital para que el dueño reciba la sorpresa.
                  </span>
                </div>
              </label>
              {isGift && (
                <input
                  type="text"
                  className="form-input"
                  placeholder="Nombre de la persona homenajeada (ej. Para Marta)"
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

        {/* STEP 4: PAYMENT CHECKOUT */}
        {step === 4 && (
          <div>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", marginBottom: "6px" }}>
              {t("step4_heading")} {price}
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: "18px" }}>
              {t("step4_sub")}
            </p>

            <div className="payment-box">
              <div className="payment-summary">
                <span>{t("total_to_pay")}</span>
                <span style={{ color: "var(--accent-gold-dark)", fontSize: "1.3rem" }}>{price}</span>
              </div>

              {/* Causa Solidaria Badge */}
              <div style={{ background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.25)", borderRadius: "var(--radius-sm)", padding: "10px 12px", margin: "14px 0", display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "1.3rem" }}>🐾</span>
                <div>
                  <span style={{ fontWeight: 800, fontSize: "0.82rem", color: "#065F46", display: "block" }}>
                    Causa Solidaria: 1 Inscripción = 1 Huella de Ayuda
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "#047857" }}>
                    El 20% de tu aportación se dona este mes a protectoras y refugios para alimentar y cuidar a animales sin hogar.
                  </span>
                </div>
              </div>

              {/* Payment Tabs */}
              <div className="payment-methods-tabs">
                <button
                  type="button"
                  className={`pay-tab-btn ${payMethod === "card" ? "active" : ""}`}
                  onClick={() => setPayMethod("card")}
                >
                  <CreditCard size={15} />
                  <span>{t("tab_card")}</span>
                </button>
                <button
                  type="button"
                  className={`pay-tab-btn ${payMethod === "express" ? "active" : ""}`}
                  onClick={() => setPayMethod("express")}
                >
                  <span>🍎 Apple / GPay</span>
                </button>
                <button
                  type="button"
                  className={`pay-tab-btn ${payMethod === "bizum" ? "active" : ""}`}
                  onClick={() => setPayMethod("bizum")}
                >
                  <Smartphone size={15} />
                  <span>{t("tab_bizum")}</span>
                </button>
              </div>

              {/* Method Card */}
              {payMethod === "card" && (
                <div>
                  <div className="form-group">
                    <label className="form-label">{t("card_number")}</label>
                    <input
                      type="text"
                      className="form-input"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                    />
                  </div>
                  <div className="form-row-2col">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">{t("card_exp")}</label>
                      <input
                        type="text"
                        className="form-input"
                        value={cardExp}
                        onChange={(e) => setCardExp(e.target.value)}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">{t("card_cvc")}</label>
                      <input
                        type="text"
                        className="form-input"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Method Express */}
              {payMethod === "express" && (
                <div style={{ textAlign: "center", padding: "16px 0" }}>
                  <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "12px" }}>
                    1-Click Apple Pay / Google Pay.
                  </p>
                  <div
                    style={{
                      background: "#000000",
                      color: "#FFFFFF",
                      padding: "12px",
                      borderRadius: "var(--radius-md)",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      cursor: "pointer",
                    }}
                  >
                    <span>Apple Pay / Google Pay ({price})</span>
                  </div>
                </div>
              )}

              {/* Method Bizum */}
              {payMethod === "bizum" && (
                <div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Teléfono móvil Bizum</label>
                    <input
                      type="text"
                      className="form-input"
                      value={bizumPhone}
                      onChange={(e) => setBizumPhone(e.target.value)}
                    />
                  </div>
                </div>
              )}
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
