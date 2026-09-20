import { Country, State, City } from "country-state-city";

/**
 * Complete Worldwide Geographic Hierarchy System
 * Covers all 250 countries, 4,960+ states/provinces, and 148,000+ cities/localities worldwide.
 */

// All 50 Spanish provinces + 2 autonomous cities
export const SPANISH_PROVINCES = [
  { code: "C", name: "A Coruña", cscCode: "GA" },
  { code: "VI", name: "Álava", cscCode: "PV" },
  { code: "AB", name: "Albacete", cscCode: "CM" },
  { code: "A", name: "Alicante", cscCode: "VC" },
  { code: "AL", name: "Almería", cscCode: "AN" },
  { code: "AS", name: "Asturias", cscCode: "AS" },
  { code: "AV", name: "Ávila", cscCode: "AV" },
  { code: "BA", name: "Badajoz", cscCode: "EX" },
  { code: "B", name: "Barcelona", cscCode: "CT" },
  { code: "BU", name: "Burgos", cscCode: "BU" },
  { code: "CC", name: "Cáceres", cscCode: "EX" },
  { code: "CA", name: "Cádiz", cscCode: "AN" },
  { code: "S", name: "Cantabria", cscCode: "CB" },
  { code: "CS", name: "Castellón", cscCode: "VC" },
  { code: "CR", name: "Ciudad Real", cscCode: "CM" },
  { code: "CO", name: "Córdoba", cscCode: "AN" },
  { code: "CU", name: "Cuenca", cscCode: "CM" },
  { code: "GI", name: "Girona", cscCode: "CT" },
  { code: "GR", name: "Granada", cscCode: "AN" },
  { code: "GU", name: "Guadalajara", cscCode: "CM" },
  { code: "SS", name: "Guipúzcoa (Gipuzkoa)", cscCode: "PV" },
  { code: "H", name: "Huelva", cscCode: "AN" },
  { code: "HU", name: "Huesca", cscCode: "AR" },
  { code: "PM", name: "Islas Baleares", cscCode: "PM" },
  { code: "J", name: "Jaén", cscCode: "AN" },
  { code: "LO", name: "La Rioja", cscCode: "RI" },
  { code: "GC", name: "Las Palmas", cscCode: "CN" },
  { code: "LE", name: "León", cscCode: "LE" },
  { code: "L", name: "Lleida", cscCode: "CT" },
  { code: "LU", name: "Lugo", cscCode: "GA" },
  { code: "M", name: "Madrid", cscCode: "MD" },
  { code: "MA", name: "Málaga", cscCode: "AN" },
  { code: "MU", name: "Murcia", cscCode: "MC" },
  { code: "NA", name: "Navarra", cscCode: "NC" },
  { code: "OR", name: "Ourense", cscCode: "GA" },
  { code: "P", name: "Palencia", cscCode: "P" },
  { code: "PO", name: "Pontevedra", cscCode: "GA" },
  { code: "SA", name: "Salamanca", cscCode: "SA" },
  { code: "TF", name: "Santa Cruz de Tenerife", cscCode: "CN" },
  { code: "SG", name: "Segovia", cscCode: "SG" },
  { code: "SE", name: "Sevilla", cscCode: "AN" },
  { code: "SO", name: "Soria", cscCode: "SO" },
  { code: "T", name: "Tarragona", cscCode: "CT" },
  { code: "TE", name: "Teruel", cscCode: "AR" },
  { code: "TO", name: "Toledo", cscCode: "CM" },
  { code: "V", name: "Valencia", cscCode: "VC" },
  { code: "VA", name: "Valladolid", cscCode: "VA" },
  { code: "BI", name: "Vizcaya (Bizkaia)", cscCode: "PV" },
  { code: "ZA", name: "Zamora", cscCode: "ZA" },
  { code: "Z", name: "Zaragoza", cscCode: "AR" },
  { code: "CE", name: "Ceuta", cscCode: "CE" },
  { code: "ML", name: "Melilla", cscCode: "ML" }
];

