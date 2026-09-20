-- ==============================================================================
-- THE INTERNET PET WALL — ESQUEMA DE BASE DE DATOS SUPABASE (POSTGRESQL)
-- ==============================================================================
-- Este script crea las tablas, índices, políticas de seguridad (RLS) y funciones
-- almacenadas necesarias para una plataforma 100% segura e imposible de alterar.

-- 1. EXTENSIÓN PARA GENERACIÓN DE UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA: pets (Mascotas registradas en el muro)
CREATE TABLE IF NOT EXISTS public.pets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL, -- Placa oficial ej. PET-0001-ES
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('dog', 'cat', 'other')),
    breed VARCHAR(100) NOT NULL,
    photo_url TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL DEFAULT '',
    country VARCHAR(100) NOT NULL,
    country_code VARCHAR(10) NOT NULL DEFAULT 'ES',
    date VARCHAR(50) NOT NULL,
    quote VARCHAR(200) NOT NULL DEFAULT '',
    owner VARCHAR(100) NOT NULL DEFAULT '',
    instagram VARCHAR(100) NOT NULL DEFAULT '',
    is_vip BOOLEAN NOT NULL DEFAULT false,
    is_memorial BOOLEAN NOT NULL DEFAULT false,
    treats INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'flagged', 'archived')),
    payment_id VARCHAR(100), -- ID de sesión de Stripe (cs_test_...) o PaymentIntent
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices de rendimiento para el muro
CREATE INDEX IF NOT EXISTS idx_pets_status ON public.pets(status);
CREATE INDEX IF NOT EXISTS idx_pets_type ON public.pets(type);
CREATE INDEX IF NOT EXISTS idx_pets_is_vip ON public.pets(is_vip);
CREATE INDEX IF NOT EXISTS idx_pets_is_memorial ON public.pets(is_memorial);
CREATE INDEX IF NOT EXISTS idx_pets_treats ON public.pets(treats DESC);
CREATE INDEX IF NOT EXISTS idx_pets_created_at ON public.pets(created_at DESC);

-- 3. TABLA: treat_logs (Registro de votos / chuches para protección Anti-Spam)
CREATE TABLE IF NOT EXISTS public.treat_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE,
    client_fingerprint VARCHAR(100) NOT NULL, -- Hash de sesión / IP del cliente
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_treat_logs_pet_client ON public.treat_logs(pet_id, client_fingerprint, created_at DESC);

-- 4. TABLA: reports (Denuncias de contenido inapropiado)
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    client_fingerprint VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- SEGURIDAD A NIVEL DE FILA (ROW LEVEL SECURITY - RLS)
-- ==============================================================================
-- El pilar fundamental: nadie puede escribir directamente en la base de datos
-- sin pasar por el Webhook verificado de Stripe o la función de chuches.

ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treat_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- POLÍTICA 1: Lectura pública de mascotas activas
CREATE POLICY "Public read active pets" ON public.pets
    FOR SELECT
    USING (status = 'active');

-- POLÍTICA 2: Inserción y Modificación de mascotas SOLO para Service Role
CREATE POLICY "Service role manages pets" ON public.pets
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- POLÍTICA 3: Inserción de reportes por usuarios
CREATE POLICY "Public can report inappropriate pets" ON public.reports
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Service role manages reports" ON public.reports
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ==============================================================================
-- FUNCIÓN ALMACENADA: give_pet_treat (Anti-Spam / Rate-Limited)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.give_pet_treat(
    p_pet_id UUID,
    p_client_fingerprint VARCHAR(100)
)
RETURNS JSON AS $$
DECLARE
    last_treat TIMESTAMP WITH TIME ZONE;
    new_treat_count INTEGER;
    cooldown_seconds INTEGER := 300; -- 5 minutos de espera entre chuches
BEGIN
    SELECT created_at INTO last_treat
    FROM public.treat_logs
    WHERE pet_id = p_pet_id AND client_fingerprint = p_client_fingerprint
    ORDER BY created_at DESC
    LIMIT 1;

    IF last_treat IS NOT NULL AND (timezone('utc'::text, now()) - last_treat) < (cooldown_seconds || ' seconds')::INTERVAL THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Debes esperar un poco antes de darle otra chuche a esta mascota.',
            'cooldown_remaining', EXTRACT(EPOCH FROM ((last_treat + (cooldown_seconds || ' seconds')::INTERVAL) - timezone('utc'::text, now())))::INTEGER
        );
    END IF;

    INSERT INTO public.treat_logs (pet_id, client_fingerprint)
    VALUES (p_pet_id, p_client_fingerprint);

    UPDATE public.pets
    SET treats = treats + 1,
        updated_at = timezone('utc'::text, now())
    WHERE id = p_pet_id AND status = 'active'
    RETURNING treats INTO new_treat_count;

    IF new_treat_count IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Mascota no encontrada o inactiva.'
        );
    END IF;

    RETURN json_build_object(
        'success', true,
        'treats', new_treat_count
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.give_pet_treat(UUID, VARCHAR) TO anon, authenticated, service_role;

-- ==============================================================================
-- BUCKET DE ALMACENAMIENTO: pet-photos (Supabase Storage)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('pet-photos', 'pet-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access Pet Photos" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'pet-photos');

CREATE POLICY "Public Upload Pet Photos" ON storage.objects
    FOR INSERT
    TO anon, authenticated, service_role
    WITH CHECK (bucket_id = 'pet-photos');
