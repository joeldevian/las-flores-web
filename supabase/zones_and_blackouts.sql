-- ============================================================
-- MIGRACIÓN DE TABLAS DE ZONAS DEL LOCAL Y SISTEMA DE APAGADO (BLACKOUTS)
-- Restaurante Las Flores Ayacucho
-- ============================================================

-- 1. Crear tabla de Zonas del Local
CREATE TABLE IF NOT EXISTS public.restaurant_zones (
  id VARCHAR PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  description TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  color TEXT DEFAULT '#C8966A',
  color_light TEXT DEFAULT '#EDD9C0',
  max_capacity_persons INT DEFAULT 30,
  max_tables_count INT DEFAULT 6,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Crear tabla de Apagados y Bloqueos de Reservas (Blackouts)
CREATE TABLE IF NOT EXISTS public.zone_blackouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id VARCHAR REFERENCES public.restaurant_zones(id) ON DELETE CASCADE, -- NULL indica Apagado General del Restaurante
  blackout_type VARCHAR(20) NOT NULL CHECK (blackout_type IN ('full_day', 'time_slot', 'indefinite')),
  start_date DATE NOT NULL,
  end_date DATE,
  start_time TIME,
  end_time TIME,
  reason TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Inserción de Zonas Oficiales del Restaurante
INSERT INTO public.restaurant_zones (
  id, name, short_name, description, image_url, color, color_light, max_capacity_persons, max_tables_count, sort_order
) VALUES
('salon-principal', 'Salón Principal', 'S. Principal', 'El corazón de Las Flores. Vista a los retablos andinos en pan de oro.', '/imagenes-reales/Salones/Salonprincipal.webp', '#5F8575', '#B0CBBD', 40, 8, 1),
('salon-entrada', 'Salón Entrada', 'S. Entrada', 'Espacio acogedor a la entrada del local con iluminación cálida y vista al patio principal.', '/imagenes-reales/Salones/entrada.webp', '#C8966A', '#EDD9C0', 34, 7, 2),
('salon-ventana', 'Salón Ventana', 'S. Ventana', 'Área amplia iluminada por grandes ventanales coloniales con vista panorámica exterior.', '/imagenes-reales/Salones/Ventana.webp', '#5A8C8C', '#B8D4D4', 38, 6, 3),
('estrado', 'Estrado Principal', 'Estrado', 'Zona elevada distinguida, ideal para celebraciones especiales y cenas grupales.', '/imagenes-reales/Salones/Estrado.webp', '#B8735A', '#DDBB9E', 32, 6, 4),
('pasillo', 'Pasillo Central', 'Pasillo', 'Paso colonial decorado con arte ayacuchano, retablos y detalles en madera.', '/imagenes-reales/Salones/pasillo.webp', '#8A7355', '#D6C8B4', 18, 4, 5),
('terraza', 'Terraza Colonial', 'Terraza', 'Ambiente al aire libre bajo el cielo ayacuchano con vegetación autóctona y brisa fresca.', '/imagenes-reales/Salones/Terraza.webp', '#6B8E55', '#C5DBB9', 26, 5, 6),
('jardin', 'Jardín Andino', 'Jardín', 'Espacio natural rodeado de flora regional y cantos de aves, perfecto para el almuerzo.', '/imagenes-reales/Salones/jardin.webp', '#4E7C59', '#B5D1BC', 30, 5, 6)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  short_name = EXCLUDED.short_name,
  image_url = EXCLUDED.image_url,
  color = EXCLUDED.color,
  color_light = EXCLUDED.color_light;

-- 4. Habilitar RLS en ambas tablas
ALTER TABLE public.restaurant_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zone_blackouts ENABLE ROW LEVEL SECURITY;

-- Políticas para restaurant_zones
DROP POLICY IF EXISTS "Public zones select" ON public.restaurant_zones;
CREATE POLICY "Public zones select" ON public.restaurant_zones FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin zones all" ON public.restaurant_zones;
CREATE POLICY "Admin zones all" ON public.restaurant_zones FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Políticas para zone_blackouts
DROP POLICY IF EXISTS "Public blackouts select" ON public.zone_blackouts;
CREATE POLICY "Public blackouts select" ON public.zone_blackouts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin blackouts all" ON public.zone_blackouts;
CREATE POLICY "Admin blackouts all" ON public.zone_blackouts FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);
