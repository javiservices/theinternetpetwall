import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  KeyRound,
  LogOut,
  ExternalLink,
  Search,
  Star,
  Bone,
  Trash2,
  Edit3,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Eye,
  Flag,
} from "lucide-react";
import {
  getAdminPin,
  setAdminPin,
  updatePetInStorage,
  deletePetFromStorage,
  togglePetVipInStorage,
  setPetTreatsInStorage,
  exportPetsBackup,
  importPetsBackup,
  resetPetsStorage,
  getReportedPets,
  dismissReportInStorage,
} from "../../utils/storage";
import { parsePetLocation } from "../../data/worldLocations";
import { EditPetModal } from "./EditPetModal";
import { ModalErrorBoundary } from "./ModalErrorBoundary";
import { apiService } from "../../services/api";

export function AdminDashboard({ pets, onPetsChange }) {

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem("petwall_admin_auth") === "true";
  });
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [backendHealth, setBackendHealth] = useState(null);

  // Navigation / Tabs
  const [activeTab, setActiveTab] = useState("pets"); // 'pets' | 'backup' | 'reports' | 'settings'

  React.useEffect(() => {
    if (isAuthenticated) {
      apiService.checkBackendHealth().then((data) => setBackendHealth(data));
    }
  }, [isAuthenticated, activeTab]);

  // Table Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // 'all' | 'dog' | 'cat' | 'other' | 'vip' | 'reported'
  const [sortBy, setSortBy] = useState("date-desc"); // 'date-desc' | 'treats-desc' | 'name-asc' | 'code-asc'

  // Modals & Actions
  const [editingPet, setEditingPet] = useState(null);
  const [deletingPet, setDeletingPet] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState(null); // { type: 'success' | 'error', text: '' }

  // Admin PIN settings
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinChangeStatus, setPinChangeStatus] = useState("");

  // Reports
  const reports = useMemo(() => getReportedPets(), [pets, feedbackMsg]);

  // Flash feedback message helper
  const showFeedback = (text, type = "success") => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // Handle Login
  const handlePinSubmit = (e) => {
    e.preventDefault();
    const correctPin = getAdminPin();
    if (pinInput.trim() === correctPin.trim()) {
      setIsAuthenticated(true);
      sessionStorage.setItem("petwall_admin_auth", "true");
      setPinError("");
      setPinInput("");
    } else {
      setPinError("PIN incorrecto. Vuelve a intentarlo.");
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("petwall_admin_auth");
  };

  // Handle Update Pet
  const handleSavePet = async (updatedPet) => {
    const updatedList = await apiService.updatePet(updatedPet);
    onPetsChange(updatedList);
    setEditingPet(null);
    showFeedback(`¡Ficha de ${updatedPet.name} actualizada con éxito!`);
  };

  // Handle Toggle VIP
  const handleToggleVip = async (petId) => {
    const current = pets.find((p) => p.id === petId);
    if (!current) return;
    const updatedPet = { ...current, isVip: !current.isVip };
    const updatedList = await apiService.updatePet(updatedPet);
    onPetsChange(updatedList);
    showFeedback(`${updatedPet.name} ahora es ${updatedPet.isVip ? "VIP Dorado ⭐" : "Estándar"}.`);
  };

  // Handle Quick Treats Change
  const handleTreatsPrompt = async (pet) => {
    const input = prompt(`Modificar contador de chuches para ${pet.name}:`, pet.treats || 0);
    if (input !== null) {
      const val = parseInt(input, 10);
      if (!isNaN(val) && val >= 0) {
        const updatedPet = { ...pet, treats: val };
        const updatedList = await apiService.updatePet(updatedPet);
        onPetsChange(updatedList);
        showFeedback(`Chuches de ${pet.name} actualizadas a ${val}.`);
      }
    }
  };

  // Handle Delete Pet
  const handleConfirmDelete = async () => {
    if (!deletingPet) return;
    const petName = deletingPet.name;
    const updatedList = await apiService.deletePet(deletingPet.id);
    onPetsChange(updatedList);
    setDeletingPet(null);
    showFeedback(`Mascota "${petName}" eliminada del muro.`, "error");
  };

  // Backup: Export JSON
  const handleExportBackup = () => {
    const jsonStr = exportPetsBackup();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const dateStr = new Date().toISOString().split("T")[0];
    a.href = url;
    a.download = `petwall_backup_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showFeedback("Copia de seguridad descargada en tu equipo.");
  };

  // Backup: Import JSON
  const handleImportBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result;
        const imported = importPetsBackup(content);
        onPetsChange(imported);
        showFeedback(`¡Copia de seguridad restaurada con éxito! (${imported.length} mascotas).`);
        e.target.value = "";
      } catch (err) {
        alert("Error al importar archivo: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  // Backup: Reset to initial demo data
  const handleResetToDemo = () => {
    if (
      window.confirm(
        "¿Estás seguro de que deseas restablecer la base de datos a las mascotas iniciales de demostración? Esta acción no se puede deshacer."
      )
    ) {
      const resetList = resetPetsStorage();
      onPetsChange(resetList);
      showFeedback("Muro restablecido a los datos de demostración iniciales.");
    }
  };

  // Dismiss a user report
  const handleDismissReport = (petId) => {
    dismissReportInStorage(petId);
    showFeedback("Reporte descartado. La mascota se mantiene publicada.");
  };

  // Handle Change Admin PIN
  const handleChangePinSubmit = (e) => {
    e.preventDefault();
    if (newPin.length < 4) {
      setPinChangeStatus("El PIN debe tener al menos 4 dígitos.");
      return;
    }
    if (newPin !== confirmPin) {
      setPinChangeStatus("Los PINs no coinciden.");
      return;
    }
    setAdminPin(newPin);
    setPinChangeStatus("¡PIN maestro actualizado con éxito!");
    setNewPin("");
    setConfirmPin("");
    setTimeout(() => setPinChangeStatus(""), 4000);
  };

  // Filtered & Sorted Pets
  const filteredPets = useMemo(() => {
    let result = [...pets];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.code && p.code.toLowerCase().includes(q)) ||
          (p.breed && p.breed.toLowerCase().includes(q)) ||
          (p.city && p.city.toLowerCase().includes(q)) ||
          (p.owner && p.owner.toLowerCase().includes(q))
      );
    }

    // Type / Status filter
    if (typeFilter === "dog") result = result.filter((p) => p.type === "dog");
    else if (typeFilter === "cat") result = result.filter((p) => p.type === "cat");
    else if (typeFilter === "other") result = result.filter((p) => p.type === "other");
    else if (typeFilter === "vip") result = result.filter((p) => p.isVip);
    else if (typeFilter === "reported") {
      const reportedIds = reports.map((r) => r.petId);
      result = result.filter((p) => reportedIds.includes(p.id));
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "treats-desc") return (b.treats || 0) - (a.treats || 0);
      if (sortBy === "name-asc") return (a.name || "").localeCompare(b.name || "");
      if (sortBy === "code-asc") return (a.code || "").localeCompare(b.code || "");
      // default: date desc (using array order as newest first or date)
      return 0;
    });

    return result;
  }, [pets, searchQuery, typeFilter, sortBy, reports]);

  // Overall KPIs
  const totalPets = pets.length;
  const vipCount = pets.filter((p) => p.isVip).length;
  const standardCount = totalPets - vipCount;
  const estimatedRevenue = standardCount * 1 + vipCount * 2; // 1€ estándar, 2€ VIP
  const totalTreats = pets.reduce((acc, p) => acc + (p.treats || 0), 0);
  const totalCountries = useMemo(() => {
    const set = new Set();
    pets.forEach((p) => {
      const loc = parsePetLocation(p.city, p);
      if (loc.countryCode && loc.countryCode !== "GL") set.add(loc.countryCode);
    });
    return Math.max(set.size, 1);
  }, [pets]);

  // ==========================================
  // RENDER: Lock Screen (PIN Required)
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="admin-lock-screen">
        <div className="admin-lock-card">
          <div className="admin-lock-icon-wrap">
            <Shield size={36} color="#D97706" />
          </div>
          <h1 className="admin-lock-title">Panel de Control Propietario</h1>
          <p className="admin-lock-subtitle">
            Introduce el PIN maestro de seguridad para acceder a la administración interna de la plataforma.
          </p>

          <form onSubmit={handlePinSubmit} className="admin-lock-form">
            <div className="admin-pin-field-wrap">
              <KeyRound size={18} className="admin-pin-icon" />
              <input
                type="password"
                className="admin-pin-input"
                placeholder="Introduce tu PIN (ej: 1234)"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError("");
                }}
                maxLength={8}
                autoFocus
              />
            </div>

            {pinError && <div className="admin-lock-error">{pinError}</div>}

            <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "12px 20px" }}>
              <Lock size={16} />
              <span>Desbloquear Administración</span>
            </button>
          </form>

          <div className="admin-lock-footer">
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              🔑 PIN por defecto de demostración: <strong style={{ color: "var(--accent-gold-dark)" }}>1234</strong>
            </p>
            <Link to="/" style={{ fontSize: "0.82rem", color: "var(--text-secondary)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px", marginTop: "12px" }}>
              ← Volver al Muro Público
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: Authenticated Admin Dashboard
  // ==========================================
  return (
    <div className="admin-dashboard-layout">
      {/* Top Navbar */}
      <header className="admin-topbar">
        <div className="container admin-topbar-inner">
          <div className="admin-brand">
            <div className="admin-badge-icon">🎛️</div>
            <div>
              <h1 className="admin-topbar-title">Administración Interna</h1>
              <span className="admin-topbar-badge">Modo Administrador Propietario</span>
            </div>
          </div>

          <div className="admin-topbar-actions">
            <Link to="/wall" className="btn-secondary" style={{ padding: "8px 14px", fontSize: "0.82rem" }} target="_blank">
              <ExternalLink size={14} />
              <span>Ver Muro en Vivo</span>
            </Link>

            <button
              className="btn-secondary"
              onClick={handleLogout}
              style={{ padding: "8px 14px", fontSize: "0.82rem", color: "#EF4444", borderColor: "rgba(239, 68, 68, 0.2)" }}
            >
              <LogOut size={14} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* Floating Feedback Alert */}
      {feedbackMsg && (
        <div className={`admin-toast ${feedbackMsg.type === "error" ? "admin-toast-error" : "admin-toast-success"}`}>
          {feedbackMsg.type === "error" ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      <main className="container" style={{ padding: "32px 16px 64px" }}>
        {/* KPI Metrics Row */}
        <section className="admin-kpi-grid">
          <div className="admin-kpi-card">
            <div className="admin-kpi-header">
              <span className="admin-kpi-label">Total Mascotas</span>
              <span className="admin-kpi-icon" style={{ background: "#EFF6FF", color: "#3B82F6" }}>🐾</span>
            </div>
            <div className="admin-kpi-value">{totalPets}</div>
            <div className="admin-kpi-detail">
              <span>{pets.filter((p) => p.type === "dog").length} perros</span> ·{" "}
              <span>{pets.filter((p) => p.type === "cat").length} gatos</span> ·{" "}
              <span>{pets.filter((p) => p.type === "other").length} otros</span>
            </div>
          </div>

          <div className="admin-kpi-card">
            <div className="admin-kpi-header">
              <span className="admin-kpi-label">Mascotas VIP</span>
              <span className="admin-kpi-icon" style={{ background: "#FEF3C7", color: "#D97706" }}>⭐</span>
            </div>
            <div className="admin-kpi-value" style={{ color: "#B45309" }}>{vipCount}</div>
            <div className="admin-kpi-detail">
              <span>{Math.round((vipCount / (totalPets || 1)) * 100)}% de conversión VIP</span>
            </div>
          </div>

          <div className="admin-kpi-card">
            <div className="admin-kpi-header">
              <span className="admin-kpi-label">Recaudación Estimada</span>
              <span className="admin-kpi-icon" style={{ background: "#ECFDF5", color: "#10B981" }}>💶</span>
            </div>
            <div className="admin-kpi-value" style={{ color: "#059669" }}>{estimatedRevenue} €</div>
            <div className="admin-kpi-detail">
              <span>{standardCount} estándar (1€) + {vipCount} VIP (2€)</span>
            </div>
          </div>

          <div className="admin-kpi-card">
            <div className="admin-kpi-header">
              <span className="admin-kpi-label">Chuches Repartidas</span>
              <span className="admin-kpi-icon" style={{ background: "#FFFBEB", color: "#F59E0B" }}>🦴</span>
            </div>
            <div className="admin-kpi-value">{totalTreats}</div>
            <div className="admin-kpi-detail">
              <span>{totalCountries} países representados</span>
            </div>
          </div>
        </section>

        {/* Navigation Tabs */}
        <div className="admin-tabs">
          <button
            className={`admin-tab-btn ${activeTab === "pets" ? "active" : ""}`}
            onClick={() => setActiveTab("pets")}
          >
            📋 Gestión de Mascotas ({totalPets})
          </button>
          <button
            className={`admin-tab-btn ${activeTab === "reports" ? "active" : ""}`}
            onClick={() => setActiveTab("reports")}
          >
            🚩 Moderación y Reportes {reports.length > 0 && <span className="admin-tab-badge">{reports.length}</span>}
          </button>
          <button
            className={`admin-tab-btn ${activeTab === "backup" ? "active" : ""}`}
            onClick={() => setActiveTab("backup")}
          >
            💾 Copias de Seguridad & Datos
          </button>
          <button
            className={`admin-tab-btn ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            ⚙️ Ajustes & Seguridad
          </button>
        </div>

        {/* ==================================================== */}
        {/* TAB 1: PETS MANAGEMENT (CRUD) */}
        {/* ==================================================== */}
        {activeTab === "pets" && (
          <section className="admin-panel-card">
            {/* Toolbar: Search, Filters, Sort */}
            <div className="admin-toolbar">
              <div className="admin-search-wrap">
                <Search size={16} className="admin-search-icon" />
                <input
                  type="text"
                  className="admin-search-input"
                  placeholder="Buscar por placa, nombre, raza, ciudad, dueño..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button className="admin-search-clear" onClick={() => setSearchQuery("")}>
                    ✕
                  </button>
                )}
              </div>

              <div className="admin-filter-group">
                <select
                  className="admin-select"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">Todos los registros ({totalPets})</option>
                  <option value="vip">Solo VIPs ⭐ ({vipCount})</option>
                  <option value="dog">Solo Perros 🐶</option>
                  <option value="cat">Solo Gatos 🐱</option>
                  <option value="other">Otros Animales 🐾</option>
                  {reports.length > 0 && <option value="reported">Con Reportes 🚩 ({reports.length})</option>}
                </select>

                <select
                  className="admin-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="date-desc">Más recientes primero</option>
                  <option value="treats-desc">Más chuches dadas</option>
                  <option value="name-asc">Nombre (A - Z)</option>
                  <option value="code-asc">Código de Placa</option>
                </select>
              </div>
            </div>

            {/* Results Counter */}
            <div className="admin-table-meta">
              <span>Mostrando {filteredPets.length} de {totalPets} mascotas registradas</span>
              {searchQuery && <span style={{ color: "var(--accent-gold-dark)" }}>— Filtro activo: "{searchQuery}"</span>}
            </div>

            {/* Table */}
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: "64px" }}>Foto</th>
                    <th>Placa</th>
                    <th>Mascota</th>
                    <th>Ubicación</th>
                    <th>Humano</th>
                    <th>Membresía</th>
                    <th>Chuches</th>
                    <th style={{ textAlign: "right", minWidth: "160px" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPets.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: "center", padding: "48px 16px", color: "var(--text-muted)" }}>
                        No se han encontrado mascotas con ese criterio de búsqueda.
                      </td>
                    </tr>
                  ) : (
                    filteredPets.map((pet) => {
                      const loc = parsePetLocation(pet.city, pet);
                      const isReported = reports.some((r) => r.petId === pet.id);

                      return (
                        <tr key={pet.id} className={isReported ? "admin-row-reported" : ""}>
                          {/* Photo thumbnail */}
                          <td>
                            <div className="admin-thumb-wrap">
                              <img
                                src={pet.photoUrl}
                                alt={pet.name}
                                className="admin-thumb-img"
                                onError={(e) => {
                                  e.target.src = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100";
                                }}
                              />
                              {pet.isVip && <span className="admin-thumb-vip">⭐</span>}
                            </div>
                          </td>

                          {/* Plaque Code */}
                          <td>
                            <span className="admin-code-badge">{pet.code}</span>
                          </td>

                          {/* Pet Name & Breed */}
                          <td>
                            <div style={{ fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
                              <span>{pet.name}</span>
                              <span style={{ fontSize: "0.85rem" }}>
                                {pet.type === "dog" ? "🐶" : pet.type === "cat" ? "🐱" : "🐾"}
                              </span>
                              {isReported && (
                                <span className="admin-pill-reported" title="Mascota reportada por usuarios">
                                  <Flag size={10} /> Reportado
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                              {pet.breed}
                            </div>
                          </td>

                          {/* Location */}
                          <td>
                            <div style={{ fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "5px" }}>
                              <span>{loc.flag}</span>
                              <span style={{ fontWeight: 600 }}>{loc.cityName || pet.city}</span>
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                              {loc.stateName ? `${loc.stateName}, ` : ""}{loc.countryName}
                            </div>
                          </td>

                          {/* Human Owner */}
                          <td>
                            <div style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>
                              {pet.owner || "—"}
                            </div>
                            {pet.instagram && (
                              <div style={{ fontSize: "0.75rem", color: "var(--accent-gold-dark)" }}>
                                {pet.instagram}
                              </div>
                            )}
                          </td>

                          {/* VIP Status Toggle */}
                          <td>
                            <button
                              className={`admin-vip-toggle-btn ${pet.isVip ? "active" : ""}`}
                              onClick={() => handleToggleVip(pet.id)}
                              title="Pulsar para alternar membresía VIP"
                            >
                              <Star size={12} fill={pet.isVip ? "#F59E0B" : "none"} />
                              <span>{pet.isVip ? "VIP Oro" : "Estándar"}</span>
                            </button>
                          </td>

                          {/* Treats */}
                          <td>
                            <button
                              className="admin-treats-btn"
                              onClick={() => handleTreatsPrompt(pet)}
                              title="Haz clic para modificar la cantidad de chuches"
                            >
                              <Bone size={13} color="#D97706" />
                              <span>{pet.treats || 0}</span>
                            </button>
                          </td>

                          {/* Action Buttons */}
                          <td style={{ textAlign: "right" }}>
                            <div style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
                              {/* Open live view */}
                              <Link
                                to={`/wall?pet=${pet.code}`}
                                target="_blank"
                                className="admin-action-btn"
                                title="Ver en el muro público"
                              >
                                <Eye size={14} />
                              </Link>

                              {/* Edit Pet */}
                              <button
                                className="admin-action-btn edit"
                                onClick={() => setEditingPet(pet)}
                                title="Editar todos los datos de la mascota"
                              >
                                <Edit3 size={14} />
                              </button>

                              {/* Delete Pet */}
                              <button
                                className="admin-action-btn delete"
                                onClick={() => setDeletingPet(pet)}
                                title="Eliminar mascota permanentemente"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ==================================================== */}
        {/* TAB 2: REPORTS & MODERATION */}
        {/* ==================================================== */}
        {activeTab === "reports" && (
          <section className="admin-panel-card">
            <div style={{ marginBottom: "20px" }}>
              <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                <Flag size={18} color="#EF4444" />
                <span>Panel de Moderación y Denuncias de Usuarios</span>
              </h2>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                Revisa aquí las mascotas marcadas por la comunidad como contenido inapropiado, fotos indebidas o troleo.
              </p>
            </div>

            {reports.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 16px", background: "var(--bg-warm)", borderRadius: "var(--radius-md)" }}>
                <CheckCircle2 size={40} color="#10B981" style={{ margin: "0 auto 12px" }} />
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                  ¡Todo limpio y en orden!
                </h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", maxWidth: "420px", margin: "6px auto 0" }}>
                  No hay reportes de contenido pendientes. Tu muro está protegido y en armonía.
                </p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: "16px" }}>
                {reports.map((report) => {
                  const reportedPet = pets.find((p) => p.id === report.petId);
                  if (!reportedPet) return null;

                  return (
                    <div key={report.petId} className="admin-report-card">
                      <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                        <img
                          src={reportedPet.photoUrl}
                          alt={reportedPet.name}
                          style={{ width: "64px", height: "64px", borderRadius: "var(--radius-sm)", objectFit: "cover" }}
                        />
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <h4 style={{ fontSize: "1rem", fontWeight: 800 }}>{reportedPet.name}</h4>
                            <span className="admin-code-badge">{reportedPet.code}</span>
                            <span style={{ fontSize: "0.78rem", color: "#EF4444", fontWeight: 700 }}>
                              Motivo: {report.reason}
                            </span>
                          </div>
                          <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                            Raza: {reportedPet.breed} | Ciudad: {reportedPet.city} | Dueño: {reportedPet.owner || "Anónimo"}
                          </p>
                          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            Fecha del reporte: {new Date(report.date).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          className="btn-secondary"
                          onClick={() => handleDismissReport(reportedPet.id)}
                          style={{ fontSize: "0.82rem", padding: "8px 14px" }}
                        >
                          <CheckCircle2 size={14} color="#10B981" />
                          <span>Descartar y Mantener</span>
                        </button>

                        <button
                          className="btn-secondary"
                          onClick={() => setEditingPet(reportedPet)}
                          style={{ fontSize: "0.82rem", padding: "8px 14px" }}
                        >
                          <Edit3 size={14} />
                          <span>Editar Foto / Datos</span>
                        </button>

                        <button
                          className="btn-primary"
                          onClick={() => setDeletingPet(reportedPet)}
                          style={{ fontSize: "0.82rem", padding: "8px 14px", background: "#EF4444", borderColor: "#DC2626" }}
                        >
                          <Trash2 size={14} />
                          <span>Eliminar Mascota</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ==================================================== */}
        {/* TAB 3: BACKUP & DATA MANAGEMENT */}
        {/* ==================================================== */}
        {activeTab === "backup" && (
          <section className="admin-panel-card">
            <div style={{ marginBottom: "24px" }}>
              <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                <Download size={18} color="#3B82F6" />
                <span>Copias de Seguridad y Respaldo de Base de Datos</span>
              </h2>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                Descarga una copia completa de las mascotas inscritas o restaura datos en caso de migración o incidencia.
              </p>
            </div>

            <div className="admin-backup-grid">
              {/* Export Box */}
              <div className="admin-backup-box">
                <div className="admin-backup-box-header">
                  <div className="admin-backup-box-icon" style={{ background: "#EFF6FF", color: "#3B82F6" }}>
                    <Download size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>Exportar Copia de Seguridad</h3>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                      Genera un archivo JSON con las {totalPets} mascotas registradas actualmente.
                    </p>
                  </div>
                </div>

                <button
                  className="btn-primary"
                  onClick={handleExportBackup}
                  style={{ width: "100%", justifyContent: "center", marginTop: "16px" }}
                >
                  <Download size={16} />
                  <span>Descargar Copia (.json)</span>
                </button>
              </div>

              {/* Import Box */}
              <div className="admin-backup-box">
                <div className="admin-backup-box-header">
                  <div className="admin-backup-box-icon" style={{ background: "#F0FDF4", color: "#16A34A" }}>
                    <Upload size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>Importar / Restaurar Copia</h3>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                      Sube un archivo `.json` de respaldo previamente exportado.
                    </p>
                  </div>
                </div>

                <label className="btn-secondary" style={{ width: "100%", justifyContent: "center", marginTop: "16px", cursor: "pointer" }}>
                  <Upload size={16} />
                  <span>Seleccionar Archivo JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    style={{ display: "none" }}
                  />
                </label>
              </div>

              {/* Reset to Demo Box */}
              <div className="admin-backup-box" style={{ borderColor: "rgba(239, 68, 68, 0.25)" }}>
                <div className="admin-backup-box-header">
                  <div className="admin-backup-box-icon" style={{ background: "#FEF2F2", color: "#EF4444" }}>
                    <RefreshCw size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#DC2626" }}>Restablecer de Fábrica</h3>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                      Restaura el muro con las 12 mascotas de demostración iniciales.
                    </p>
                  </div>
                </div>

                <button
                  className="btn-secondary"
                  onClick={handleResetToDemo}
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    marginTop: "16px",
                    color: "#DC2626",
                    borderColor: "rgba(239, 68, 68, 0.3)",
                  }}
                >
                  <RefreshCw size={16} />
                  <span>Restablecer Datos Demo</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ==================================================== */}
        {/* TAB 4: SETTINGS & MASTER PIN */}
        {/* ==================================================== */}
        {/* ==================================================== */}
        {/* TAB 4: SETTINGS & SECURITY HEALTH */}
        {/* ==================================================== */}
        {activeTab === "settings" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", alignItems: "start" }}>
            {/* Security & Cloud Health Panel */}
            <section className="admin-panel-card">
              <div style={{ marginBottom: "18px" }}>
                <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Shield size={18} color="#10B981" />
                  <span>Seguridad Criptográfica & Anti-Fraude</span>
                </h2>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                  Supervisión de arquitectura blindada, firmas de pago y políticas de base de datos.
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
                <div style={{ padding: "12px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", background: "rgba(255,255,255,0.02)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <strong style={{ fontSize: "0.88rem", display: "block" }}>Servidor Backend Anti-Fraude</strong>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>API Express en puerto 4000</span>
                  </div>
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, padding: "4px 10px", borderRadius: "12px", background: backendHealth?.status === "ok" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)", color: backendHealth?.status === "ok" ? "#10B981" : "#EF4444" }}>
                    {backendHealth?.status === "ok" ? "● Activo" : "○ Desconectado"}
                  </span>
                </div>

                <div style={{ padding: "12px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", background: "rgba(255,255,255,0.02)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <strong style={{ fontSize: "0.88rem", display: "block" }}>Supabase (PostgreSQL + RLS)</strong>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>Inalterable desde cliente (Row Level Security)</span>
                  </div>
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, padding: "4px 10px", borderRadius: "12px", background: backendHealth?.supabaseConfigured ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)", color: backendHealth?.supabaseConfigured ? "#10B981" : "#F59E0B" }}>
                    {backendHealth?.supabaseConfigured ? "● Conectado (Cloud)" : "○ Modo Local"}
                  </span>
                </div>

                <div style={{ padding: "12px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", background: "rgba(255,255,255,0.02)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <strong style={{ fontSize: "0.88rem", display: "block" }}>Stripe Checkout & Webhooks</strong>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>Verificación de firma criptográfica HMAC-SHA256</span>
                  </div>
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, padding: "4px 10px", borderRadius: "12px", background: backendHealth?.stripeConfigured && backendHealth?.webhookConfigured ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)", color: backendHealth?.stripeConfigured && backendHealth?.webhookConfigured ? "#10B981" : "#F59E0B" }}>
                    {backendHealth?.stripeConfigured ? (backendHealth?.webhookConfigured ? "● Blindado" : "⚠️ Falta Webhook") : "○ Modo Demo"}
                  </span>
                </div>
              </div>

              <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.5, background: "rgba(59, 130, 246, 0.08)", border: "1px solid rgba(59, 130, 246, 0.2)", borderRadius: "var(--radius-sm)", padding: "12px" }}>
                🛡️ <strong>Garantía Anti-Pirateo:</strong> Con esta arquitectura, ningún usuario puede manipular JavaScript en la consola para crearse mascotas gratis o darse VIP. Toda alta exige una firma válida emitida directamente por Stripe y procesada en el servidor.
              </div>
            </section>

            {/* Master PIN Change */}
            <section className="admin-panel-card">
              <div style={{ marginBottom: "20px" }}>
                <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Lock size={18} color="#D97706" />
                  <span>Seguridad: Cambiar PIN Maestro</span>
                </h2>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                  Actualiza el código de acceso al panel de administración para proteger tus métricas y moderación.
                </p>
              </div>

              <form onSubmit={handleChangePinSubmit}>
                <div className="form-group" style={{ marginBottom: "16px" }}>
                  <label className="form-label">Nuevo PIN (mínimo 4 caracteres o dígitos) *</label>
                  <input
                    type="password"
                    className="form-input"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="Introduce nuevo PIN"
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: "20px" }}>
                  <label className="form-label">Confirmar Nuevo PIN *</label>
                  <input
                    type="password"
                    className="form-input"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                    placeholder="Repite el nuevo PIN"
                    required
                  />
                </div>

                {pinChangeStatus && (
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: "var(--radius-sm)",
                      marginBottom: "16px",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      background: pinChangeStatus.includes("éxito") ? "#ECFDF5" : "#FEF2F2",
                      color: pinChangeStatus.includes("éxito") ? "#059669" : "#DC2626",
                    }}
                  >
                    {pinChangeStatus}
                  </div>
                )}

                <button type="submit" className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Lock size={16} />
                  <span>Actualizar PIN Maestro</span>
                </button>
              </form>
            </section>
          </div>
        )}
      </main>

      {/* Edit Modal */}
      {editingPet && (
        <ModalErrorBoundary onClose={() => setEditingPet(null)}>
          <EditPetModal
            pet={editingPet}
            onClose={() => setEditingPet(null)}
            onSave={handleSavePet}
          />
        </ModalErrorBoundary>
      )}

      {/* Confirm Delete Modal */}
      {deletingPet && (
        <div className="modal-overlay" onClick={() => setDeletingPet(null)} style={{ zIndex: 1200 }}>
          <div
            className="modal-content"
            style={{ maxWidth: "460px", textAlign: "center", padding: "32px 24px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "#FEF2F2",
                color: "#EF4444",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <Trash2 size={26} />
            </div>

            <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>
              ¿Eliminar a {deletingPet.name}?
            </h3>
            <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "24px" }}>
              Esta acción eliminará permanentemente la placa <strong style={{ color: "var(--text-primary)" }}>{deletingPet.code}</strong> del muro público y de la base de datos.
            </p>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button className="btn-secondary" onClick={() => setDeletingPet(null)}>
                Cancelar
              </button>
              <button
                className="btn-primary"
                onClick={handleConfirmDelete}
                style={{ background: "#EF4444", borderColor: "#DC2626" }}
              >
                Sí, eliminar permanentemente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