// Municipalities for Asturias and provinces that have 0 cities in basic datasets
const SPANISH_SPECIAL_CITIES = {
  AS: [
    "Gijón", "Oviedo", "Avilés", "Siero", "Mieres", "Langreo", "Llanes", "Cangas de Onís",
    "Ribadesella", "Valdés (Luarca)", "Castrillón", "San Martín del Rey Aurelio", "Laviana",
    "Lena", "Aller", "Carreño (Candás)", "Gozón (Luanco)", "Villaviciosa", "Piloña",
    "Nava", "Tineo", "Cangas del Narcea", "Pravia", "Grao / Grado", "Navia", "Noreña",
    "Colunga", "Parres (Arriondas)", "Ribera de Arriba", "Tapia de Casariego", "El Franco",
    "Vegadeo", "Castropol", "Candamo", "Cudillero", "Riosa", "Morcín", "Quirós", "Somiedo",
    "Belmonte de Miranda", "Boal", "Cabrales", "Caso", "Coaña", "Degaña", "Illano",
    "Illas", "Onís", "Peñamellera Alta", "Peñamellera Baja", "Pesoz", "Proaza", "Ribadedeva",
    "San Tirso de Abres", "Santa Eulalia de Oscos", "Santo Adriano", "Sariego", "Sobrescobio",
    "Taramundi", "Teverga", "Villanueva de Oscos", "Villayón", "Yernes y Tameza"
  ],
  BU: [
    "Burgos", "Aranda de Duero", "Miranda de Ebro", "Briviesca", "Lerma", "Medina de Pomar",
    "Villarcayo", "Roa", "Salas de los Infantes", "Valle de Mena", "Belorado", "Espinosa de los Monteros"
  ],
  P: [
    "Palencia", "Aguilar de Campoo", "Guardo", "Venta de Baños", "Villamuriel de Cerrato",
    "Saldaña", "Carrión de los Condes", "Herrera de Pisuerga", "Cervera de Pisuerga"
  ],
  SA: [
    "Salamanca", "Béjar", "Ciudad Rodrigo", "Santa Marta de Tormes", "Villamayor",
    "Carbajosa de la Sagrada", "Peñaranda de Bracamonte", "Guijuelo", "Alba de Tormes", "Villares de la Reina"
  ],
  SG: [
    "Segovia", "Cuéllar", "El Espinar", "Real Sitio de San Ildefonso", "Palazuelos de Eresma",
    "Cantalejo", "La Lastrilla", "San Cristóbal de Segovia", "Carbonero el Mayor"
  ],
  SO: [
    "Soria", "Almazán", "El Burgo de Osma", "San Esteban de Gormaz", "Ágreda",
    "Golmayo", "Ólvega", "San Leonardo de Yagüe", "Covaleda"
  ],
  VA: [
    "Valladolid", "Medina del Campo", "Laguna de Duero", "Arroyo de la Encomienda",
    "Tordesillas", "Tudela de Duero", "Cigales", "Peñafiel", "Íscar", "Medina de Rioseco",
    "Zaratán", "Simancas", "Aldeamayor de San Martín", "Santovenia de Pisuerga"
  ],
  ZA: [
    "Zamora", "Benavente", "Toro", "Morales del Vino", "Puebla de Sanabria",
    "Villaralbo", "Fuentesaúco", "Villalpando", "Fermoselle"
  ],
  AV: [
    "Ávila", "Arévalo", "Arenas de San Pedro", "Las Navas del Marqués", "Candeleda",
    "El Tiemblo", "Cebreros", "El Barco de Ávila", "El Hoyo de Pinares", "Piedrahíta"
  ]
};

// Priority countries to show first in selector
const PRIORITY_CODES = ["ES", "MX", "AR", "CO", "CL", "PE", "US", "FR", "DE", "IT", "GB", "UY", "EC", "BR", "CA"];

/**
 * Returns all 250 countries with flags and localized names
 */
export function getAllCountries(locale = "es") {
  let displayNames = null;
  try {
    displayNames = new Intl.DisplayNames([locale, "es", "en"], { type: "region" });
  } catch (e) {}

  const all = Country.getAllCountries().map((c) => {
    let localizedName = c.name;
    if (displayNames) {
      try {
        const tr = displayNames.of(c.isoCode);
        if (tr) localizedName = tr;
      } catch (err) {}
    }
    return {
      code: c.isoCode,
      name: localizedName,
      flag: c.flag || "🌍",
      phonecode: c.phonecode
    };
  });

  // Sort with priority codes on top, then alphabetical by name
  return all.sort((a, b) => {
    const idxA = PRIORITY_CODES.indexOf(a.code);
    const idxB = PRIORITY_CODES.indexOf(b.code);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.name.localeCompare(b.name, locale);
  });
}

export const WORLD_COUNTRIES = getAllCountries("es");

export function getCountryByCode(code, locale = "es") {
  const list = getAllCountries(locale);
  return list.find((c) => c.code === code) || list[0];
}

/**
 * Returns all provinces/states for a given country
 */
