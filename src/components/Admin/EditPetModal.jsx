import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Save,
  Star,
  Bone,
  Image as ImageIcon,
  MapPin,
  User,
  Sparkles,
  Upload,
  Link as LinkIcon,
  Copy,
  Check,
  Loader2,
  Plus,
  Minus,
  MessageSquare,
  Heart,
  Award,
} from "lucide-react";
import {
  getAllCountries,
  getStatesForCountry,
  getCitiesForState,
  parsePetLocation,
} from "../../data/worldLocations";
import { apiService } from "../../services/api";

export function EditPetModal({ pet, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: pet?.name || "",
    type: pet?.type || "dog",
    breed: pet?.breed || "",
    photoUrl: pet?.photoUrl || "",
    quote: pet?.quote || "",
    owner: pet?.owner || "",
    instagram: pet?.instagram || "",
    isVip: Boolean(pet?.isVip),
    isMemorial: Boolean(pet?.isMemorial),
    treats: pet?.treats || 0,
    countryCode: pet?.countryCode || "ES",
    country: pet?.country || "España",
    state: pet?.state || "",
    city: pet?.city || "",
  });

  const [countries] = useState(() => getAllCountries("es"));
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [showManualUrl, setShowManualUrl] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef(null);

  // Initialize or re-parse location on mount
  useEffect(() => {
    if (!pet) return;
    try {
      const loc = parsePetLocation(pet.city, pet) || {};
      const initialCountryCode = pet.countryCode || loc.countryCode || "ES";
      const initialCountryName = pet.country || loc.countryName || "España";
      const initialState = pet.state || loc.stateName || "";
      const initialCity = loc.cityName || pet.city || "";

      setFormData((prev) => ({
        ...prev,
        countryCode: initialCountryCode,
        country: initialCountryName,
        state: initialState,
        city: initialCity,
      }));

      const statesList = getStatesForCountry(initialCountryCode) || [];
      setStates(statesList);

      const stateStr = String(initialState || "").toLowerCase();
      const matchedState = statesList.find(
        (s) => (s?.name && s.name.toLowerCase() === stateStr) || s?.code === initialState
      );
      if (matchedState) {
        const citiesList = getCitiesForState(initialCountryCode, matchedState.code, matchedState.name) || [];
        setCities(citiesList);
      }
    } catch (err) {
      console.error("Error setting up EditPetModal location:", err);
    }
  }, [pet]);

  if (!pet) return null;

  // Handle Country change
  const handleCountryChange = (e) => {
    const code = e.target.value;
    const found = countries.find((c) => c.code === code);
    const countryName = found ? found.name : "";
    const statesList = getStatesForCountry(code);

    setStates(statesList);
    setCities([]);
    setFormData((prev) => ({
      ...prev,
      countryCode: code,
      country: countryName,
      state: "",
      city: "",
    }));
  };

  // Handle State change
  const handleStateChange = (e) => {
    const stateVal = e.target.value;
    const matched = states.find((s) => s?.code === stateVal || s?.name === stateVal);
    const stateName = matched ? matched.name : stateVal;
    const stateCode = matched ? matched.code : stateVal;

    const citiesList = getCitiesForState(formData.countryCode, stateCode, stateName) || [];
    setCities(citiesList);

    setFormData((prev) => ({
      ...prev,
      state: stateName,
      city: "",
    }));
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const url = await apiService.uploadPetPhoto(file);
      if (url) {
        setFormData((prev) => ({ ...prev, photoUrl: url }));
      }
    } catch (err) {
      console.error("Error subiendo foto:", err);
      alert("No se pudo subir la foto a Supabase. Introduce la URL manualmente.");
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCopyId = () => {
    if (navigator?.clipboard && pet?.id) {
      navigator.clipboard.writeText(String(pet.id));
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const updated = {
        ...pet,
        ...formData,
        treats: Math.max(0, parseInt(formData.treats, 10) || 0),
      };
      await onSave(updated);
    } finally {
      setIsSubmitting(false);
    }
  };

  const quoteLength = formData.quote?.length || 0;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1200 }}>
      <div
        className="modal-content edit-pet-modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Modern Header */}
        <div className="edit-pet-modal-header">
          <div className="edit-pet-header-left">
            <div className="edit-pet-header-icon">
              <Sparkles size={22} />
            </div>
            <div>
              <h2 className="edit-pet-header-title">
                Editar Ficha: {formData.name || pet?.name || "Mascota"}
              </h2>
              <div className="edit-pet-header-badges">
                <span className="edit-pet-badge-code">
                  🏷️ {pet?.code || "PET"}
                </span>

                {formData.isVip ? (
                  <span className="edit-pet-badge-vip">⭐ VIP</span>
                ) : (
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Estándar</span>
                )}

                {formData.isMemorial && (
                  <span className="edit-pet-badge-memorial">🌈 Memorial</span>
                )}

                <button
                  type="button"
                  onClick={handleCopyId}
                  className="edit-pet-badge-id"
                  title="Copiar ID de base de datos"
                >
                  {copiedId ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
                  <span>{copiedId ? "¡Copiado!" : `ID: ${String(pet?.id || "").slice(0, 8)}...`}</span>
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Cerrar modal"
            style={{ position: "static" }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div className="edit-pet-modal-body">
            {/* 1. Hero Photo Card */}
            <div className="edit-pet-photo-card">
              <div
                className="edit-pet-photo-preview-wrap"
                onClick={() => fileInputRef.current?.click()}
                title="Haz clic para cambiar la fotografía"
              >
                <img
                  src={formData.photoUrl || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400"}
                  alt={formData.name}
                />
                <div className="edit-pet-photo-overlay">
                  {isUploadingPhoto ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      <Upload size={16} />
                      <span>Cambiar</span>
                    </>
                  )}
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                style={{ display: "none" }}
              />

              <div className="edit-pet-photo-info">
                <h4 className="edit-pet-photo-title">Fotografía Oficial</h4>
                <p className="edit-pet-photo-desc">
                  Sube una foto nítida de la mascota. Se optimiza y aloja automáticamente en el CDN de Supabase con certificado SSL.
                </p>

                <div className="edit-pet-photo-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    style={{ fontSize: "0.8rem", padding: "6px 14px", height: "34px" }}
                  >
                    {isUploadingPhoto ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Subiendo...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={14} />
                        <span>Subir Nueva Foto</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowManualUrl((prev) => !prev)}
                    style={{ fontSize: "0.8rem", padding: "6px 12px", height: "34px" }}
                  >
                    <LinkIcon size={14} />
                    <span>{showManualUrl ? "Ocultar URL" : "Editar URL"}</span>
                  </button>
                </div>

                {showManualUrl && (
                  <div style={{ marginTop: "10px" }}>
                    <input
                      type="url"
                      className="form-input"
                      value={formData.photoUrl}
                      onChange={(e) => handleChange("photoUrl", e.target.value)}
                      placeholder="https://..."
                      style={{ fontSize: "0.8rem", padding: "8px 12px" }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 2. Core Pet Details */}
            <div className="edit-pet-section">
              <div className="edit-pet-section-title">
                <User size={15} color="#D97706" />
                <span>Información de la Mascota</span>
              </div>

              <div className="edit-pet-grid-3">
                <div className="form-group">
                  <label className="form-label">Nombre de la Mascota *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    required
                    placeholder="Ej. Dana"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tipo de Animal *</label>
                  <select
                    className="form-input"
                    value={formData.type}
                    onChange={(e) => handleChange("type", e.target.value)}
                  >
                    <option value="dog">🐶 Perro</option>
                    <option value="cat">🐱 Gato</option>
                    <option value="rabbit">🐰 Conejo</option>
                    <option value="bird">🦜 Ave</option>
                    <option value="other">🐾 Otro animal</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Raza / Descripción *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.breed}
                    onChange={(e) => handleChange("breed", e.target.value)}
                    required
                    placeholder="Ej. Staffy, Mestizo..."
                  />
                </div>
              </div>
            </div>

            {/* 3. Owner & Social */}
            <div className="edit-pet-section">
              <div className="edit-pet-section-title">
                <Heart size={15} color="#E11D48" />
                <span>Tutor & Redes Sociales</span>
              </div>

              <div className="edit-pet-grid-2">
                <div className="form-group">
                  <label className="form-label">Nombre del Humano / Dueño</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.owner}
                    onChange={(e) => handleChange("owner", e.target.value)}
                    placeholder="Ej. Javi Labarum"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Usuario de Instagram</label>
                  <div style={{ position: "relative" }}>
                    <span
                      style={{
                        position: "absolute",
                        left: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "var(--text-muted)",
                        fontWeight: 600,
                      }}
                    >
                      @
                    </span>
                    <input
                      type="text"
                      className="form-input"
                      value={typeof formData.instagram === "string" ? formData.instagram.replace(/^@/, "") : ""}
                      onChange={(e) => handleChange("instagram", e.target.value ? `@${e.target.value.replace(/^@/, "")}` : "")}
                      placeholder="javilabarum"
                      style={{ paddingLeft: "30px" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Geographic Location */}
            <div className="edit-pet-section">
              <div className="edit-pet-section-title">
                <MapPin size={15} color="#10B981" />
                <span>Ubicación Geográfica</span>
              </div>

              <div className="edit-pet-grid-3">
                <div className="form-group">
                  <label className="form-label">País</label>
                  <select
                    className="form-input"
                    value={formData.countryCode}
                    onChange={handleCountryChange}
                  >
                    {countries.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Provincia / Estado</label>
                  {states.length > 0 ? (
                    <select
                      className="form-input"
                      value={formData.state}
                      onChange={handleStateChange}
                    >
                      <option value="">-- Selecciona --</option>
                      {states.map((s) => (
                        <option key={s.code} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      className="form-input"
                      value={formData.state}
                      onChange={(e) => handleChange("state", e.target.value)}
                      placeholder="Provincia"
                    />
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Localidad / Municipio</label>
                  {cities.length > 0 ? (
                    <select
                      className="form-input"
                      value={formData.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                    >
                      <option value="">-- Selecciona --</option>
                      {cities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      className="form-input"
                      value={formData.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      placeholder="Localidad"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* 5. Dedication Quote */}
            <div className="edit-pet-section">
              <div className="edit-pet-section-title">
                <MessageSquare size={15} color="#6366F1" />
                <span>Dedicatoria en el Muro</span>
              </div>

              <div className="edit-pet-quote-card">
                <textarea
                  className="edit-pet-quote-textarea"
                  rows={3}
                  value={formData.quote}
                  maxLength={200}
                  onChange={(e) => handleChange("quote", e.target.value)}
                  placeholder="Escribe unas palabras de amor, anécdotas o dedicatoria..."
                />

                <div className="edit-pet-char-meter">
                  <span style={{ color: "var(--text-muted)" }}>
                    Visible en la ficha pública y el pasaporte
                  </span>
                  <span
                    style={{
                      color:
                        quoteLength >= 195
                          ? "#EF4444"
                          : quoteLength >= 170
                          ? "#F59E0B"
                          : "var(--text-muted)",
                    }}
                  >
                    {quoteLength} / 200
                  </span>
                </div>
              </div>
            </div>

            {/* 6. Statuses & Treats */}
            <div className="edit-pet-section">
              <div className="edit-pet-section-title">
                <Award size={15} color="#F59E0B" />
                <span>Membresía, Memorial y Gamificación</span>
              </div>

              <div className="edit-pet-status-grid">
                {/* Treat Counter */}
                <div
                  style={{
                    padding: "14px 16px",
                    borderRadius: "14px",
                    border: "1.5px solid var(--border-subtle)",
                    background: "var(--bg-surface)",
                  }}
                >
                  <label
                    style={{
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      color: "var(--text-secondary)",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      marginBottom: "6px",
                    }}
                  >
                    <Bone size={15} color="#D97706" />
                    <span>Chuches Recibidas</span>
                  </label>

                  <div className="edit-pet-treat-stepper">
                    <button
                      type="button"
                      className="edit-pet-stepper-btn"
                      onClick={() =>
                        handleChange("treats", Math.max(0, (parseInt(formData.treats, 10) || 0) - 1))
                      }
                      title="Restar una chuche"
                    >
                      <Minus size={15} />
                    </button>
                    <input
                      type="number"
                      min="0"
                      className="form-input"
                      value={formData.treats}
                      onChange={(e) =>
                        handleChange("treats", Math.max(0, parseInt(e.target.value, 10) || 0))
                      }
                      style={{ textAlign: "center", fontWeight: 700, fontSize: "1rem" }}
                    />
                    <button
                      type="button"
                      className="edit-pet-stepper-btn"
                      onClick={() =>
                        handleChange("treats", (parseInt(formData.treats, 10) || 0) + 1)
                      }
                      title="Sumar una chuche"
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                </div>

                {/* VIP Membership Switch */}
                <div
                  className={`edit-pet-status-card ${formData.isVip ? "active-vip" : ""}`}
                  onClick={() => handleChange("isVip", !formData.isVip)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleChange("isVip", !formData.isVip);
                    }
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Star size={16} fill={formData.isVip ? "#F59E0B" : "none"} color="#F59E0B" />
                      <span style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--text-primary)" }}>
                        Membresía VIP
                      </span>
                    </div>
                    <span style={{ fontSize: "0.75rem", color: formData.isVip ? "#B45309" : "var(--text-muted)" }}>
                      {formData.isVip ? "⭐ Marco Dorado activo" : "Placa Estándar"}
                    </span>
                  </div>

                  <div className={`admin-switch-track ${formData.isVip ? "active active-vip" : ""}`}>
                    <div className="admin-switch-thumb" />
                  </div>
                </div>

                {/* Memorial Rainbow Switch */}
                <div
                  className={`edit-pet-status-card ${formData.isMemorial ? "active-memorial" : ""}`}
                  onClick={() => handleChange("isMemorial", !formData.isMemorial)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleChange("isMemorial", !formData.isMemorial);
                    }
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "16px" }}>🌈</span>
                      <span style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--text-primary)" }}>
                        Puente Arcoíris
                      </span>
                    </div>
                    <span style={{ fontSize: "0.75rem", color: formData.isMemorial ? "#1D4ED8" : "var(--text-muted)" }}>
                      {formData.isMemorial ? "Eterno en el Arcoíris" : "Compañero en vida"}
                    </span>
                  </div>

                  <div className={`admin-switch-track ${formData.isMemorial ? "active active-memorial" : ""}`}>
                    <div className="admin-switch-thumb" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modern Footer */}
          <div className="edit-pet-modal-footer">
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
              <Sparkles size={14} color="#F59E0B" />
              <span>Los cambios se sincronizan en tiempo real con Supabase</span>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={onClose}
                disabled={isSubmitting}
                style={{ padding: "8px 18px", fontSize: "0.88rem" }}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 22px",
                  fontSize: "0.88rem",
                  fontWeight: 700,
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Guardar Cambios</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
