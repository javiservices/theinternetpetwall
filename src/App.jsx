import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { LanguageProvider } from "./i18n/LanguageContext";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { HowItWorks } from "./components/HowItWorks";
import { MuroDeHonorSection } from "./components/HomeSections/MuroDeHonorSection";
import { TopPetsSection } from "./components/HomeSections/TopPetsSection";
import { RecentPetsSection } from "./components/HomeSections/RecentPetsSection";
import { FullWallView } from "./components/FullWallView";
import { DiscoverView } from "./components/DiscoverView";
import { PetDetailModal } from "./components/PetDetailModal";
import { AddPetModal } from "./components/AddPetModal/AddPetModal";
import { PassportModal } from "./components/PassportModal";
import { StoryShareModal } from "./components/StoryShareModal";
import { CollarTagModal } from "./components/CollarTagModal";
import { Footer } from "./components/Footer";
import { AdminDashboard } from "./components/Admin/AdminDashboard";
import { LegalModal } from "./components/Legal/LegalModal";
import { LegalPageView } from "./components/Legal/LegalPageView";
import { CookieBanner } from "./components/CookieBanner/CookieBanner";
import { getSavedPets, addPetToStorage, incrementTreatInStorage, saveMyPetId } from "./utils/storage";
import { setTreatCooldown, getCooldownRemaining } from "./utils/treatCooldown";
import { apiService } from "./services/api";
import { launchPetConfetti } from "./utils/confetti";
import { playCelebrationFanfare } from "./utils/soundEffects";
import { parsePetLocation } from "./data/worldLocations";

