import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import WebSocket from "ws";
globalThis.WebSocket = WebSocket;
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables (.env.local or .env)
dotenv.config({ path: ".env.local" });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL 
  || (process.env.NODE_ENV === "production" ? "https://theinternetpetwall.com" : "http://localhost:5173");

// 1. Initialize Stripe
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" }) : null;

// 2. Initialize Supabase Admin (Service Role)
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = (supabaseUrl && supabaseServiceKey) 
  ? createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } })
  : null;

// Helper: Generate next official pet code (e.g. PET-0015-ES)
async function generateNextPetCode(countryCode = "ES") {
  const cc = (countryCode || "ES").toUpperCase().slice(0, 2);
  if (supabaseAdmin) {
    const { count } = await supabaseAdmin.from("pets").select("*", { count: "exact", head: true });
    const nextNum = (count || 0) + 1;
    return `PET-${String(nextNum).padStart(4, "0")}-${cc}`;
  }
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `PET-${randomNum}-${cc}`;
}

// ---------------------------------------------------------------------------
// A. STRIPE WEBHOOK (CRITICAL: Must be registered BEFORE express.json() parser)
// ---------------------------------------------------------------------------
app.post(
  "/api/stripe-webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    if (!stripe || !stripeWebhookSecret) {
      console.warn("⚠️ Stripe webhook received but Stripe is not fully configured with STRIPE_WEBHOOK_SECRET.");
      return res.status(400).send("Webhook secret not configured");
    }

    let event;
    try {
      // Cryptographically verify that the event was created by Stripe and not an attacker
      event = stripe.webhooks.constructEvent(req.body, sig, stripeWebhookSecret);
    } catch (err) {
      console.error("❌ Stripe Webhook Signature Verification Failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle payment completion
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      console.log(`✅ Payment confirmed for session: ${session.id}`);

      try {
        const metadata = session.metadata || {};
        const countryCode = metadata.countryCode || "ES";
        const code = await generateNextPetCode(countryCode);

        const newPet = {
          code,
          name: metadata.name || "Mascota",
          type: metadata.type || "dog",
          breed: metadata.breed || "Mascota",
          photo_url: metadata.photoUrl || "",
          city: metadata.city || "",
          state: metadata.state || "",
          country: metadata.country || "España",
          country_code: countryCode,
          date: new Date().toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }),
          quote: metadata.quote || "",
          owner: metadata.owner || "",
          instagram: metadata.instagram || "",
          is_vip: metadata.isVip === "true",
          is_memorial: metadata.isMemorial === "true",
          treats: 0,
          status: "active",
          payment_id: session.id,
        };

        if (supabaseAdmin) {
          const { error } = await supabaseAdmin.from("pets").insert([newPet]);
          if (error) {
            console.error("❌ Error inserting pet to Supabase after payment:", error);
          } else {
            console.log(`🎉 Pet "${newPet.name}" (${code}) successfully immortalized in Supabase!`);
          }
        } else {
          console.log("ℹ️ Pet ready to insert (Supabase not configured in this run):", newPet);
        }
      } catch (err) {
        console.error("❌ Error processing pet post-payment:", err);
      }
    }

    res.json({ received: true });
  }
);

// ---------------------------------------------------------------------------
// B. JSON PARSER & CORS FOR REST OF ENDPOINTS
// ---------------------------------------------------------------------------
const allowedOrigins = [
  CLIENT_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://theinternetpetwall.com",
  "https://www.theinternetpetwall.com"
];

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: "10mb" }));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    stripeConfigured: Boolean(stripeSecretKey),
    webhookConfigured: Boolean(stripeWebhookSecret),
    supabaseConfigured: Boolean(supabaseAdmin),
    time: new Date().toISOString(),
  });
});

