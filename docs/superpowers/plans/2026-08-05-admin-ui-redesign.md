# Rediseño Visual UI/UX Casona Colonial Executive - Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rediseñar la interfaz visual UI/UX de los 7 módulos del panel de administración (`/admin`) en entorno local, elevándola a un estándar ejecutivo de lujo (Casona Colonial Executive) sin desplegar ni hacer push a Vercel/GitHub hasta recibir aprobación.

**Architecture:** Aplicar tokens de diseño unificados (Canvas Marfil `#f7f5ef`, Tarjetas Blanco Puro con borde Dorado Suave `#d4a373`, Tipografía Serif Nogal Oscuro `#3b1f10` y detalles Verde Eucalipto `#2e5339`). Refactorizar estilos de contenedores, tablas, pestañas y badges en los componentes `admin.tsx`, `AdminAnalyticsSection.tsx`, `AdminZonesSection.tsx`, `AdminJobsSection.tsx` y modales.

**Tech Stack:** React 18, Vite, Tailwind CSS, Lucide React, Supabase Client, Vitest.

## Global Constraints
- Todo el trabajo debe realizarse e inspeccionarse **100% EN LOCAL**.
- Queda estrictamente **PROHIBIDO hacer `git push` o desplegar a Vercel** antes de la aprobación explícita del usuario.
- Preservar todas las funcionalidades existentes, consultas Supabase, filtros, modales y suscripciones en tiempo real.
- Todos los tests (`npm test`) y la validación de tipos (`npx tsc --noEmit`) deben pasar limpiamente.

---

### Task 1: Refactorización de Estilos del Lienzo Principal y Navegación en `src/routes/admin.tsx`

**Files:**
- Modify: `src/routes/admin.tsx:400-500`

**Interfaces:**
- Consumes: Tokens Tailwind CSS (`#f7f5ef`, `#3b1f10`, `#d4a373`, `#2e5339`)
- Produces: Contenedor principal con canvas marfil ejecutivo y tarjetas con bordes dorados suaves.

- [ ] **Step 1: Aplicar fondo Marfil `#f7f5ef` al lienzo principal del admin**
- [ ] **Step 2: Actualizar cabeceras superiores de pestañas con tipografía serif y badges dorados**
- [ ] **Step 3: Verificar compilación en local con `npx tsc --noEmit`**
- [ ] **Step 4: Commit local**

```bash
git add src/routes/admin.tsx
git commit -m "style(admin): apply casona colonial executive background canvas to admin.tsx"
```

---

### Task 2: Rediseño Visual de Analítica & BI (`AdminAnalyticsSection.tsx`)

**Files:**
- Modify: `src/components/AdminAnalyticsSection.tsx`

**Interfaces:**
- Consumes: Props `orders`, `orderItems`, `products`, `reservations`
- Produces: Vista de KPI ejecutivos con tarjetas blancas bordeadas en dorado, badges de tendencia e histograma estilizado.

- [ ] **Step 1: Reorganizar tarjetas KPI con bordes dorados suaves `border-[#d4a373]/30` e íconos en cápsulas traslúcidas**
- [ ] **Step 2: Estilizar selector de periodo (*Hoy, Esta Semana, Este Mes, Histórico*) con cápsulas Eucalipto `#2e5339`**
- [ ] **Step 3: Refactorizar tablas de platos más vendidos y distribución de métodos de pago**
- [ ] **Step 4: Verificar compilación de tipos con `npx tsc --noEmit`**
- [ ] **Step 5: Commit local**

```bash
git add src/components/AdminAnalyticsSection.tsx
git commit -m "style(admin): elevate AdminAnalyticsSection UI/UX to executive luxury"
```

---

### Task 3: Rediseño Visual de Tablas de Reservas y Pedidos en `src/routes/admin.tsx`

**Files:**
- Modify: `src/routes/admin.tsx`

**Interfaces:**
- Consumes: Filtros de estado, fechas, datos de reservas y pedidos
- Produces: Tablas de registros con avatares de cliente, códigos en fuente `mono`, badges luminosos de estado y botón WhatsApp en chip verde.