function PetWallApp() {
  const [pets, setPets] = useState(() => getSavedPets());
  const [selectedPet, setSelectedPet] = useState(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const petCodeParam = searchParams.get("pet");
      if (petCodeParam) {
        const loaded = getSavedPets();
        return (
          loaded.find(
            (p) => p.code.toLowerCase() === petCodeParam.toLowerCase() || p.id === petCodeParam
          ) || null
        );
      }
    } catch {
      return null;
    }
    return null;
  });
  const [passportPet, setPassportPet] = useState(null);
  const [storyPet, setStoryPet] = useState(null);
  const [collarTagPet, setCollarTagPet] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  // Initial load: fetch from cloud (Supabase) or local storage
  useEffect(() => {
    let isMounted = true;
    apiService.getPets().then((loaded) => {
      if (isMounted && loaded && loaded.length > 0) {
        setPets(loaded);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Listen for real-time immortalized pets (Supabase Postgres changes)
  useEffect(() => {
    const unsubscribe = apiService.subscribeToPets((newPet) => {
      setPets((prev) => {
        if (prev.some((p) => p.code === newPet.code || p.id === newPet.id)) return prev;
        return [newPet, ...prev];
      });
    });
    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  // Sync pets and deep links on URL param changes + handle Stripe Checkout redirect
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);

    // 1. Stripe Checkout payment return handler
    if (searchParams.get("payment") === "success") {
      const sessionId = searchParams.get("session_id");
      launchPetConfetti();
      playCelebrationFanfare();

      const processSuccessfulPayment = async () => {
        let immortalizedPet = null;
        if (sessionId) {
          const verifyData = await apiService.verifyCheckoutSession(sessionId);
          if (verifyData && verifyData.pet) {
            immortalizedPet = verifyData.pet;
          }
        }

        const freshPets = await apiService.getPets();
        setPets(freshPets);

        if (!immortalizedPet) {
          const pendingRaw = sessionStorage.getItem("pending_pet_checkout");
          if (pendingRaw) {
            try {
              const draft = JSON.parse(pendingRaw);
              immortalizedPet = freshPets.find((p) => p.name.toLowerCase() === draft.name.toLowerCase()) || freshPets[0];
            } catch {
              // ignore
            }
          } else {
            immortalizedPet = freshPets[0];
          }
        }

        if (immortalizedPet) {
          setPassportPet(immortalizedPet);
          if (immortalizedPet.id) {
            saveMyPetId(immortalizedPet.id);
          }
        }
        sessionStorage.removeItem("pending_pet_checkout");

        // Clean up URL query parameters after state is updated
        navigate("/wall", { replace: true });
      };

      processSuccessfulPayment();
      return;
    }

    // 2. Deep link support: if URL contains ?pet=PET-XXXX, auto-open modal!
    const petCodeParam = searchParams.get("pet");
    if (petCodeParam) {
      const found = pets.find(
        (p) => p.code.toLowerCase() === petCodeParam.toLowerCase() || p.id === petCodeParam
      );
      if (found) {
        setSelectedPet(found);
      }
    }

    // 3. Legal modal deep link support: ?legal=privacy | terms | cookies | legal
    const legalParam = searchParams.get("legal");
    if (legalParam) {
      setLegalModalTab(legalParam);
    }
  }, [location.search, pets, navigate]);

  // Compute live stats
  const totalPets = pets.length;
  const totalTreats = pets.reduce((acc, p) => acc + (p.treats || 0), 0);
  const totalCountries = React.useMemo(() => {
    const countrySet = new Set();
    pets.forEach((p) => {
      const loc = parsePetLocation(p.city, p);
      if (loc.countryCode && loc.countryCode !== "GL") {
        countrySet.add(loc.countryCode);
      }
    });
    return Math.max(countrySet.size, 1);
  }, [pets]);

  // Handle giving a treat (rate-limited via backend RPC with local fallback)
  const handleGiveTreat = async (petId) => {
    // Prevent extra clicks if already on cooldown
    if (getCooldownRemaining(petId) > 0) {
      return;
    }

    // Set 5-minute cooldown (300s) immediately
    setTreatCooldown(petId, 300);

    setPets((prev) =>
      prev.map((p) => (p.id === petId ? { ...p, treats: (p.treats || 0) + 1 } : p))
    );
    if (selectedPet && selectedPet.id === petId) {
      setSelectedPet((prev) => ({ ...prev, treats: (prev.treats || 0) + 1 }));
    }

    const res = await apiService.giveTreat(petId);
    if (res && res.cooldown_remaining) {
      setTreatCooldown(petId, res.cooldown_remaining);
    }
  };

  // Handle new pet creation (local demo mode fallback)
  const handlePetCreated = (newPet) => {
    const updated = addPetToStorage(newPet);
    setPets(updated);
    setIsAddModalOpen(false);
    setPassportPet(newPet);
  };

  const handleNavigateToWall = () => {
    navigate("/wall");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="app-layout">
      {/* Show Consumer Navbar only on public routes */}
      {!isAdminRoute && (
        <Navbar
          totalPets={totalPets}
          onOpenAddPet={() => setIsAddModalOpen(true)}
          onSelectPet={(pet) => setSelectedPet(pet)}
        />
      )}

      <Routes>
        {/* HOME ROUTE */}
        <Route
          path="/"
          element={
            <main>
              <Hero
                totalPets={totalPets}
                totalTreats={totalTreats}
                totalCountries={totalCountries}
                onOpenAddPet={() => setIsAddModalOpen(true)}
                onNavigateToWall={handleNavigateToWall}
              />

              {/* Muro de Honor: Podio de los 3 Peludos del Mes */}
              <MuroDeHonorSection
                pets={pets}
                onSelectPet={(pet) => setSelectedPet(pet)}
                onGiveTreat={handleGiveTreat}
              />

              <HowItWorks />

              <TopPetsSection
                pets={pets}
                onSelectPet={(pet) => setSelectedPet(pet)}
                onGiveTreat={handleGiveTreat}
                onNavigateToWall={handleNavigateToWall}
              />

              <RecentPetsSection
                pets={pets}
                onSelectPet={(pet) => setSelectedPet(pet)}
                onGiveTreat={handleGiveTreat}
                onNavigateToWall={handleNavigateToWall}
              />
            </main>
          }
        />

        {/* FULL WALL ROUTE */}
        <Route
          path="/wall"
          element={
            <main>
              <FullWallView
                pets={pets}
                onSelectPet={(pet) => setSelectedPet(pet)}
                onGiveTreat={handleGiveTreat}
                onOpenAddPet={() => setIsAddModalOpen(true)}
              />
            </main>
          }
        />

        {/* DISCOVER SWIPE ROUTE */}
        <Route
          path="/discover"
          element={
            <main>
              <DiscoverView
                pets={pets}
                onGiveTreat={handleGiveTreat}
                onSelectPet={(pet) => setSelectedPet(pet)}
              />
            </main>
          }
        />

        {/* ADMIN DASHBOARD ROUTE */}
        <Route
          path="/admin"
          element={
            <AdminDashboard
              pets={pets}
              onPetsChange={(updatedList) => setPets(updatedList)}
            />
          }
        />

        {/* DEDICATED INDIVIDUAL LEGAL PAGES (Canonical English URLs) */}
        <Route path="/privacy" element={<LegalPageView type="privacy" />} />
        <Route path="/terms" element={<LegalPageView type="terms" />} />
        <Route path="/cookies" element={<LegalPageView type="cookies" />} />
        <Route path="/legal" element={<LegalPageView type="legal" />} />

        {/* Redirect legacy Spanish paths to canonical English URLs */}
        <Route path="/privacidad" element={<Navigate to="/privacy" replace />} />
        <Route path="/terminos" element={<Navigate to="/terms" replace />} />
        <Route path="/aviso-legal" element={<Navigate to="/legal" replace />} />

        {/* Fallback to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Show Consumer Footer only on public routes */}
      {!isAdminRoute && (
        <Footer
          onOpenAddPet={() => setIsAddModalOpen(true)}
          onOpenLegal={(tab) => setLegalModalTab(tab || "privacy")}
        />
      )}

      {/* Cookie Consent Management Platform (CMP) */}
      <CookieBanner />

      {/* Modals */}
      {selectedPet && (
        <PetDetailModal
          pet={selectedPet}
          onClose={() => setSelectedPet(null)}
          onGiveTreat={handleGiveTreat}
          onViewPassport={(pet) => {
            setSelectedPet(null);
            setPassportPet(pet);
          }}
          onOpenStory={(pet) => {
            setStoryPet(pet);
          }}
          onOpenCollarTag={(pet) => {
            setCollarTagPet(pet);
          }}
        />
      )}

      {passportPet && (
        <PassportModal
          pet={passportPet}
          onClose={() => setPassportPet(null)}
          onOpenStory={(pet) => {
            setStoryPet(pet);
          }}
          onOpenCollarTag={(pet) => {
            setCollarTagPet(pet);
          }}
        />
      )}

      {storyPet && (
        <StoryShareModal
          pet={storyPet}
          onClose={() => setStoryPet(null)}
        />
      )}

      {collarTagPet && (
        <CollarTagModal
          pet={collarTagPet}
          onClose={() => setCollarTagPet(null)}
        />
      )}

      {isAddModalOpen && (
        <AddPetModal
          currentCount={totalPets}
          onClose={() => setIsAddModalOpen(false)}
          onPetCreated={handlePetCreated}
          onOpenLegal={(tab) => setLegalModalTab(tab || "terms")}
        />
      )}

      {legalModalTab && (
        <LegalModal
          initialTab={legalModalTab}
          onClose={() => {
            setLegalModalTab(null);
            const sp = new URLSearchParams(window.location.search);
            if (sp.has("legal")) {
              sp.delete("legal");
              const q = sp.toString();
              navigate(q ? `${location.pathname}?${q}` : location.pathname, { replace: true });
            }
          }}
        />
      )}
    </div>
  );
}

export function App() {
  return (
    <LanguageProvider>
      <PetWallApp />
    </LanguageProvider>
  );
}

export default App;
