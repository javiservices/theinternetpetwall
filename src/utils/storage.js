import { INITIAL_PETS } from "../data/initialPets";

const STORAGE_KEY = "internet_pet_wall_pets_v2";
const MY_PETS_KEY = "internet_pet_wall_my_pets";
const REPORTS_KEY = "internet_pet_wall_reports";
const ADMIN_PIN_KEY = "internet_pet_wall_admin_pin";

export function getSavedPets() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PETS));
      return INITIAL_PETS;
    }
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Ensure test pet Kira is present at the front with current photo
      const testPet = INITIAL_PETS.find((p) => p.id === "pet-test");
      const hasTestPet = parsed.some((p) => p.id === "pet-test");
      if (!hasTestPet && testPet) {
        const merged = [testPet, ...parsed];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        return merged;
      } else if (hasTestPet && testPet) {
        const updated = parsed.map((p) => (p.id === "pet-test" ? { ...p, photoUrl: testPet.photoUrl } : p));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      }
      return parsed;
    }
    return INITIAL_PETS;
  } catch (err) {
    console.error("Error reading from localStorage:", err);
    return INITIAL_PETS;
  }
}

export function savePets(pets) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pets));
  } catch (err) {
    console.error("Error saving pets to localStorage:", err);
  }
}

export function addPetToStorage(newPet) {
  const current = getSavedPets();
  // New pet goes first so it is immediately visible on the top of the wall
  const updated = [newPet, ...current];
  savePets(updated);
  // Auto-bookmark as "My Pet" for the creator
  saveMyPetId(newPet.id);
  return updated;
}

export function updatePetInStorage(updatedPet) {
  const current = getSavedPets();
  const updated = current.map((p) => (p.id === updatedPet.id ? { ...p, ...updatedPet } : p));
  savePets(updated);
  return updated;
}

export function deletePetFromStorage(petId) {
  const current = getSavedPets();
  const updated = current.filter((p) => p.id !== petId);
  savePets(updated);
  // Also clean up from reports
  dismissReportInStorage(petId);
  return updated;
}

export function togglePetVipInStorage(petId) {
  const current = getSavedPets();
  const updated = current.map((p) => {
    if (p.id === petId) {
      return { ...p, isVip: !p.isVip };
    }
    return p;
  });
  savePets(updated);
  return updated;
}

export function setPetTreatsInStorage(petId, amount) {
  const current = getSavedPets();
  const safeAmount = Math.max(0, parseInt(amount, 10) || 0);
  const updated = current.map((p) => {
    if (p.id === petId) {
      return { ...p, treats: safeAmount };
    }
    return p;
  });
  savePets(updated);
  return updated;
}

export function incrementTreatInStorage(petId) {
  const current = getSavedPets();
  const updated = current.map((p) => {
    if (p.id === petId) {
      return { ...p, treats: (p.treats || 0) + 1 };
    }
    return p;
  });
  savePets(updated);
  return updated;
}

// Calculate total donated to animal shelters (20% of total revenue)
export function getCharityDonationTotal() {
  const pets = getSavedPets();
  const totalRev = pets.reduce((acc, p) => acc + (p.isVip ? 2 : 1), 0);
  return Math.round(totalRev * 0.2);
}

// Reset storage to factory default demo pets
export function resetPetsStorage() {
  savePets(INITIAL_PETS);
  return INITIAL_PETS;
}

// Export backup as formatted JSON
export function exportPetsBackup() {
  const pets = getSavedPets();
  const exportData = {
    appName: "The Internet Pet Wall",
    version: "2.0",
    exportDate: new Date().toISOString(),
    totalPets: pets.length,
    pets,
  };
  return JSON.stringify(exportData, null, 2);
}

// Import backup from JSON object or string
export function importPetsBackup(jsonData) {
  let parsed = jsonData;
  if (typeof jsonData === "string") {
    parsed = JSON.parse(jsonData);
  }
  const petsArray = Array.isArray(parsed) ? parsed : parsed?.pets;
  if (!Array.isArray(petsArray) || petsArray.length === 0) {
    throw new Error("El archivo no contiene un listado válido de mascotas.");
  }
  // Validate structure of each pet object to prevent corrupted or malicious imports
  const validPets = petsArray.filter(
    (p) =>
      p &&
      typeof p === "object" &&
      typeof p.id === "string" &&
      typeof p.name === "string" &&
      typeof p.code === "string" &&
      typeof p.photoUrl === "string"
  );
  if (validPets.length === 0) {
    throw new Error("Ninguna mascota en el archivo tiene una estructura válida (id, name, code, photoUrl).");
  }
  savePets(validPets);
  return validPets;
}

// Reports management
export function getReportedPets() {
  try {
    const data = localStorage.getItem(REPORTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function reportPetInStorage(petId, reason = "Contenido inapropiado") {
  const reports = getReportedPets();
  const existing = reports.find((r) => r.petId === petId);
  if (!existing) {
    reports.push({
      petId,
      reason,
      date: new Date().toISOString(),
    });
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
  }
  return reports;
}

export function dismissReportInStorage(petId) {
  const reports = getReportedPets();
  const filtered = reports.filter((r) => r.petId !== petId);
  localStorage.setItem(REPORTS_KEY, JSON.stringify(filtered));
  return filtered;
}

// "My Pets" Bookmarks
export function getMyPetIds() {
  try {
    const data = localStorage.getItem(MY_PETS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveMyPetId(petId) {
  const myPets = getMyPetIds();
  if (!myPets.includes(petId)) {
    const updated = [petId, ...myPets];
    localStorage.setItem(MY_PETS_KEY, JSON.stringify(updated));
    return updated;
  }
  return myPets;
}

export function removeMyPetId(petId) {
  const myPets = getMyPetIds();
  const updated = myPets.filter((id) => id !== petId);
  localStorage.setItem(MY_PETS_KEY, JSON.stringify(updated));
  return updated;
}

// Admin PIN
export function getAdminPin() {
  return localStorage.getItem(ADMIN_PIN_KEY) || "1234";
}

export function setAdminPin(newPin) {
  if (newPin && newPin.trim().length >= 4) {
    localStorage.setItem(ADMIN_PIN_KEY, newPin.trim());
    return true;
  }
  return false;
}
