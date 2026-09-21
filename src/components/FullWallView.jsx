import React, { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  X,
  RotateCcw,
  Sparkles,
  LayoutGrid,
  Grid3X3,
  MapPin,
  Crown,
  Bone,
  ArrowUpDown,
  Globe,
  Clock,
} from "lucide-react";
import { PetCard } from "./PetCard";
import { useTranslation } from "../i18n/LanguageContext";
import { launchTreatSparkle } from "../utils/confetti";
import { WORLD_COUNTRIES, parsePetLocation } from "../data/worldLocations";
import { useTreatCooldown } from "../utils/treatCooldown";

export function FullWallView({ pets, onSelectPet, onGiveTreat, onOpenAddPet }) {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // URL state persistence
  const filterType = searchParams.get("type") || "all";
  const searchQuery = searchParams.get("q") || "";
  const isVipOnly = searchParams.get("vip") === "true";
  const filterCountry = searchParams.get("country") || "all";
  const filterState = searchParams.get("state") || "all";
  const filterCity = searchParams.get("city") || "all";
  const sortBy = searchParams.get("sort") || "recent";
  const isCompact = searchParams.get("view") !== "normal";

  // Distinct countries represented in the wall with pet counts & flags
  const representedCountries = useMemo(() => {
    const map = new Map();
    pets.forEach((p) => {
      const loc = parsePetLocation(p.city, p);
      if (!map.has(loc.countryCode)) {
        map.set(loc.countryCode, {
          code: loc.countryCode,
          name: loc.countryName,
          flag: loc.flag,
          count: 0,
        });
      }
      map.get(loc.countryCode).count++;
    });
    return Array.from(map.values()).sort(
      (a, b) => b.count - a.count || a.name.localeCompare(b.name)
    );
  }, [pets]);

  // Distinct states/provinces represented (filtered by country if chosen)
  const representedStates = useMemo(() => {
    const map = new Map();
    pets.forEach((p) => {
      const loc = parsePetLocation(p.city, p);
      if (filterCountry === "all" || loc.countryCode === filterCountry) {
        if (loc.stateName && loc.stateName.trim()) {
          const st = loc.stateName.trim();
          if (!map.has(st)) {
            map.set(st, { name: st, count: 0 });
          }
          map.get(st).count++;
        }
      }
    });
    return Array.from(map.values()).sort(
      (a, b) => b.count - a.count || a.name.localeCompare(b.name)
    );
  }, [pets, filterCountry]);

  // Available cities/localities (filtered by country and state if chosen)
  const availableCities = useMemo(() => {
    const map = new Map();
    pets.forEach((p) => {
      const loc = parsePetLocation(p.city, p);
      const matchCountry = filterCountry === "all" || loc.countryCode === filterCountry;
      const matchState = filterState === "all" || (loc.stateName && loc.stateName.toLowerCase() === filterState.toLowerCase());
      if (matchCountry && matchState) {
        if (loc.cityName && loc.cityName.trim()) {
          const ct = loc.cityName.trim();
          if (!map.has(ct)) {
            map.set(ct, { name: ct, count: 0 });
          }
          map.get(ct).count++;
        }
      }
    });
    return Array.from(map.values()).sort(
      (a, b) => b.count - a.count || a.name.localeCompare(b.name)
    );
  }, [pets, filterCountry, filterState]);

  // Helper to update search params cleanly
  const updateParams = (newParams) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(newParams).forEach(([key, val]) => {
          if (
            val === undefined ||
            val === null ||
            val === "" ||
            (key === "type" && val === "all") ||
            (key === "country" && val === "all") ||
            (key === "state" && val === "all") ||
            (key === "city" && val === "all") ||
            (key === "sort" && val === "recent") ||
            (key === "vip" && val === false)
          ) {
            next.delete(key);
          } else {
            next.set(key, String(val));
          }
        });
        return next;
      },
      { replace: true }
    );
  };

  const handleSearchChange = (q) => updateParams({ q });
  const handleTypeChange = (type) => updateParams({ type });
  const handleVipToggle = (val) => updateParams({ vip: val });
  const handleCountryChange = (country) => updateParams({ country, state: undefined, city: undefined });
  const handleStateChange = (state) => updateParams({ state, city: undefined });
  const handleCityChange = (city) => updateParams({ city });
  const handleSortChange = (sort) => updateParams({ sort });
  const handleDensityChange = (compact) => updateParams({ view: compact ? undefined : "normal" });

  const handleClearAllFilters = () => {
    updateParams({
      type: undefined,
      q: undefined,
      vip: undefined,
      country: undefined,
      state: undefined,
      city: undefined,
      sort: undefined,
    });
  };

  // Count active filters (excluding search & density)
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filterType !== "all") count++;
    if (isVipOnly) count++;
    if (filterCountry !== "all") count++;
    if (filterState !== "all") count++;
    if (filterCity !== "all") count++;
    if (sortBy !== "recent") count++;
    return count;
  }, [filterType, isVipOnly, filterCountry, filterState, filterCity, sortBy]);

  // Filter and sort pets
  const filteredPets = useMemo(() => {
    let result = [...pets];

    // 1. Filter by Species
    if (filterType === "dog") {
      result = result.filter((p) => p.type === "dog");
    } else if (filterType === "cat") {
      result = result.filter((p) => p.type === "cat");
    } else if (filterType === "other") {
      result = result.filter((p) => p.type === "other");
    } else if (filterType === "memorial") {
      result = result.filter((p) => p.isMemorial);
    }

    // 2. Filter by VIP Only
    if (isVipOnly) {
      result = result.filter((p) => p.isVip);
    }

    // 3. Filter by Country
    if (filterCountry !== "all") {
      result = result.filter((p) => {
        const loc = parsePetLocation(p.city, p);
        return loc.countryCode === filterCountry;
      });
    }

    // 4. Filter by State / Province
    if (filterState !== "all") {
      result = result.filter((p) => {
        const loc = parsePetLocation(p.city, p);
        return loc.stateName.toLowerCase() === filterState.toLowerCase();
      });
    }

    // 5. Filter by City / Locality
    if (filterCity !== "all") {
      result = result.filter((p) => {
        const loc = parsePetLocation(p.city, p);
        return loc.cityName.toLowerCase() === filterCity.toLowerCase();
      });
    }

    // 6. Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p) => {
        const loc = parsePetLocation(p.city, p);
        return (
          p.name.toLowerCase().includes(q) ||
          (p.breed && p.breed.toLowerCase().includes(q)) ||
          (p.city && p.city.toLowerCase().includes(q)) ||
          (p.state && p.state.toLowerCase().includes(q)) ||
          (p.country && p.country.toLowerCase().includes(q)) ||
          (p.code && p.code.toLowerCase().includes(q)) ||
          (p.owner && p.owner.toLowerCase().includes(q)) ||
          loc.cityName.toLowerCase().includes(q) ||
          loc.stateName.toLowerCase().includes(q) ||
          loc.countryName.toLowerCase().includes(q)
        );
      });
    }

    // 7. Sort Results
    if (sortBy === "loved") {
      result.sort((a, b) => (b.treats || 0) - (a.treats || 0));
    } else if (sortBy === "az") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "vip_first") {
      result.sort((a, b) => {
        if (a.isVip && !b.isVip) return -1;
        if (!a.isVip && b.isVip) return 1;
        return (b.treats || 0) - (a.treats || 0);
      });
    }
    // "recent" preserves default arrival order

    return result;
  }, [pets, filterType, isVipOnly, filterCountry, filterState, filterCity, searchQuery, sortBy]);

  const selectedCountryObj = representedCountries.find((c) => c.code === filterCountry);

  return (
    <div className="full-wall-page">
      <div className="container">
        {/* Wall Page Header */}
        <div className="full-wall-header">
          <div className="section-tag" style={{ background: "#FEF3C7", color: "#B45309" }}>
            <Sparkles size={14} />
            <span>{t("global_mosaic_badge")}</span>
          </div>
          <h1 className="full-wall-title">{t("wall_page_title")}</h1>
          <p className="full-wall-desc">
            {t("wall_page_desc")} ({pets.length} {t("nav_in_wall")})
          </p>
        </div>

        {/* Master Toolbar: Prominent Search + Filter Trigger + Density Toggle */}
        <div className="wall-toolbar-container">
          <div className="toolbar-main-row">
            {/* Prominent Large Search Box */}
            <div className="toolbar-search-box-large">
              <Search size={20} className="search-icon-svg" />
              <input
                type="text"
                className="toolbar-search-input-large"
                placeholder={t("search_placeholder")}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                aria-label={t("search_placeholder")}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn-large"
                  onClick={() => handleSearchChange("")}
                  title={t("clean_filters")}
                  aria-label={t("aria_clear_search")}
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Actions: Filter Toggle Button + Density Toggle */}
            <div className="toolbar-control-actions">
              {/* Expandable Filter Trigger Button */}
              <button
                type="button"
                className={`filter-trigger-btn ${isFilterPanelOpen ? "open" : ""} ${
                  activeFiltersCount > 0 ? "has-active" : ""
                }`}
                onClick={() => setIsFilterPanelOpen((prev) => !prev)}
                aria-expanded={isFilterPanelOpen}
                aria-controls="advanced-filters-panel"
              >
                <SlidersHorizontal size={17} />
                <span className="filter-trigger-label">{t("filters_btn")}</span>
                {activeFiltersCount > 0 && (
                  <span className="filter-badge-counter">{activeFiltersCount}</span>
                )}
                <ChevronDown
                  size={16}
                  className={`filter-chevron ${isFilterPanelOpen ? "rotated" : ""}`}
                />
              </button>

              {/* Density View Toggle (Compact vs Normal) */}
              <div className="density-toggle-group">
                <button
                  className={`density-btn ${isCompact ? "active" : ""}`}
                  onClick={() => handleDensityChange(true)}
                  title={t("density_compact")}
                  aria-label={t("density_compact")}
                >
                  <Grid3X3 size={16} />
                  <span className="density-label">{t("density_compact")}</span>
                </button>
                <button
                  className={`density-btn ${!isCompact ? "active" : ""}`}
                  onClick={() => handleDensityChange(false)}
                  title={t("density_normal")}
                  aria-label={t("density_normal")}
                >
                  <LayoutGrid size={16} />
                  <span className="density-label">{t("density_normal")}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Active Filter Chips Row (Visible when filters are active) */}
          {activeFiltersCount > 0 && (
            <div className="active-filters-bar">
              <span className="active-filters-label">{t("filters_btn")}:</span>
              <div className="active-filter-tags">
                {filterType !== "all" && (
                  <button
                    className="active-tag-pill"
                    onClick={() => handleTypeChange("all")}
                    title={t("remove_filter")}
                  >
                    <span>{filterType === "dog" ? t("filter_dogs") : filterType === "cat" ? t("filter_cats") : filterType === "memorial" ? t("filter_memorial") : t("filter_others")}</span>
                    <X size={12} />
                  </button>
                )}
                {isVipOnly && (
                  <button
                    className="active-tag-pill vip-tag"
                    onClick={() => handleVipToggle(false)}
                    title={t("remove_filter")}
                  >
                    <span>{t("filter_vip")}</span>
                    <X size={12} />
                  </button>
                )}
                {filterCountry !== "all" && (
                  <button
                    className="active-tag-pill"
                    onClick={() => handleCountryChange("all")}
                    title={t("remove_filter")}
                  >
                    <span>{selectedCountryObj?.flag || "🌍"} {selectedCountryObj?.name || filterCountry}</span>
                    <X size={12} />
                  </button>
                )}
                {filterState !== "all" && (
                  <button
                    className="active-tag-pill"
                    onClick={() => handleStateChange("all")}
                    title={t("remove_filter")}
                  >
                    <MapPin size={12} />
                    <span>{filterState}</span>
                    <X size={12} />
                  </button>
                )}
                {filterCity !== "all" && (
                  <button
                    className="active-tag-pill"
                    onClick={() => handleCityChange("all")}
                    title={t("remove_filter")}
                  >
                    <MapPin size={12} />
                    <span>{filterCity}</span>
                    <X size={12} />
                  </button>
                )}
                {sortBy !== "recent" && (
                  <button
                    className="active-tag-pill"
                    onClick={() => handleSortChange("recent")}
                    title={t("remove_filter")}
                  >
                    <ArrowUpDown size={12} />
                    <span>
                      {sortBy === "loved"
                        ? t("sort_loved")
                        : sortBy === "az"
                        ? t("sort_az")
                        : t("sort_vip_first")}
                    </span>
                    <X size={12} />
                  </button>
                )}
                <button
                  className="active-tag-clear-all"
                  onClick={handleClearAllFilters}
                >
                  <RotateCcw size={12} />
                  <span>{t("clear_all_filters")}</span>
                </button>
              </div>
            </div>
          )}

          {/* Collapsible Advanced Filters Panel (Shown when triggered) */}
          {isFilterPanelOpen && (
            <div id="advanced-filters-panel" className="advanced-filters-panel">
              <div className="filters-panel-header">
                <div className="panel-title-wrap">
                  <SlidersHorizontal size={16} className="panel-icon" />
                  <h3 className="panel-title">{t("filters_title")}</h3>
                </div>
                <div className="panel-header-actions">
                  <span className="panel-results-count">
                    <strong>{filteredPets.length}</strong> {t("showing_results")}
                  </span>
                  {activeFiltersCount > 0 && (
                    <button
                      type="button"
                      className="panel-reset-btn"
                      onClick={handleClearAllFilters}
                    >
                      <RotateCcw size={13} />
                      <span>{t("clear_all_filters")}</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="filters-panel-grid">
                {/* 1. Species Filter */}
                <div className="filter-group-block filter-group-species">
                  <label className="filter-block-label">{t("filter_species")}</label>
                  <div className="filter-options-segmented">
                    <button
                      type="button"
                      className={`seg-btn ${filterType === "all" ? "active" : ""}`}
                      onClick={() => handleTypeChange("all")}
                    >
                      {t("filter_all")}
                    </button>
                    <button
                      type="button"
                      className={`seg-btn ${filterType === "dog" ? "active" : ""}`}
                      onClick={() => handleTypeChange("dog")}
                    >
                      {t("filter_dogs")}
                    </button>
                    <button
                      type="button"
                      className={`seg-btn ${filterType === "cat" ? "active" : ""}`}
                      onClick={() => handleTypeChange("cat")}
                    >
                      {t("filter_cats")}
                    </button>
                    <button
                      type="button"
                      className={`seg-btn ${filterType === "other" ? "active" : ""}`}
                      onClick={() => handleTypeChange("other")}
                    >
                      {t("filter_others")}
                    </button>
                    <button
                      type="button"
                      className={`seg-btn ${filterType === "memorial" ? "active" : ""}`}
                      onClick={() => handleTypeChange("memorial")}
                    >
                      {t("filter_memorial")}
                    </button>
                  </div>
                </div>

                {/* 2. Status / VIP Category */}
                <div className="filter-group-block filter-group-status">
                  <label className="filter-block-label">{t("filter_status")}</label>
                  <div className="filter-options-segmented">
                    <button
                      type="button"
                      className={`seg-btn ${!isVipOnly ? "active" : ""}`}
                      onClick={() => handleVipToggle(false)}
                    >
                      {t("filter_all_status")}
                    </button>
                    <button
                      type="button"
                      className={`seg-btn vip-seg ${isVipOnly ? "active" : ""}`}
                      onClick={() => handleVipToggle(true)}
                    >
                      <Crown size={14} />
                      <span>{t("filter_vip_only")}</span>
                    </button>
                  </div>
                </div>

                {/* 3. Country Dropdown */}
                <div className="filter-group-block filter-group-country">
                  <label className="filter-block-label" htmlFor="filter-country-select">
                    {t("filter_country")}
                  </label>
                  <div className="filter-select-wrapper">
                    <span className="select-icon" style={{ fontSize: "1rem" }}>
                      {selectedCountryObj ? selectedCountryObj.flag : "🌍"}
                    </span>
                    <select
                      id="filter-country-select"
                      className="filter-dropdown-select"
                      value={filterCountry}
                      onChange={(e) => handleCountryChange(e.target.value)}
                    >
                      <option value="all">{t("filter_all_countries")}</option>
                      {representedCountries.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.name} ({c.count})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 4. State / Province Dropdown */}
                <div className="filter-group-block filter-group-state">
                  <label className="filter-block-label" htmlFor="filter-state-select">
                    {t("filter_state")}
                  </label>
                  <div className="filter-select-wrapper">
                    <MapPin size={16} className="select-icon" />
                    <select
                      id="filter-state-select"
                      className="filter-dropdown-select"
                      value={filterState}
                      onChange={(e) => handleStateChange(e.target.value)}
                    >
                      <option value="all">{t("filter_all_states")}</option>
                      {representedStates.map((st) => (
                        <option key={st.name} value={st.name}>
                          {st.name} ({st.count})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 5. City / Locality Dropdown */}
                <div className="filter-group-block filter-group-city">
                  <label className="filter-block-label" htmlFor="filter-city-select">
                    {t("filter_city")}
                  </label>
                  <div className="filter-select-wrapper">
                    <MapPin size={16} className="select-icon" />
                    <select
                      id="filter-city-select"
                      className="filter-dropdown-select"
                      value={filterCity}
                      onChange={(e) => handleCityChange(e.target.value)}
                    >
                      <option value="all">{t("filter_all_cities")}</option>
                      {availableCities.map((city) => (
                        <option key={city.name} value={city.name}>
                          {city.name} ({city.count})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 6. Sort By Dropdown */}
                <div className="filter-group-block filter-group-sort">
                  <label className="filter-block-label" htmlFor="filter-sort-select">
                    {t("filter_sort")}
                  </label>
                  <div className="filter-select-wrapper">
                    <ArrowUpDown size={16} className="select-icon" />
                    <select
                      id="filter-sort-select"
                      className="filter-dropdown-select"
                      value={sortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                    >
                      <option value="recent">{t("sort_recent")}</option>
                      <option value="loved">{t("sort_loved")}</option>
                      <option value="vip_first">{t("sort_vip_first")}</option>
                      <option value="az">{t("sort_az")}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content View: Compact Mosaic or Normal Grid */}
        {filteredPets.length > 0 ? (
          isCompact ? (
            <div className="compact-mosaic-grid">
              {filteredPets.map((pet) => (
                <CompactPetTile
                  key={pet.id}
                  pet={pet}
                  onSelectPet={onSelectPet}
                  onGiveTreat={onGiveTreat}
                />
              ))}
            </div>
          ) : (
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
          )
        ) : (
          <div className="empty-search-state">
            <p style={{ fontSize: "2.4rem", marginBottom: "12px" }}>🔍🐾</p>
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.4rem", marginBottom: "8px" }}>
              {t("empty_search_title")}
            </h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "20px" }}>
              {t("empty_search_desc")}
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                className="btn-secondary"
                onClick={handleClearAllFilters}
              >
                {t("clean_filters")}
              </button>
              <button className="btn-primary" onClick={onOpenAddPet}>
                <Sparkles size={16} />
                <span>{t("nav_cta")}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Compact Pet Tile (Small footprint ~115px for high-density view)
function CompactPetTile({ pet, onSelectPet, onGiveTreat }) {
  const { t } = useTranslation();
  const { isCooldown, formattedTime } = useTreatCooldown(pet?.id);

  const handleQuickTreat = (e) => {
    e.stopPropagation();
    if (isCooldown) return;
    onGiveTreat(pet.id);
    launchTreatSparkle(e.clientX, e.clientY);
  };

  const locationData = parsePetLocation(pet.city);

  return (
    <div
      className={`compact-pet-tile ${pet.isVip ? "is-vip vip-tile" : ""}`}
      onClick={() => onSelectPet(pet)}
      title={`${pet.name} (${pet.breed || t("type_other")}) — ${locationData.flag} ${locationData.fullLabel}`}
    >
      <img
        src={pet.photoUrl}
        alt={pet.name}
        className="compact-tile-img"
        loading="lazy"
      />

      {/* VIP Gold Tag in compact view */}
      {pet.isVip && (
        <div className="compact-vip-badge" title="VIP Golden Member">
          <Crown size={10} />
        </div>
      )}

      {/* Hover Overlay with Name, Flag, and Quick Treat */}
      <div className="compact-tile-overlay">
        <span className="compact-tile-name">
          {locationData.flag} {pet.name}
        </span>
        <button
          className={`compact-tile-treat ${isCooldown ? "is-cooldown" : ""}`}
          onClick={handleQuickTreat}
          disabled={isCooldown}
          title={isCooldown ? `${t("cooldown_available_in")}: ${formattedTime}` : t("compact_give_treat", { name: pet.name })}
          aria-label={t("give_treat")}
        >
          {isCooldown ? (
            <>
              <Clock size={10} className="cooldown-clock-icon" />
              <span style={{ fontSize: "0.68rem", fontVariantNumeric: "tabular-nums" }}>{formattedTime}</span>
            </>
          ) : (
            <>
              <Bone size={11} />
              <span>{pet.treats || 0}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
