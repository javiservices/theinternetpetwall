import React, { createContext, useContext, useState, useEffect } from "react";
import { TRANSLATIONS } from "./translations";

export const AVAILABLE_LANGUAGES = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
];

export const LanguageContext = createContext({
  language: "en",
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
    return "en";
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

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
    }
  }, [language]);

  const t = (key, paramsOrFallback = {}, fallback = "") => {
    let params = {};
    let fallbackText = fallback;
    if (typeof paramsOrFallback === "string") {
      fallbackText = paramsOrFallback;
    } else if (typeof paramsOrFallback === "object" && paramsOrFallback !== null) {
      params = paramsOrFallback;
    }

    const dict = TRANSLATIONS[language] || TRANSLATIONS.en || TRANSLATIONS.es;
    let str = dict?.[key] || TRANSLATIONS.en?.[key] || TRANSLATIONS.es?.[key] || fallbackText || key;
    if (typeof str === "string" && Object.keys(params).length > 0) {
      Object.entries(params).forEach(([k, v]) => {
        str = str.replaceAll(`{${k}}`, String(v));
      });
    }
    return str;
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
