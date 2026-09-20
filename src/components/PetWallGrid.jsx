import React, { useState, useMemo } from "react";
import { Search, Star, Sparkles, Filter } from "lucide-react";
import { PetCard } from "./PetCard";

export function PetWallGrid({ pets, onSelectPet, onGiveTreat, onOpenAddPet }) {
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPets = useMemo(() => {
    let result = [...pets];

    // Filter by type or VIP / Most loved
    if (filterType === "dog") {
      result = result.filter((p) => p.type === "dog");
    } else if (filterType === "cat") {
      result = result.filter((p) => p.type === "cat");
    } else if (filterType === "other") {
      result = result.filter((p) => p.type === "other");
    } else if (filterType === "vip") {
      result = result.filter((p) => p.isVip);
    } else if (filterType === "loved") {
      result.sort((a, b) => (b.treats || 0) - (a.treats || 0));
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.breed && p.breed.toLowerCase().includes(q)) ||
          (p.city && p.city.toLowerCase().includes(q)) ||
          (p.code && p.code.toLowerCase().includes(q))
      );
    }

    return result;
  }, [pets, filterType, searchQuery]);

  return (
    <section id="wall-section" style={{ paddingBottom: "60px" }}>
      <div className="container">
        {/* Control Bar: Filters & Search */}
        <div className="control-bar">
          <div className="filter-group">
            <button
              className={`filter-btn ${filterType === "all" ? "active" : ""}`}
              onClick={() => setFilterType("all")}
            >
              Todos ({pets.length})
            </button>
            <button
              className={`filter-btn ${filterType === "dog" ? "active" : ""}`}
              onClick={() => setFilterType("dog")}
            >
              🐶 Perros
            </button>
            <button
              className={`filter-btn ${filterType === "cat" ? "active" : ""}`}
              onClick={() => setFilterType("cat")}
            >
              🐱 Gatos
            </button>
            <button
              className={`filter-btn ${filterType === "other" ? "active" : ""}`}
              onClick={() => setFilterType("other")}
            >
              🐰 Otros
            </button>
            <button
              className={`filter-btn vip-filter ${filterType === "vip" ? "active" : ""}`}
              onClick={() => setFilterType("vip")}
            >
              <Star size={14} />
              VIP Dorados
            </button>
            <button
              className={`filter-btn ${filterType === "loved" ? "active" : ""}`}
              onClick={() => setFilterType("loved")}
            >
              🦴 Más Queridos
            </button>
          </div>

          <div className="search-box">
            <Search size={16} color="#71717A" />
            <input
              type="text"
              className="search-input"
              placeholder="Buscar por nombre, raza o ciudad..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Grid or Empty State */}
        {filteredPets.length > 0 ? (
          <div className="pet-wall-grid">
            {filteredPets.map((pet) => (
              <PetCard
                key={pet.id}
                pet={pet}
                onSelectPet={onSelectPet}
                onGiveTreat={onGiveTreat}
              />
            ))}
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "64px 20px",
              background: "var(--bg-surface)",
              borderRadius: "var(--radius-xl)",
              border: "1px solid var(--border-subtle)",
              margin: "32px 0",
            }}
          >
            <p style={{ fontSize: "2rem", marginBottom: "12px" }}>🔍🐾</p>
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.4rem", marginBottom: "8px" }}>
              No encontramos ninguna mascota con esa búsqueda
            </h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "20px" }}>
              Prueba con otro término o añade a tu propia mascota al muro por 1€.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                className="btn-secondary"
                onClick={() => {
                  setSearchQuery("");
                  setFilterType("all");
                }}
              >
                Limpiar filtros
              </button>
              <button className="btn-primary" onClick={onOpenAddPet}>
                <Sparkles size={16} />
                Inmortalizar Mascota (1€)
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
