import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Sparkles, Menu, X, ChevronDown, Check, Home, Grid, Compass, Sun, Moon, Bookmark, Heart } from "lucide-react";
import { useTranslation } from "../i18n/LanguageContext";
import { useTheme } from "../utils/theme";
import { getMyPetIds, getSavedPets } from "../utils/storage";

export function Navbar({ totalPets, onOpenAddPet, onSelectPet }) {
  const { t, language, setLanguage, availableLanguages } = useTranslation();
  const { theme, toggleTheme, isDark } = useTheme();

  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [myPetsOpen, setMyPetsOpen] = useState(false);
  const [myPetsList, setMyPetsList] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();
  const isWallActive = location.pathname.startsWith("/wall");
  const isDiscoverActive = location.pathname.startsWith("/discover");
  const isHomeActive = location.pathname === "/" && !isWallActive && !isDiscoverActive;

  const currentLangObj = availableLanguages.find((l) => l.code === language) || availableLanguages[0];

  // Refresh saved pets
  useEffect(() => {
    const ids = getMyPetIds();
    const all = getSavedPets();
    const found = all.filter((p) => ids.includes(p.id));
    setMyPetsList(found);
  }, [location.pathname, myPetsOpen]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 860) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMobileNavigate = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const handleMobileAddPet = () => {
    onOpenAddPet();
    setMobileMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="container">
        <div className="navbar-inner">
          {/* Brand Logo & Title */}
          <Link
            to="/"
            className="brand"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="brand-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="14" r="5" />
                <circle cx="7.5" cy="8.5" r="2.2" />
                <circle cx="16.5" cy="8.5" r="2.2" />
                <circle cx="5" cy="12.5" r="1.8" />
                <circle cx="19" cy="12.5" r="1.8" />
              </svg>
            </div>
            <span className="brand-title">The Internet Pet Wall</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="nav-links-wrap desktop-only">
            <Link
              to="/"
              className={`nav-link-btn ${isHomeActive ? "active" : ""}`}
            >
              {t("nav_home")}
            </Link>
            <Link
              to="/wall"
              className={`nav-link-btn ${isWallActive ? "active" : ""}`}
            >
              {t("nav_full_wall")}
            </Link>
            <Link
              to="/discover"
              className={`nav-link-btn ${isDiscoverActive ? "active" : ""}`}
              style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}
            >
              <Compass size={15} color="#F59E0B" />
              <span>{t("nav_discover")}</span>
            </Link>
          </nav>

          {/* Desktop Right Actions */}
          <div className="navbar-actions desktop-only">
            {/* "Mis Mascotas" quick dropdown if any saved */}
            {myPetsList.length > 0 && (
              <div style={{ position: "relative" }}>
                <button
                  className="btn-secondary"
                  onClick={() => setMyPetsOpen(!myPetsOpen)}
                  style={{
                    padding: "7px 12px",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    color: "var(--accent-gold-dark)",
                    background: "rgba(245, 158, 11, 0.1)",
                    borderColor: "rgba(245, 158, 11, 0.3)",
                  }}
                  title={t("nav_my_saved_pets")}
                >
                  <Bookmark size={14} fill="#D97706" />
                  <span>{t("nav_my_pets")} ({myPetsList.length})</span>
                  <ChevronDown size={13} />
                </button>

                {myPetsOpen && (
                  <div
                    className="lang-dropdown-menu"
                    style={{ width: "240px", right: 0, padding: "8px" }}
                  >
                    <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", padding: "4px 8px 8px" }}>
                      {t("nav_saved_pets_heading")}
                    </p>
                    {myPetsList.map((p) => (
                      <button
                        key={p.id}
                        className="lang-option-btn"
                        onClick={() => {
                          setMyPetsOpen(false);
                          if (onSelectPet) onSelectPet(p);
                        }}
                        style={{ display: "flex", alignItems: "center", gap: "10px", padding: "6px 8px" }}
                      >
                        <img
                          src={p.photoUrl}
                          alt={p.name}
                          style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover" }}
                        />
                        <div style={{ flex: 1, textAlign: "left" }}>
                          <span style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, lineHeight: 1.1 }}>
                            {p.name}
                          </span>
                          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                            {p.code}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Dark / Light Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="theme-toggle-btn"
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-subtle)",
                background: "var(--bg-surface)",
                color: isDark ? "#FBBF24" : "#D97706",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
              title={isDark ? "Cambiar a Modo Claro" : "Cambiar a Modo Noche / Constelación"}
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Language Selector Dropdown */}
            <div style={{ position: "relative" }}>
              <button
                className="lang-selector-btn"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                aria-label="Seleccionar idioma"
              >
                <span style={{ fontSize: "1.1rem" }}>{currentLangObj.flag}</span>
                <span style={{ fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase" }}>
                  {currentLangObj.code}
                </span>
                <ChevronDown size={14} />
              </button>

              {langMenuOpen && (
                <div className="lang-dropdown-menu">
                  {availableLanguages.map((l) => (
                    <button
                      key={l.code}
                      className={`lang-option-btn ${l.code === language ? "selected" : ""}`}
                      onClick={() => {
                        setLanguage(l.code);
                        setLangMenuOpen(false);
                      }}
                    >
                      <span style={{ fontSize: "1.2rem" }}>{l.flag}</span>
                      <span style={{ flexGrow: 1, textAlign: "left", fontWeight: 600 }}>{l.name}</span>
                      {l.code === language && <Check size={14} color="#D97706" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Main CTA */}
            <button
              className="btn-primary"
              onClick={onOpenAddPet}
              id="nav-add-pet-btn"
            >
              <Sparkles size={16} />
              <span>{t("nav_cta")}</span>
            </button>
          </div>

          {/* Mobile Right Controls */}
          <div className="mobile-controls mobile-only">
            {/* Theme Toggle Mobile */}
            <button
              onClick={toggleTheme}
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-subtle)",
                background: "var(--bg-surface)",
                color: isDark ? "#FBBF24" : "#D97706",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Mobile Lang Button */}
            <div style={{ position: "relative" }}>
              <button
                className="lang-selector-btn"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                style={{ padding: "6px 8px" }}
                aria-label="Cambiar idioma"
              >
                <span style={{ fontSize: "1.15rem" }}>{currentLangObj.flag}</span>
                <ChevronDown size={13} />
              </button>

              {langMenuOpen && (
                <div className="lang-dropdown-menu" style={{ right: 0 }}>
                  {availableLanguages.map((l) => (
                    <button
                      key={l.code}
                      className={`lang-option-btn ${l.code === language ? "selected" : ""}`}
                      onClick={() => {
                        setLanguage(l.code);
                        setLangMenuOpen(false);
                      }}
                    >
                      <span>{l.flag}</span>
                      <span style={{ flexGrow: 1, textAlign: "left" }}>{l.name}</span>
                      {l.code === language && <Check size={14} color="#D97706" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Menu Hamburger Button */}
            <button
              className="hamburger-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-Down Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-drawer-content" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-nav-links">
              <button
                className={`mobile-nav-item ${isHomeActive ? "active" : ""}`}
                onClick={() => handleMobileNavigate("/")}
              >
                <Home size={18} />
                <span>{t("nav_home")}</span>
              </button>

              <button
                className={`mobile-nav-item ${isWallActive ? "active" : ""}`}
                onClick={() => handleMobileNavigate("/wall")}
              >
                <Grid size={18} />
                <span>{t("nav_full_wall")}</span>
              </button>

              <button
                className={`mobile-nav-item ${isDiscoverActive ? "active" : ""}`}
                onClick={() => handleMobileNavigate("/discover")}
              >
                <Compass size={18} color="#F59E0B" />
                <span>{t("nav_discover_pets")}</span>
              </button>
            </div>

            <div className="mobile-drawer-footer">
              <div className="pill-counter" style={{ justifyContent: "center", width: "100%", marginBottom: "14px" }}>
                <span className="pill-dot" />
                <span>{totalPets} {t("nav_in_wall")}</span>
              </div>

              <button
                className="btn-primary"
                style={{ width: "100%", padding: "14px 20px", fontSize: "1rem" }}
                onClick={handleMobileAddPet}
              >
                <Sparkles size={18} />
                <span>{t("nav_cta")}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
