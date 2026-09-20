import React, { createContext, useContext, useState, useEffect } from "react";
import { TRANSLATIONS } from "./translations";

export const AVAILABLE_LANGUAGES = [
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
];

const LanguageContext = createContext({
  language: "es",
  setLanguage: () => {},
  t: (key) => key,
  availableLanguages: AVAILABLE_LANGUAGES,
});

export function LanguageProvider({ children }) {
  const [language, setLangState] = useState(() => {
    try {
      const saved = localStorage.getItem("pet_wall_lang");
      if (saved && TRANSLATIONS[saved]) return saved;
      
      const browser = navigator.language?.slice(0, 2);
      if (browser && TRANSLATIONS[browser]) return browser;
    } catch {
      // fallback
    }
    return "es";
  });

  const setLanguage = (code) => {
    if (TRANSLATIONS[code]) {
      setLangState(code);
      try {
        localStorage.setItem("pet_wall_lang", code);
      } catch (e) {
        console.error("Error saving lang to localStorage", e);
      }
    }
  };

  const t = (key, fallback = "") => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.es;
    if (dict && dict[key]) {
      return dict[key];
    }
    // Fallback to ES then EN then key
    if (TRANSLATIONS.es && TRANSLATIONS.es[key]) {
      return TRANSLATIONS.es[key];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, availableLanguages: AVAILABLE_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LanguageContext);
}
