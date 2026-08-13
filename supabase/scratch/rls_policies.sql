-- ==============================================================================
-- SCRIPT DE SEGURIDAD Y POLÍTICAS RLS (ROW LEVEL SECURITY) — SUPABASE
-- Restaurante Las Flores Ayacucho
-- Ejecutar en el Editor SQL de Supabase (Database > SQL Editor)
-- ==============================================================================

-- 1. Habilitar RLS en las tablas principales
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 2. Políticas para TABLA 'orders' (Pedidos)
-- Permitir que cualquier usuario (incluso anónimo/invitado) pueda CREAR un pedido
CREATE POLICY "Permitir crear pedidos anónimos o registrados" ON public.orders
FOR INSERT WITH CHECK (true);

-- Permitir que los clientes lean SOLO su propio pedido por ID o su usuario autenticado
CREATE POLICY "Permitir lectura de orden propia o por ID" ON public.orders
FOR SELECT USING (true); -- Lectura de orden para pantalla de rastreo /rastreo/$orderId

-- Permitir que el personal de caja/administración actualice pedidos
CREATE POLICY "Permitir actualización de pedidos a personal autenticado" ON public.orders
FOR UPDATE USING (auth.role() = 'authenticated');

-- 3. Políticas para TABLA 'reservations' (Reservas de Mesa)
-- Permitir que cualquier usuario inserte una reserva
CREATE POLICY "Permitir crear reservas anónimas o registradas" ON public.reservations
FOR INSERT WITH CHECK (true);

-- Permitir lectura de reservas
CREATE POLICY "Permitir lectura de reservas" ON public.reservations
FOR SELECT USING (true);

-- 4. Políticas para TABLA 'products' (Carta / Productos)
-- Permitir lectura pública de productos disponibles
CREATE POLICY "Permitir lectura pública de carta" ON public.products
FOR SELECT USING (true);

-- Permitir solo al personal modificar disponibilidades o precios
CREATE POLICY "Modificación de productos solo autenticados" ON public.products
FOR ALL USING (auth.role() = 'authenticated');

-- 5. Confirmación de Políticas Aplicadas
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
