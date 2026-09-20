import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "pet_wall_treat_cooldowns_v1";
const DEFAULT_COOLDOWN_SECONDS = 300; // 5 minutos por mascota

// Helper: load all active cooldowns from localStorage
function getStoredCooldowns() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    const now = Date.now();
    // Clean up expired entries
    const valid = {};
    Object.entries(parsed).forEach(([id, expTime]) => {
      if (typeof expTime === "number" && expTime > now) {
        valid[id] = expTime;
      }
    });
    return valid;
  } catch {
    return {};
  }
}

// Helper: get remaining seconds for a pet
export function getCooldownRemaining(petId) {
  if (!petId) return 0;
  const cooldowns = getStoredCooldowns();
  const expiresAt = cooldowns[petId];
  if (!expiresAt) return 0;
  const diffMs = expiresAt - Date.now();
  return diffMs > 0 ? Math.ceil(diffMs / 1000) : 0;
}

// Helper: set a cooldown for a pet and broadcast event
export function setTreatCooldown(petId, seconds = DEFAULT_COOLDOWN_SECONDS) {
  if (!petId) return;
  const cooldowns = getStoredCooldowns();
  const safeSeconds = Math.max(1, parseInt(seconds, 10) || DEFAULT_COOLDOWN_SECONDS);
  cooldowns[petId] = Date.now() + safeSeconds * 1000;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cooldowns));
  } catch (err) {
    console.warn("Could not save treat cooldown:", err);
  }
  // Broadcast update to all components on the page
  window.dispatchEvent(new CustomEvent("pet-treat-cooldown-updated", { detail: { petId } }));
}

// Format seconds to mm:ss (e.g. 04:59)
export function formatCooldownTime(seconds) {
  const safeSec = Math.max(0, parseInt(seconds, 10) || 0);
  const mins = Math.floor(safeSec / 60);
  const secs = safeSec % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

// React Hook for live countdown on any pet button
export function useTreatCooldown(petId) {
  const [remainingSeconds, setRemainingSeconds] = useState(() => getCooldownRemaining(petId));

  const startCooldown = useCallback(
    (seconds = DEFAULT_COOLDOWN_SECONDS) => {
      setTreatCooldown(petId, seconds);
      setRemainingSeconds(seconds);
    },
    [petId]
  );

  useEffect(() => {
    if (!petId) {
      setRemainingSeconds(0);
      return;
    }

    const checkState = () => {
      const rem = getCooldownRemaining(petId);
      setRemainingSeconds(rem);
    };

    checkState();

    // Listen to updates from other components / tabs
    const handleUpdate = (e) => {
      if (!e.detail || e.detail.petId === petId) {
        checkState();
      }
    };

    window.addEventListener("pet-treat-cooldown-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("pet-treat-cooldown-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [petId]);

  // Live timer interval every 1 second while countdown is active
  useEffect(() => {
    if (!petId || remainingSeconds <= 0) return;

    const timer = setInterval(() => {
      const rem = getCooldownRemaining(petId);
      setRemainingSeconds(rem);
      if (rem <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [petId, remainingSeconds > 0]);

  return {
    isCooldown: remainingSeconds > 0,
    remainingSeconds,
    formattedTime: formatCooldownTime(remainingSeconds),
    startCooldown,
  };
}