// ---------------------------------------------------------------------------
// C. CREATE STRIPE CHECKOUT SESSION (Antifraud: server creates prices & metadata)
// ---------------------------------------------------------------------------
app.post("/api/create-checkout-session", async (req, res) => {
  try {
    const { petData } = req.body;

    if (!petData || !petData.name) {
      return res.status(400).json({ error: "Datos de mascota incompletos" });
    }

    if (!stripe) {
      return res.status(503).json({
        error: "Stripe no está configurado en el servidor.",
        hint: "Añade STRIPE_SECRET_KEY en tu archivo .env.local",
      });
    }

    const isVip = Boolean(petData.isVip);
    const unitAmount = isVip ? 200 : 100; // 2,00€ or 1,00€ in cents
    const productName = isVip 
      ? `The Internet Pet Wall — Pase Golden VIP ★ (${petData.name})`
      : `The Internet Pet Wall — Pase Estándar (${petData.name})`;
    const productDesc = isVip
      ? "Inscripción perpetua en el Gran Muro + Placa Oficial + Marco Dorado VIP con brillo tenue + Pasaporte Oficial 3D"
      : "Inscripción perpetua en el Gran Muro + Placa Oficial única + Pasaporte Oficial descargable";

    const baseUrl = req.headers.origin || CLIENT_URL;

    // Create session in Stripe with automatic payment methods (Apple Pay, Google Pay, Cards, etc.)
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: productName,
              description: productDesc,
              images: petData.photoUrl?.startsWith("http") ? [petData.photoUrl] : [],
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/wall?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/wall?payment=cancelled`,
      // Attach verified pet metadata to session
      metadata: {
        name: petData.name.slice(0, 100),
        type: petData.type || "dog",
        breed: (petData.breed || "").slice(0, 100),
        photoUrl: (petData.photoUrl || "").slice(0, 500),
        city: (petData.city || "").slice(0, 100),
        state: (petData.state || "").slice(0, 100),
        country: (petData.country || "España").slice(0, 100),
        countryCode: (petData.countryCode || "ES").slice(0, 10),
        quote: (petData.quote || "").slice(0, 200),
        owner: (petData.owner || "").slice(0, 100),
        instagram: (petData.instagram || "").slice(0, 100),
        isVip: String(isVip),
        isMemorial: String(Boolean(petData.isMemorial)),
      },
    });

    res.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (err) {
    console.error("❌ Error creating Stripe session:", err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// D. VERIFY CHECKOUT SESSION (Guarantees pet is created on success return)
// ---------------------------------------------------------------------------
app.get("/api/verify-checkout-session/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    if (!stripe) {
      return res.status(503).json({ error: "Stripe no configurado en servidor" });
    }

    // Retrieve verified session directly from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session || session.payment_status !== "paid") {
      return res.status(400).json({ error: "El pago no está completado" });
    }

    if (!supabaseAdmin) {
      return res.json({ success: true, message: "Pago verificado (Supabase no conectado)" });
    }

    // Check if pet was already inserted by webhook
    const { data: existingPet } = await supabaseAdmin
      .from("pets")
      .select("*")
      .eq("payment_id", session.id)
      .maybeSingle();

    if (existingPet) {
      return res.json({ success: true, pet: existingPet });
    }

    // Insert pet into Supabase
    const metadata = session.metadata || {};
    const countryCode = metadata.countryCode || "ES";
    const code = await generateNextPetCode(countryCode);

    const newPet = {
      code,
      name: metadata.name || "Mascota",
      type: metadata.type || "dog",
      breed: metadata.breed || "Mascota",
      photo_url: metadata.photoUrl || "",
      city: metadata.city || "",
      state: metadata.state || "",
      country: metadata.country || "España",
      country_code: countryCode,
      date: new Date().toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }),
      quote: metadata.quote || "",
      owner: metadata.owner || "",
      instagram: metadata.instagram || "",
      is_vip: metadata.isVip === "true",
      is_memorial: metadata.isMemorial === "true",
      treats: 0,
      status: "active",
      payment_id: session.id,
    };

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from("pets")
      .insert([newPet])
      .select()
      .single();

    if (insertError) {
      console.error("❌ Error inserting pet in verify-checkout-session:", insertError);
      return res.status(500).json({ error: insertError.message });
    }

    console.log(`🎉 [Direct Verification] Pet "${newPet.name}" (${code}) immortalized in Supabase!`);
    res.json({ success: true, pet: inserted });
  } catch (err) {
    console.error("❌ Error verifying checkout session:", err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// D. RATE-LIMITED TREAT INCREMENT (ANTI-SPAM)
// ---------------------------------------------------------------------------
app.post("/api/pets/:id/treat", async (req, res) => {
  const petId = req.params.id;
  const clientFingerprint = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "anon-client";

  if (!supabaseAdmin) {
    return res.status(503).json({ error: "Supabase no conectado en servidor." });
  }

  try {
    const { data, error } = await supabaseAdmin.rpc("give_pet_treat", {
      p_pet_id: petId,
      p_client_fingerprint: String(clientFingerprint),
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// E. SERVE PRODUCTION FRONTEND (SPA)
// ---------------------------------------------------------------------------
const distPath = path.resolve(__dirname, "../dist");
app.use(express.static(distPath));

// Fallback to React Router for client-side routing (Express 5 compatible)
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`🐾 The Internet Pet Wall Server running securely on http://localhost:${PORT}`);
  console.log(`   - Client URL: ${CLIENT_URL}`);
  console.log(`   - Stripe: ${stripeSecretKey ? "✅ Configured" : "⚠️ Missing STRIPE_SECRET_KEY"}`);
  console.log(`   - Webhook: ${stripeWebhookSecret ? "✅ Configured" : "⚠️ Missing STRIPE_WEBHOOK_SECRET"}`);
  console.log(`   - Supabase: ${supabaseAdmin ? "✅ Connected" : "⚠️ Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"}`);
});