- [ ] **Step 1: Rediseñar barra de herramientas (buscador redondeado `rounded-2xl`, pestañas segmentadas de estado)**
- [ ] **Step 2: Estilizar tabla de Control de Reservas (avatares, código `#RES-XXXXX`, estado `🟢 Confirmada` / `🟡 Pendiente`, botón WhatsApp)**
- [ ] **Step 3: Estilizar tabla de Gestión de Pedidos (código `#ORD-XXXXX`, modalidad Delivery, chip de monto en Soles)**
- [ ] **Step 4: Verificar compilación con `npx tsc --noEmit`**
- [ ] **Step 5: Commit local**

```bash
git add src/routes/admin.tsx
git commit -m "style(admin): elevate reservations and orders tables UI/UX"
```

---

### Task 4: Rediseño Visual de Salones & Apagado de Reservas (`AdminZonesSection.tsx`)

**Files:**
- Modify: `src/components/AdminZonesSection.tsx`

**Interfaces:**
- Consumes: `zones`, `blackouts`, `createZoneBlackout`, `toggleBlackoutStatus`
- Produces: Galería de salones con fotos panorámicas y zoom en hover, badges de aforo, switch de apagado y tabla de historial de bloqueos.

- [ ] **Step 1: Rediseñar tarjetas de salones con contenedor de foto estilizado y badges de aforo**
- [ ] **Step 2: Estilizar indicador de estado `🟢 OPERATIVO` / `⚡ BLOQUEADO PARA HOY` e interruptores**
- [ ] **Step 3: Refactorizar tabla de historial de apagados y modal de registro**
- [ ] **Step 4: Verificar compilación con `npx tsc --noEmit`**
- [ ] **Step 5: Commit local**

```bash
git add src/components/AdminZonesSection.tsx
git commit -m "style(admin): elevate AdminZonesSection UI/UX"
```

---

### Task 5: Rediseño Visual de Cupones & Promociones en `src/routes/admin.tsx` y `AdminCouponModal.tsx`

**Files:**
- Modify: `src/routes/admin.tsx`, `src/components/AdminCouponModal.tsx`

**Interfaces:**
- Consumes: Datos de cupones, límites de uso y descuentos
- Produces: Tarjetas/filas promocionales con código en chip ticket (`FLORES2026`), descuento destacado y barra de progreso.

- [ ] **Step 1: Estilizar código promocional en contenedor ticket con bordes punteados**
- [ ] **Step 2: Formatear monto de descuento (`S/ 10.00 OFF`) y barras de progreso de usos (`1 / 100 usos`)**
- [ ] **Step 3: Refactorizar `AdminCouponModal` con diseño ejecutivo**
- [ ] **Step 4: Verificar compilación con `npx tsc --noEmit`**
- [ ] **Step 5: Commit local**

```bash
git add src/routes/admin.tsx src/components/AdminCouponModal.tsx
git commit -m "style(admin): elevate coupons section and modal UI/UX"
```

---

### Task 6: Rediseño Visual de Convocatorias & Postulantes (`AdminJobsSection.tsx`)

**Files:**
- Modify: `src/components/AdminJobsSection.tsx`

**Interfaces:**
- Consumes: API de postulaciones y ofertas de empleo
- Produces: Visualizador de candidatos con descarga directa de CV en PDF, selector de estado y formulario de convocatoria.

- [ ] **Step 1: Rediseñar pestañas segmentadas de Convocatorias vs. Postulantes**
- [ ] **Step 2: Estilizar tarjetas de postulantes con enlace a CV en PDF y badges de departamento**
- [ ] **Step 3: Refactorizar formulario modal de creación de convocatorias**
- [ ] **Step 4: Verificar compilación con `npx tsc --noEmit`**
- [ ] **Step 5: Commit local**

```bash
git add src/components/AdminJobsSection.tsx
git commit -m "style(admin): elevate AdminJobsSection UI/UX"
```

---

### Task 7: Verificación Local Final y Suite de Pruebas

**Files:**
- Test: `src/tests/*`

- [ ] **Step 1: Ejecutar verificación de tipos de TypeScript en local: `npx tsc --noEmit`**
- [ ] **Step 2: Ejecutar suite completa de pruebas unitarias: `npm test`**
- [ ] **Step 3: Confirmar que NO se haya realizado ningún `git push` a GitHub ni despliegue a Vercel**
