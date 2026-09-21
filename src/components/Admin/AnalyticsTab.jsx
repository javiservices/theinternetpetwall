import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  Globe,
  Smartphone,
  Laptop,
  Tablet,
  Share2,
  Award,
  Bone,
  CheckCircle2,
  Settings,
  RefreshCw,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import {
  getStoredAnalytics,
  getGoogleAnalyticsId,
  setGoogleAnalyticsId,
  resetAnalyticsData,
  hasAnalyticsConsent,
} from "../../utils/analytics";

export function AnalyticsTab({ petsCount = 0 }) {
  const [analyticsData, setAnalyticsData] = useState(getStoredAnalytics);
  const [gaIdInput, setGaIdInput] = useState(() => getGoogleAnalyticsId());
  const [saveGaStatus, setSaveGaStatus] = useState("");
  const [activeDaysWindow, setActiveDaysWindow] = useState(7); // 7 or 14 or 30

  // Refresh data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setAnalyticsData(getStoredAnalytics());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Today's metrics
  const todayData = analyticsData.dailyVisits[todayStr] || { views: 0, uniques: [] };
  const todayViews = todayData.views || 0;
  const todayUniques = (todayData.uniques && todayData.uniques.length) || 0;

  // Build daily chart data for last N days
  const chartDays = useMemo(() => {
    const list = [];
    for (let i = activeDaysWindow - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split("T")[0];
      const dayData = analyticsData.dailyVisits[dateKey] || { views: 0, uniques: [] };
      const dayName = d.toLocaleDateString("es-ES", { weekday: "short", day: "numeric" });
      list.push({
        dateKey,
        label: dayName,
        views: dayData.views || 0,
        uniques: (dayData.uniques && dayData.uniques.length) || 0,
      });
    }
    return list;
  }, [analyticsData.dailyVisits, activeDaysWindow]);

  const maxDailyViews = useMemo(() => {
    const max = Math.max(...chartDays.map((c) => c.views), 1);
    return max;
  }, [chartDays]);

  // Traffic sources aggregation
  const sourcesTotal = useMemo(() => {
    const sum = Object.values(analyticsData.sources).reduce((acc, n) => acc + n, 0);
    return Math.max(sum, 1);
  }, [analyticsData.sources]);

  const sourceLabels = {
    direct: { label: "Tráfico Directo", icon: "🔗", color: "#3B82F6" },
    instagram: { label: "Instagram", icon: "📸", color: "#E1306C" },
    tiktok: { label: "TikTok", icon: "🎵", color: "#000000" },
    google: { label: "Google (Búsqueda)", icon: "🔍", color: "#4285F4" },
    facebook: { label: "Facebook", icon: "👥", color: "#1877F2" },
    twitter: { label: "Twitter / X", icon: "🐦", color: "#1DA1F2" },
    whatsapp: { label: "WhatsApp / Chat", icon: "💬", color: "#25D366" },
    other: { label: "Otras webs / Enlaces", icon: "🌐", color: "#8B5CF6" },
  };

  // Devices aggregation
  const devicesTotal = useMemo(() => {
    const sum = (analyticsData.devices.mobile || 0) + (analyticsData.devices.desktop || 0) + (analyticsData.devices.tablet || 0);
    return Math.max(sum, 1);
  }, [analyticsData.devices]);

  // Handle saving GA ID
  const handleSaveGaId = (e) => {
    e.preventDefault();
    setGoogleAnalyticsId(gaIdInput.trim());
    setSaveGaStatus("Guardado correctamente");
    setTimeout(() => setSaveGaStatus(""), 3500);
  };

  // Handle resetting analytics
  const handleResetData = () => {
    if (window.confirm("¿Seguro que deseas reiniciar el contador de estadísticas de prueba?")) {
      resetAnalyticsData();
      setAnalyticsData(getStoredAnalytics());
    }
  };

  // Format time ago for recent visits
  const formatTimeAgo = (ts) => {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return "hace unos segundos";
    if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
    return `hace ${Math.floor(diff / 3600)} h`;
  };

  const conversionRate = todayViews > 0 ? ((petsCount / todayViews) * 100).toFixed(1) : "0.0";

  return (
    <div className="analytics-dashboard-wrap" style={{ marginTop: "20px" }}>
      {/* Top Banner Notice */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.08))",
          border: "1px solid rgba(16, 185, 129, 0.25)",
          borderRadius: "var(--radius-lg)",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "#10B981",
              color: "#FFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <ShieldCheck size={22} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: "0.98rem", fontWeight: 800, color: "var(--text-primary)" }}>
              Analítica Web Profesional & Cookieless
            </h4>
            <p style={{ margin: "3px 0 0 0", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
              Mide el 100% de las visitas en tiempo real sin violar el RGPD, sin ralentizar la web y sin perder datos por bloqueadores de cookies.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setAnalyticsData(getStoredAnalytics())}
          className="btn-secondary"
          style={{ fontSize: "0.8rem", padding: "6px 12px" }}
          title="Actualizar datos"
        >
          <RefreshCw size={14} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Primary KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "28px",
        }}
      >
        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-label">Páginas Vistas Hoy</span>
            <span className="admin-kpi-icon" style={{ background: "#EFF6FF", color: "#3B82F6" }}>
              <Eye size={16} />
            </span>
          </div>
          <div className="admin-kpi-value" style={{ color: "#2563EB" }}>
            {todayViews}
          </div>
          <div className="admin-kpi-detail">
            <span>{analyticsData.totalPageViews} páginas vistas históricas</span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-label">Visitantes Únicos (Hoy)</span>
            <span className="admin-kpi-icon" style={{ background: "#ECFDF5", color: "#10B981" }}>
              <Users size={16} />
            </span>
          </div>
          <div className="admin-kpi-value" style={{ color: "#059669" }}>
            {todayUniques}
          </div>
          <div className="admin-kpi-detail">
            <span>Firma anónima diaria (Cookieless)</span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-label">Mascotas Inmortalizadas</span>
            <span className="admin-kpi-icon" style={{ background: "#FEF3C7", color: "#D97706" }}>
              ⭐
            </span>
          </div>
          <div className="admin-kpi-value" style={{ color: "#B45309" }}>
            {petsCount}
          </div>
          <div className="admin-kpi-detail">
            <span>{conversionRate}% tasa estimada de registro</span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-label">Interacciones / Chuches</span>
            <span className="admin-kpi-icon" style={{ background: "#FFFBEB", color: "#F59E0B" }}>
              <Bone size={16} />
            </span>
          </div>
          <div className="admin-kpi-value" style={{ color: "#D97706" }}>
            {analyticsData.events.give_treat || 0}
          </div>
          <div className="admin-kpi-detail">
            <span>{analyticsData.events.download_passport || 0} pasaportes · {analyticsData.events.download_collar_tag || 0} chapas QR</span>
          </div>
        </div>
      </div>

      {/* Trend Bar Chart Section */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-lg)",
          padding: "24px",
          marginBottom: "28px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)" }}>
              Evolución de Visitas Diarias
            </h3>
            <p style={{ margin: "4px 0 0 0", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
              Tráfico de los últimos {activeDaysWindow} días en la web
            </p>
          </div>

          <div style={{ display: "flex", gap: "6px" }}>
            {[7, 14, 30].map((days) => (
              <button
                key={days}
                type="button"
                className={`btn-secondary ${activeDaysWindow === days ? "active" : ""}`}
                onClick={() => setActiveDaysWindow(days)}
                style={{
                  padding: "4px 10px",
                  fontSize: "0.78rem",
                  background: activeDaysWindow === days ? "var(--accent-gold)" : "transparent",
                  color: activeDaysWindow === days ? "#78350F" : "inherit",
                  fontWeight: activeDaysWindow === days ? 700 : 500,
                }}
              >
                {days} días
              </button>
            ))}
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: activeDaysWindow > 14 ? "6px" : "16px",
            height: "180px",
            paddingTop: "20px",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          {chartDays.map((day) => {
            const heightPercent = Math.max(Math.round((day.views / maxDailyViews) * 100), day.views > 0 ? 10 : 4);
            const isToday = day.dateKey === todayStr;

            return (
              <div
                key={day.dateKey}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  height: "100%",
                  justifyContent: "flex-end",
                }}
                title={`${day.label}: ${day.views} visitas (${day.uniques} únicos)`}
              >
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: isToday ? "var(--accent-gold-dark)" : "var(--text-muted)",
                    marginBottom: "6px",
                  }}
                >
                  {day.views}
                </span>
                <div
                  style={{
                    width: "100%",
                    maxWidth: activeDaysWindow > 14 ? "18px" : "36px",
                    height: `${heightPercent}%`,
                    background: isToday
                      ? "linear-gradient(180deg, #F59E0B, #D97706)"
                      : "linear-gradient(180deg, #93C5FD, #3B82F6)",
                    borderRadius: "4px 4px 0 0",
                    transition: "height 0.4s ease",
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* X Axis Labels */}
        <div
          style={{
            display: "flex",
            gap: activeDaysWindow > 14 ? "6px" : "16px",
            marginTop: "8px",
          }}
        >
          {chartDays.map((day) => (
            <div
              key={day.dateKey}
              style={{
                flex: 1,
                textAlign: "center",
                fontSize: activeDaysWindow > 14 ? "0.65rem" : "0.72rem",
                color: day.dateKey === todayStr ? "var(--accent-gold-dark)" : "var(--text-muted)",
                fontWeight: day.dateKey === todayStr ? 800 : 500,
                textTransform: "capitalize",
              }}
            >
              {day.label}
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Sources + Devices */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "24px",
          marginBottom: "28px",
        }}
      >
        {/* Traffic Sources */}
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-lg)",
            padding: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <Globe size={18} color="#3B82F6" />
            <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "var(--text-primary)" }}>
              Fuentes de Tráfico (Referidos)
            </h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {Object.entries(sourceLabels).map(([key, info]) => {
              const count = analyticsData.sources[key] || 0;
              const percent = Math.round((count / sourcesTotal) * 100);

              return (
                <div key={key}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "4px" }}>
                    <span style={{ fontWeight: 600, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
                      <span>{info.icon}</span>
                      <span>{info.label}</span>
                    </span>
                    <span style={{ fontWeight: 700, color: "var(--text-secondary)" }}>
                      {count} ({percent}%)
                    </span>
                  </div>
                  <div style={{ width: "100%", height: "6px", background: "var(--bg-subtle)", borderRadius: "3px", overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${percent}%`,
                        height: "100%",
                        background: info.color,
                        borderRadius: "3px",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Devices & Browsers */}
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-lg)",
            padding: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <Smartphone size={18} color="#10B981" />
            <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "var(--text-primary)" }}>
              Distribución de Dispositivos
            </h3>
          </div>

          <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
            <div
              style={{
                flex: 1,
                padding: "14px",
                background: "var(--bg-subtle)",
                borderRadius: "var(--radius-md)",
                textAlign: "center",
              }}
            >
              <Smartphone size={22} color="#10B981" style={{ margin: "0 auto 6px" }} />
              <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-primary)" }}>
                {Math.round(((analyticsData.devices.mobile || 0) / devicesTotal) * 100)}%
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Móvil ({analyticsData.devices.mobile || 0})
              </div>
            </div>

            <div
              style={{
                flex: 1,
                padding: "14px",
                background: "var(--bg-subtle)",
                borderRadius: "var(--radius-md)",
                textAlign: "center",
              }}
            >
              <Laptop size={22} color="#3B82F6" style={{ margin: "0 auto 6px" }} />
              <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-primary)" }}>
                {Math.round(((analyticsData.devices.desktop || 0) / devicesTotal) * 100)}%
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Ordenador ({analyticsData.devices.desktop || 0})
              </div>
            </div>

            <div
              style={{
                flex: 1,
                padding: "14px",
                background: "var(--bg-subtle)",
                borderRadius: "var(--radius-md)",
                textAlign: "center",
              }}
            >
              <Tablet size={22} color="#8B5CF6" style={{ margin: "0 auto 6px" }} />
              <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-primary)" }}>
                {Math.round(((analyticsData.devices.tablet || 0) / devicesTotal) * 100)}%
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Tablet ({analyticsData.devices.tablet || 0})
              </div>
            </div>
          </div>

          {/* Top Pages */}
          <h4 style={{ margin: "0 0 10px 0", fontSize: "0.88rem", fontWeight: 700, color: "var(--text-primary)" }}>
            Secciones Más Vistas
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {Object.entries(analyticsData.topPages)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([pagePath, count]) => (
                <div
                  key={pagePath}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.82rem",
                    padding: "6px 10px",
                    background: "var(--bg-subtle)",
                    borderRadius: "4px",
                  }}
                >
                  <span style={{ fontFamily: "monospace", color: "var(--text-primary)", fontWeight: 600 }}>
                    {pagePath === "/" ? "/ (Portada)" : pagePath}
                  </span>
                  <span style={{ fontWeight: 700, color: "var(--accent-gold-dark)" }}>
                    {count} visitas
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Optional Google Analytics 4 Config Box */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-lg)",
          padding: "20px",
          marginBottom: "28px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "6px",
                background: "#EA4335",
                color: "#FFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: "0.75rem",
              }}
            >
              G
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "var(--text-primary)" }}>
                Google Analytics 4 (GA4) Opcional
              </h4>
              <p style={{ margin: "2px 0 0 0", fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                Si deseas usar tu propia propiedad de Google Analytics, introduce tu ID de medición (ej. <code>G-XXXXXXXXXX</code>).
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                padding: "3px 8px",
                borderRadius: "var(--radius-full)",
                fontSize: "0.72rem",
                fontWeight: 700,
                background: getGoogleAnalyticsId() ? "#ECFDF5" : "var(--bg-subtle)",
                color: getGoogleAnalyticsId() ? "#065F46" : "var(--text-muted)",
              }}
            >
              {getGoogleAnalyticsId() ? "✓ Conectado" : "No configurado"}
            </span>
          </div>
        </div>

        <form onSubmit={handleSaveGaId} style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <input
            type="text"
            className="form-input"
            placeholder="G-XXXXXXXXXX"
            value={gaIdInput}
            onChange={(e) => setGaIdInput(e.target.value)}
            style={{ maxWidth: "280px", fontSize: "0.85rem", padding: "8px 12px" }}
          />
          <button type="submit" className="btn-primary" style={{ padding: "8px 16px", fontSize: "0.82rem" }}>
            Guardar ID
          </button>
          {saveGaStatus && (
            <span style={{ fontSize: "0.82rem", color: "#10B981", fontWeight: 600 }}>
              ✓ {saveGaStatus}
            </span>
          )}
        </form>

        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "10px 0 0 0", lineHeight: 1.4 }}>
          ℹ️ Cumplimiento RGPD: Google Analytics solo recopilará cookies si el usuario pulsa en "Aceptar todas" en el banner de cookies. Si no tienes o no quieres Google Analytics, no te preocupes: las estadísticas superiores ya miden todo de forma nativa sin cookies.
        </p>
      </div>

      {/* Danger / Reset zone */}
      <div style={{ textAlign: "right" }}>
        <button
          type="button"
          onClick={handleResetData}
          style={{
            background: "none",
            border: "none",
            color: "var(--text-muted)",
            fontSize: "0.75rem",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          Reiniciar datos y contadores de prueba
        </button>
      </div>
    </div>
  );
}
