import { createClient } from "@supabase/supabase-js";
import * as localAdapter from "../utils/storage";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const STORAGE_MODE = import.meta.env.VITE_STORAGE_MODE || (supabaseUrl && supabaseAnonKey ? "cloud" : "local");

// Initialize Supabase Client (browser-safe, using anon key)
export const supabase = (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith("http"))
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper: map DB snake_case row to frontend camelCase object
function formatPetFromDB(row) {
  if (!row) return null;
  return {
    id: String(row.id),
    code: row.code,
    name: row.name,
    type: row.type || "dog",
    breed: row.breed || "",
    photoUrl: row.photo_url || "",
    city: row.city || "",
    state: row.state || "",
    country: row.country || "España",
    countryCode: row.country_code || "ES",
    date: row.date || new Date(row.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }),
    quote: row.quote || "",
    owner: row.owner || "",
    instagram: row.instagram || "",
    isVip: Boolean(row.is_vip),
    isMemorial: Boolean(row.is_memorial),
    treats: Number(row.treats || 0),
    status: row.status || "active",
    createdAt: row.created_at,
  };
}

export const apiService = {
  isCloudEnabled() {
    return Boolean(supabase && STORAGE_MODE === "cloud");
  },

  // 1. Get all active pets
  async getPets() {
    if (this.isCloudEnabled()) {
      try {
        const { data, error } = await supabase
          .from("pets")
          .select("*")
          .eq("status", "active")
          .order("created_at", { ascending: false });

        if (error) {
          console.warn("Supabase fetch error, falling back to local:", error.message);
          return localAdapter.getSavedPets();
        }

        if (data) {
          return data.map(formatPetFromDB);
        }
      } catch (err) {
        console.warn("Error connecting to Supabase, falling back to local:", err);
      }
    }
    return localAdapter.getSavedPets();
  },

  // 2. Upload pet photo to Supabase CDN Bucket (or fallback to local base64)
  async uploadPetPhoto(file) {
    if (this.isCloudEnabled()) {
      try {
        const fileExt = file.name.split(".").pop();
        const safeName = `pet-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
        const filePath = `uploads/${safeName}`;

        const { error: uploadError } = await supabase.storage
          .from("pet-photos")
          .upload(filePath, file, { cacheControl: "3600", upsert: false });

        if (uploadError) {
          console.error("Supabase storage upload error:", uploadError);
          throw uploadError;
        }

        const { data } = supabase.storage.from("pet-photos").getPublicUrl(filePath);
        return data.publicUrl;
      } catch (err) {
        console.warn("Storage upload failed, falling back to base64:", err);
      }
    }

    // Fallback: Client-side image compression & base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.85));
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  // 3. Create Stripe Checkout Session
  async createStripeCheckoutSession(petData) {
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ petData }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      const data = await response.json();
      return data; // { sessionId, url }
    } catch (err) {
      console.warn("Backend checkout session unreachable:", err.message);
      return null;
    }
  },

  // 3b. Verify checkout session with server
  async verifyCheckoutSession(sessionId) {
    try {
      const res = await fetch(`/api/verify-checkout-session/${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.pet) {
          data.pet = formatPetFromDB(data.pet);
        }
        return data;
      }
    } catch (err) {
      console.warn("Could not verify session with server:", err);
    }
    return null;
  },

  // 4. Rate-limited treat increment
  async giveTreat(petId) {
    try {
      const response = await fetch(`/api/pets/${petId}/treat`, {
        method: "POST",
      });
      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch {
      // Backend not running, use local storage fallback
    }
    return localAdapter.incrementTreatInStorage(petId);
  },

  // 5. System Health Check
  async checkBackendHealth() {
    try {
      const res = await fetch("/api/health");
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Server not running
    }
    return {
      status: "offline",
      stripeConfigured: false,
      webhookConfigured: false,
      supabaseConfigured: false,
    };
  },

  // 6. Realtime Subscription to New Immortalized Pets
  subscribeToPets(onNewPet) {
    if (!this.isCloudEnabled() || !supabase) return () => {};

    const channel = supabase
      .channel("public:pets")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "pets" },
        (payload) => {
          if (payload.new && payload.new.status === "active") {
            onNewPet(formatPetFromDB(payload.new));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  // 7. Update Pet in Supabase & LocalStorage
  async updatePet(petData) {
    if (this.isCloudEnabled() && supabase) {
      try {
        const { error } = await supabase
          .from("pets")
          .update({
            name: petData.name,
            type: petData.type,
            breed: petData.breed,
            photo_url: petData.photoUrl,
            city: petData.city,
            state: petData.state,
            country: petData.country,
            country_code: petData.countryCode,
            quote: petData.quote,
            owner: petData.owner,
            instagram: petData.instagram,
            is_vip: Boolean(petData.isVip),
            is_memorial: Boolean(petData.isMemorial),
            treats: Number(petData.treats || 0),
          })
          .eq("id", petData.id);

        if (error) {
          console.warn("Supabase pet update failed:", error.message);
        }
      } catch (err) {
        console.warn("Error updating pet in Supabase:", err);
      }
    }
    return localAdapter.updatePetInStorage(petData);
  },

  // 8. Delete Pet in Supabase & LocalStorage
  async deletePet(petId) {
    if (this.isCloudEnabled() && supabase) {
      try {
        const { error } = await supabase
          .from("pets")
          .update({ status: "deleted" })
          .eq("id", petId);

        if (error) {
          console.warn("Supabase pet soft delete failed:", error.message);
        }
      } catch (err) {
        console.warn("Error deleting pet in Supabase:", err);
      }
    }
    return localAdapter.deletePetFromStorage(petId);
  },
};
