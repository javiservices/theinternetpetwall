import React, { useState, useEffect } from "react";
import { X, Save, Star, Bone, Image as ImageIcon, MapPin, User, Award } from "lucide-react";
import {
  getAllCountries,
  getStatesForCountry,
  getCitiesForState,
  parsePetLocation,
} from "../../data/worldLocations";

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

  // Initialize or re-parse location on mount
  useEffect(() => {
    if (!pet) return;
    const loc = parsePetLocation(pet.city, pet);
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

    const statesList = getStatesForCountry(initialCountryCode);
    setStates(statesList);

    // Find state object
    const matchedState = statesList.find(
      (s) => s.name.toLowerCase() === initialState.toLowerCase() || s.code === initialState
    );
    if (matchedState) {
      const citiesList = getCitiesForState(initialCountryCode, matchedState.code, matchedState.name);
      setCities(citiesList);
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
    const matched = states.find((s) => s.code === stateVal || s.name === stateVal);
    const stateName = matched ? matched.name : stateVal;
    const stateCode = matched ? matched.code : stateVal;

    const citiesList = getCitiesForState(formData.countryCode, stateCode, stateName);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const updated = {
      ...pet,
      ...formData,
      treats: Math.max(0, parseInt(formData.treats, 10) || 0),
    };
    onSave(updated);
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-content"
        style={{ maxWidth: "720px", maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <button className="modal-close-btn" onClick={onClose} aria-label="Cerrar">
          <X size={18} />
        </button>

        <div style={{ padding: "4px 44px 20px 0", borderBottom: "1px solid var(--border-subtle)", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "var(--radius-sm)",
                background: "linear-gradient(135deg, #3B82F6, #1D4ED8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
              }}
            >
              ✏️
            </div>
            <div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800, fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}>
                Editar Mascota: {pet.name}
              </h2>
              <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                Placa Oficial: <strong style={{ color: "var(--accent-gold-dark)" }}>{pet.code}</strong> (ID: {pet.id})
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Main Info Row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "16px" }}>
            <div className="form-group">
              <label className="form-label">Nombre de la Mascota *</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tipo de Mascota *</label>
              <select
                className="form-input"
                value={formData.type}
                onChange={(e) => handleChange("type", e.target.value)}
              >
                <option value="dog">🐶 Perro</option>
                <option value="cat">🐱 Gato</option>
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
              />
            </div>
          </div>

          {/* Location Fields */}
          <div style={{ background: "var(--bg-warm)", padding: "16px", borderRadius: "var(--radius-md)", marginBottom: "16px", border: "1px solid var(--border-subtle)" }}>
            <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
              <MapPin size={15} color="#D97706" />
              <span>Ubicación Geográfica</span>
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                  País
                </label>
                <select
                  className="form-input"
                  value={formData.countryCode}
                  onChange={handleCountryChange}
                  style={{ fontSize: "0.85rem" }}
                >
                  {countries.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                  Provincia / Estado
                </label>
                {states.length > 0 ? (
                  <select
                    className="form-input"
                    value={formData.state}
                    onChange={handleStateChange}
                    style={{ fontSize: "0.85rem" }}
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
                    placeholder="Escribe estado/provincia"
                    style={{ fontSize: "0.85rem" }}
                  />
                )}
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                  Localidad / Ciudad
                </label>
                {cities.length > 0 ? (
                  <select
                    className="form-input"
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    style={{ fontSize: "0.85rem" }}
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
                    placeholder="Escribe ciudad o pueblo"
                    style={{ fontSize: "0.85rem" }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Photo URL & Preview */}
          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <ImageIcon size={15} color="#3B82F6" />
              <span>URL de la Fotografía *</span>
            </label>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <input
                type="url"
                className="form-input"
                value={formData.photoUrl}
                onChange={(e) => handleChange("photoUrl", e.target.value)}
                required
                style={{ flex: 1 }}
              />
              {formData.photoUrl && (
                <div style={{ width: "48px", height: "48px", borderRadius: "var(--radius-sm)", overflow: "hidden", border: "2px solid var(--border-subtle)", flexShrink: 0 }}>
                  <img
                    src={formData.photoUrl}
                    alt="Preview"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Dedication Quote */}
          <div className="form-group" style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label className="form-label" style={{ margin: 0 }}>Frase o Dedicatoria para el Muro</label>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: (formData.quote?.length || 0) >= 180 ? ((formData.quote?.length || 0) >= 200 ? "#EF4444" : "#F59E0B") : "var(--text-muted)",
                  transition: "color 0.2s ease",
                }}
              >
                {formData.quote?.length || 0} / 200
              </span>
            </div>
            <textarea
              className="form-input"
              rows={3}
              value={formData.quote}
              maxLength={200}
              onChange={(e) => handleChange("quote", e.target.value)}
              placeholder="Dedicatoria memorable..."
              style={{ resize: "vertical" }}
            />
          </div>

          {/* Owner & Instagram */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div className="form-group">
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <User size={14} color="#71717A" />
                <span>Nombre del Humano / Dueño</span>
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.owner}
                onChange={(e) => handleChange("owner", e.target.value)}
                placeholder="Ej. Carlos M."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Usuario de Instagram</label>
              <input
                type="text"
                className="form-input"
                value={formData.instagram}
                onChange={(e) => handleChange("instagram", e.target.value)}
                placeholder="Ej. @mipeludo"
              />
            </div>
          </div>

          {/* VIP status & Treats & Memorial */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "24px", background: "var(--bg-subtle)", padding: "16px", borderRadius: "var(--radius-md)" }}>
            <div>
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Bone size={15} color="#D97706" />
                <span>Contador de Chuches</span>
              </label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={formData.treats}
                onChange={(e) => handleChange("treats", e.target.value)}
              />
            </div>

            <div>
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Star size={15} color="#F59E0B" />
                <span>Membresía VIP</span>
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 14px",
                  background: formData.isVip ? "rgba(245, 158, 11, 0.12)" : "var(--bg-surface)",
                  border: formData.isVip ? "1.5px solid #F59E0B" : "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-md)",
                  cursor: "pointer",
                  marginTop: "4px",
                }}
              >
                <input
                  type="checkbox"
                  checked={formData.isVip}
                  onChange={(e) => handleChange("isVip", e.target.checked)}
                  style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "#D97706" }}
                />
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: formData.isVip ? "#B45309" : "var(--text-secondary)" }}>
                  {formData.isVip ? "⭐ Marco VIP" : "Estándar"}
                </span>
              </label>
            </div>

            <div>
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span>🌈</span>
                <span>Homenaje Memorial</span>
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 14px",
                  background: formData.isMemorial ? "rgba(59, 130, 246, 0.12)" : "var(--bg-surface)",
                  border: formData.isMemorial ? "1.5px solid #3B82F6" : "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-md)",
                  cursor: "pointer",
                  marginTop: "4px",
                }}
              >
                <input
                  type="checkbox"
                  checked={formData.isMemorial}
                  onChange={(e) => handleChange("isMemorial", e.target.checked)}
                  style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "#3B82F6" }}
                />
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: formData.isMemorial ? "#1D4ED8" : "var(--text-secondary)" }}>
                  {formData.isMemorial ? "🌈 En el Arcoíris" : "En Vida"}
                </span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", paddingTop: "16px", borderTop: "1px solid var(--border-subtle)" }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Save size={16} />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
