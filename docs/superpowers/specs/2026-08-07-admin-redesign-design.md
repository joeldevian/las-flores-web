# Design Spec: Executive Admin Suite — Rediseño del Panel de Administración (/admin)

**Fecha:** 2026-08-07  
**Estado:** Aprobado por el usuario (Opción 1: Executive Sidebar & Command Suite)

---

## 1. Visión General & Objetivos

Transformar la interfaz del panel de administración (`/admin`) de Restaurante Las Flores en una **Suite Ejecutiva de Gestión Operativa (Executive Admin Suite)** de alto estándar. El objetivo es ofrecer al propietario y administradores una herramienta ultrapoderosa, estética y sumamente intuitiva para controlar:

1. **Estructura de Navegación Lateral (Sidebar Navigation)**: Menú fijo/contraíble en el lateral izquierdo con transiciones suaves, badges de notificación y perfil de administrador con botón de salida.
2. **Encabezado de Comando Superior (Top Command Bar)**: Saludo personalizado al administrador, estado de conexión Supabase Realtime en vivo, acceso directo al módulo de caja (`/caja`) y disparadores de creación rápida (+ Producto, + Cupón, + Categoría).
3. **Módulos Ejecutivos Renovados (7 Áreas)**:
   - 📊 **Analítica & Reportes** (`AdminAnalyticsSection`): KPIs ejecutivos de facturación, ticket promedio, ventas por categoría y comensales.
   - 🛍️ **Comandas & Ventas**: Tabla limpia con estados semánticos, filtros de rango de fechas y visor de ticket impreso.
   - 📅 **Reservas & Recepción**: Registro organizado por fecha, comensales y canal de confirmación por WhatsApp.
   - 🍽️ **Carta / Catálogo de Productos**: Vista en rejilla gastronómica con fotos en alta definición, conmutador de disponibilidad (En Stock / Agotado) y buscador instantáneo.
   - 🎟️ **Cupones & Promociones**: Listado de códigos de descuento con límites de uso y estado activo.
   - 💼 **Bolsa de Trabajo** (`AdminJobsSection`): Gestión de postulantes del formulario "Únete al Equipo" con currículums y estado de revisión.
   - 📍 **Zonas & Mesas** (`AdminZonesSection`): Configuración de áreas del restaurante y aforos.
4. **Cero Emojis & Iconografía Vectorial Pro**: Sustitución absoluta de emojis por iconos vectoriales de `Lucide React`.

---

## 2. Arquitectura de Componentes & Layout

### 2.1 Sidebar de Navegación Pro (`AdminSidebar`)
- **Header**: Logo de Restaurante Las Flores con borde dorado `#D4AF37`.
- **Items del Menú**:
  - `Analítica` (Icono `BarChart3`)
  - `Comandas` (Icono `ShoppingBag`)
  - `Reservas` (Icono `Calendar`)
  - `Carta / Menú` (Icono `UtensilsCrossed`)
  - `Cupones` (Icono `Ticket`)
  - `Bolsa de Trabajo` (Icono `Briefcase` + badge numérico de postulaciones)
  - `Zonas & Mesas` (Icono `Store`)
- **Footer del Sidebar**: Perfil de usuario autenticado y botón de cerrar sesión.

### 2.2 Top Command Bar
- **Saludo & Indicador**: "Bienvenido de nuevo, Administrador" + Badge con señal "REALTIME EN VIVO".
- **Botón de Enlace a Caja**: Botón de alto contraste para saltar a `/caja`.
- **Botón Principal**: "+ Nuevo Producto" (abre `AdminProductModal`).

---

## 3. Especificación de Módulos

### 3.1 Módulo 1: Analítica (`AdminAnalyticsSection`)
- Renovación de tarjetas de KPIs con bordes dorados, gráficos limpios e indicadores porcentuales de crecimiento.

### 3.2 Módulo 2: Carta & Menú (`AdminProductModal` & `AdminCategoryListModal`)
- Tarjetas tipo Grid con imagen, precio en Soles (S/), categoría, badge de disponibilidad y botones de editar/eliminar sin emojis.
- Modal de productos simplificado con pestañas de info general y precios.

### 3.3 Módulo 3: Comandas & Reservas
- Tablas de alta densidad con filtros rápidos de calendario (Hoy, Esta Semana, Este Mes, Histórico).
- Eliminación de emojis en plantillas de mensajería.

---

## 4. Estética & Paleta Institucional

- **Fondo de Pantalla**: `#F9F8F3` (Piedra suave).
- **Sidebar & Header Accent**: `#2D473C` (Verde Eucalipto Profundo).
- **Detalles de Lujo**: `#D4AF37` (Dorado Chilca).
- **Iconografía**: Exclusivamente `Lucide React`.

---

## 5. Criterios de Aceptación & Verificación

1. **Permisos**: Redirección inmediata a `/restaurante` si el usuario no tiene rol `admin`.
2. **Navegación**: Transición instantánea entre las 7 áreas mediante el Sidebar.
3. **Acciones CRUD**: Edición de productos, cupones, categorías y zonas sin errores.
4. **Compilación**: `npm run build` pase con 0 errores TypeScript.
