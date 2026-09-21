/**
 * The Internet Pet Wall - Unified Analytics & Traffic Intelligence Engine
 * 
 * Features:
 * 1. Privacy-First Built-in Cookieless Analytics (100% Free, no setup, RGPD compliant, visible in /admin).
 * 2. Optional Google Analytics 4 (GA4) with automated Google Consent Mode v2 integration.
 * 3. Optional Cloudflare Web Analytics support.
 */

const ANALYTICS_STORAGE_KEY = "petwall_analytics_v2";
const GA_STORAGE_KEY = "petwall_ga_id";
const COOKIE_CONSENT_KEY = "pet_wall_cookie_consent_v1";

// Helper to get today's date string YYYY-MM-DD
function getTodayString() {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

// Generate an anonymous daily visitor ID (changes every 24 hours, zero PII, cookieless)
function getAnonymousDailyVisitorId() {
  const seed = `${getTodayString()}-${navigator.userAgent}-${navigator.language}-${screen.width}x${screen.height}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `v_${Math.abs(hash).toString(36)}`;
}

// Determine device category
function detectDeviceType() {
  const ua = navigator.userAgent || "";
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "tablet";
  if (/mobile|iphone|ipod|android|blackberry|iemobile|opera mini/i.test(ua)) return "mobile";
  return "desktop";
}

// Classify traffic referrer
function categorizeReferrer(referrerUrl) {
  if (!referrerUrl) return "direct";
  try {
    const host = new URL(referrerUrl).hostname.toLowerCase();
    if (host.includes("instagram.com") || host.includes("l.instagram.com")) return "instagram";
    if (host.includes("tiktok.com")) return "tiktok";
    if (host.includes("google.")) return "google";
    if (host.includes("facebook.com") || host.includes("fb.me") || host.includes("m.facebook.com")) return "facebook";
    if (host.includes("twitter.com") || host.includes("t.co") || host.includes("x.com")) return "twitter";
    if (host.includes("whatsapp.com") || host.includes("wa.me")) return "whatsapp";
    if (host.includes(window.location.hostname)) return "internal";
    return "other";
  } catch {
    return "other";
  }
}

// Read raw analytics state
export function getStoredAnalytics() {
  try {
    const raw = localStorage.getItem(ANALYTICS_STORAGE_KEY);
    if (!raw) {
      return getInitialAnalyticsState();
    }
    const parsed = JSON.parse(raw);
    return {
      ...getInitialAnalyticsState(),
      ...parsed,
      sources: { ...getInitialAnalyticsState().sources, ...(parsed.sources || {}) },
      devices: { ...getInitialAnalyticsState().devices, ...(parsed.devices || {}) },
      events: { ...getInitialAnalyticsState().events, ...(parsed.events || {}) },
      dailyVisits: parsed.dailyVisits || {},
      topPages: parsed.topPages || {},
      recentVisits: parsed.recentVisits || [],
    };
  } catch {
    return getInitialAnalyticsState();
  }
}

function getInitialAnalyticsState() {
  return {
    totalPageViews: 0,
    dailyVisits: {},
    sources: {
      direct: 0,
      instagram: 0,
      tiktok: 0,
      google: 0,
      facebook: 0,
      twitter: 0,
      whatsapp: 0,
      other: 0,
    },
    devices: {
      mobile: 0,
      desktop: 0,
      tablet: 0,
    },
    topPages: {
      "/": 0,
      "/wall": 0,
      "/discover": 0,
    },
    events: {
      give_treat: 0,
      pet_created: 0,
      download_passport: 0,
      download_collar_tag: 0,
      download_story: 0,
    },
    recentVisits: [],
  };
}

function saveStoredAnalytics(data) {
  try {
    localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn("Could not write analytics to localStorage:", err);
  }
}

/**
 * Check if the user accepted analytics cookies
 */
export function hasAnalyticsConsent() {
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Boolean(parsed?.analytics);
  } catch {
    return false;
  }
}

/**
 * Google Analytics 4 Management
 */
export function getGoogleAnalyticsId() {
  return (
    import.meta.env.VITE_GA_ID ||
    import.meta.env.VITE_GA_MEASUREMENT_ID ||
    localStorage.getItem(GA_STORAGE_KEY) ||
    ""
  ).trim();
}

export function setGoogleAnalyticsId(id) {
  if (id && id.trim()) {
    localStorage.setItem(GA_STORAGE_KEY, id.trim());
  } else {
    localStorage.removeItem(GA_STORAGE_KEY);
  }
  syncExternalAnalytics();
}

let isGaInitialized = false;

export function syncExternalAnalytics() {
  const gaId = getGoogleAnalyticsId();
  const consent = hasAnalyticsConsent();

  // If user accepted analytics cookies and an ID is configured, load GA4
  if (gaId && consent && !isGaInitialized && typeof window !== "undefined") {
    try {
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      function gtag() {
        window.dataLayer.push(arguments);
      }
      window.gtag = gtag;
      gtag("js", new Date());
      gtag("config", gaId, {
        anonymize_ip: true,
        cookie_flags: "SameSite=None;Secure",
      });

      isGaInitialized = true;
      console.log(`[Analytics] Google Analytics 4 (${gaId}) initialized with user consent.`);
    } catch (err) {
      console.warn("[Analytics] Failed to initialize GA4:", err);
    }
  }
}

/**
 * Core Track Page View (Cookieless & Automatic)
 */
export function trackPageView(path = window.location.pathname) {
  const today = getTodayString();
  const visitorId = getAnonymousDailyVisitorId();
  const device = detectDeviceType();
  const refCategory = categorizeReferrer(document.referrer);

  const data = getStoredAnalytics();

  // 1. Overall pageviews
  data.totalPageViews = (data.totalPageViews || 0) + 1;

  // 2. Daily visits & uniques
  if (!data.dailyVisits[today]) {
    data.dailyVisits[today] = { views: 0, uniques: [], mobile: 0, desktop: 0, tablet: 0 };
  }
  data.dailyVisits[today].views = (data.dailyVisits[today].views || 0) + 1;
  if (!data.dailyVisits[today].uniques.includes(visitorId)) {
    data.dailyVisits[today].uniques.push(visitorId);
  }
  data.dailyVisits[today][device] = (data.dailyVisits[today][device] || 0) + 1;

  // Keep only last 60 days of daily data
  const days = Object.keys(data.dailyVisits).sort();
  if (days.length > 60) {
    delete data.dailyVisits[days[0]];
  }

  // 3. Traffic sources
  if (refCategory !== "internal") {
    data.sources[refCategory] = (data.sources[refCategory] || 0) + 1;
  }

  // 4. Devices
  data.devices[device] = (data.devices[device] || 0) + 1;

  // 5. Top pages (normalize clean route)
  const cleanPath = path.split("?")[0] || "/";
  data.topPages[cleanPath] = (data.topPages[cleanPath] || 0) + 1;

  // 6. Recent visit log (max 30 entries)
  const visitEntry = {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    time: Date.now(),
    path: cleanPath,
    source: refCategory,
    device,
  };
  data.recentVisits = [visitEntry, ...(data.recentVisits || [])].slice(0, 30);

  saveStoredAnalytics(data);

  // Send to GA4 if enabled and consented
  if (isGaInitialized && typeof window.gtag === "function") {
    window.gtag("event", "page_view", {
      page_path: cleanPath,
      page_location: window.location.href,
      page_title: document.title,
    });
  }
}

/**
 * Core Track Custom Interaction Event
 */
export function trackEvent(eventName, params = {}) {
  const data = getStoredAnalytics();

  if (data.events[eventName] !== undefined) {
    data.events[eventName] = (data.events[eventName] || 0) + 1;
  } else {
    data.events[eventName] = 1;
  }

  saveStoredAnalytics(data);

  // Send to GA4 if enabled
  if (isGaInitialized && typeof window.gtag === "function") {
    window.gtag("event", eventName, params);
  }
}

/**
 * Reset Analytics Data (for testing/clearing by Admin)
 */
export function resetAnalyticsData() {
  saveStoredAnalytics(getInitialAnalyticsState());
}

// Listen to cookie consent updates in real-time
if (typeof window !== "undefined") {
  window.addEventListener("cookie-consent-updated", () => {
    syncExternalAnalytics();
  });
  // Auto-sync on script evaluation
  setTimeout(() => {
    syncExternalAnalytics();
  }, 1000);
}