export function getStatesForCountry(countryCode) {
  if (!countryCode) return [];

  // If Spain, return all 50 official provinces + 2 autonomous cities
  if (countryCode === "ES") {
    return SPANISH_PROVINCES.map((p) => ({
      code: p.code,
      name: p.name,
      cscCode: p.cscCode
    }));
  }

  // Otherwise query country-state-city
  const states = State.getStatesOfCountry(countryCode);
  if (!states || states.length === 0) {
    // Fallback if country has no state subdivisions
    return [{ code: countryCode, name: "Región Principal" }];
  }

  return states
    .map((s) => ({
      code: s.isoCode,
      name: s.name
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Returns cities/municipalities for a state in a country
 */
export function getCitiesForState(countryCode, stateCode, stateName = "") {
  if (!countryCode || !stateCode) return [];

  // Check Spain special provinces first (Asturias, Burgos, Palencia, etc.)
  if (countryCode === "ES") {
    if (SPANISH_SPECIAL_CITIES[stateCode]) {
      return [...SPANISH_SPECIAL_CITIES[stateCode]].sort((a, b) => a.localeCompare(b));
    }

    // Map province code to CSC state code if needed
    const prov = SPANISH_PROVINCES.find((p) => p.code === stateCode);
    const lookupCode = prov ? prov.cscCode : stateCode;

    const cscCities = City.getCitiesOfState("ES", lookupCode);
    if (cscCities && cscCities.length > 0) {
      const names = [...new Set(cscCities.map((c) => c.name))];
      return names.sort((a, b) => a.localeCompare(b));
    }

    // If still no cities found, return province name as primary locality
    return [prov ? prov.name : stateName || "Localidad Principal"];
  }

  // For any other country, query country-state-city
  const cities = City.getCitiesOfState(countryCode, stateCode);
  if (!cities || cities.length === 0) {
    return [stateName || "Localidad Principal"];
  }

  const unique = [...new Set(cities.map((c) => c.name))];
  return unique.sort((a, b) => a.localeCompare(b));
}

/**
 * Normalizes any pet's location into structured country, state, city, and flag
 */
export function parsePetLocation(cityString = "", petData = null) {
  // If pet already has structured attributes
  if (petData && petData.countryCode && petData.city) {
    const country = getCountryByCode(petData.countryCode);
    return {
      cityName: petData.city,
      stateName: petData.state || "",
      countryName: petData.country || country.name,
      countryCode: petData.countryCode,
      flag: country.flag || "🌍",
      displayLocation: petData.state
        ? `${petData.city}, ${petData.state}`
        : `${petData.city}, ${petData.country || country.name}`,
      fullLabel: `${petData.city}${petData.state ? `, ${petData.state}` : ""}, ${petData.country || country.name}`
    };
  }

  if (!cityString || typeof cityString !== "string") {
    return {
      cityName: "Planeta Tierra",
      stateName: "",
      countryName: "Mundo",
      countryCode: "GL",
      flag: "🌍",
      displayLocation: "Planeta Tierra",
      fullLabel: "Planeta Tierra"
    };
  }

  const parts = cityString.split(",").map((s) => s.trim());
  const cityName = parts[0] || cityString;
  const stateOrCountry = parts.length > 2 ? parts[1] : "";
  const countryNameFromStr = parts.length > 2 ? parts[2] : parts.length > 1 ? parts[1] : "";

  // Match country
  const allCountries = getAllCountries("es");
  let matchedCountry = null;
  if (countryNameFromStr) {
    const clean = countryNameFromStr.toLowerCase();
    matchedCountry = allCountries.find(
      (c) =>
        c.name.toLowerCase() === clean ||
        clean.includes(c.name.toLowerCase()) ||
        c.code.toLowerCase() === clean ||
        (clean === "ee. uu." && c.code === "US") ||
        (clean === "usa" && c.code === "US")
    );
  }

  if (!matchedCountry) {
    // Check if city matches any known Spanish province or world capital
    const prov = SPANISH_PROVINCES.find(
      (p) => p.name.toLowerCase() === cityName.toLowerCase() || cityName.toLowerCase().includes(p.name.toLowerCase())
    );
    if (prov) {
      matchedCountry = allCountries.find((c) => c.code === "ES");
    }
  }

  const countryName = matchedCountry ? matchedCountry.name : countryNameFromStr || "España";
  const countryCode = matchedCountry ? matchedCountry.code : "ES";
  const flag = matchedCountry ? matchedCountry.flag : "🇪🇸";
  const stateName = stateOrCountry || "";

  return {
    cityName,
    stateName,
    countryName,
    countryCode,
    flag,
    displayLocation: stateName ? `${cityName}, ${stateName}` : `${cityName}, ${countryName}`,
    fullLabel: `${cityName}${stateName ? `, ${stateName}` : ""}, ${countryName}`
  };
}

/**
 * Async live lookup via Photon (OpenStreetMap) to find any pueblo, municipality, or hamlet in the world
 */
export async function searchOpenStreetMap(query, countryCode = "") {
  if (!query || query.trim().length < 2) return [];
  try {
    let url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=8`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data || !data.features) return [];

    return data.features
      .map((f) => {
        const p = f.properties || {};
        return {
          name: p.name,
          state: p.state || p.county || "",
          country: p.country || "",
          countryCode: (p.countrycode || "").toUpperCase(),
          display: `${p.name}${p.state ? `, ${p.state}` : ""}${p.country ? ` (${p.country})` : ""}`
        };
      })
      .filter((item) => !countryCode || !item.countryCode || item.countryCode === countryCode.toUpperCase());
  } catch (e) {
    return [];
  }
}
