# Rediseño Visual UI/UX "Casona Colonial Executive" - Panel de Administración Las Flores

**Fecha**: 2026-08-05  
**Estado**: Especificación de Diseño Aprobada por el Usuario  
**Ámbito**: Módulo Administrador (`/admin`) en Entorno Local  

---

## 1. Visión General & Objetivos

Transformar la experiencia visual y de usuario (UI/UX) de los 7 módulos del panel de administración (`/admin`) de Restaurante Las Flores, elevando su estética desde una interfaz simple hacia un **dashboard ejecutivo de nivel profesional internacional** que refleje la tradición, calidez y distinción de la casona colonial andina.

---

## 2. Sistema de Diseño & Tokens Visuales (Casona Colonial Executive)

### Paleta de Colores
- **Lienzo de Fondo (`Background`)**: Marfil Cálido Executivo (`#f7f5ef`)
- **Contenedores & Tarjetas (`Cards`)**: Blanco Puro (`#ffffff`) con bordes en Dorado Andino Suave (`border-[#d4a373]/25`) y sombra flotante refinada (`shadow-sm`).
- **Encabezados & Textos Principales (`Typography`)**: Tipografía Serif Nogal Oscuro (`#3b1f10`) e Inter/Sans para datos numéricos.
- **Acentos de Acción Principal (`Primary Action`)**: Verde Eucalipto (`#2e5339`) e interacción hover (`hover:bg-[#23412c]`).
- **Detalles Promocionales & Alertas (`Highlights`)**: Dorado Andino (`#d4a373`), Cochinilla Rojo Tradicional (`#8C1D40`) y Ámbar.

---

## 3. Especificación Detallada por Módulo

### A. Módulo de Analítica & BI (`AdminAnalyticsSection.tsx`)
- **Tarjetas KPI Flotantes**: Ventas totales, promedio de ticket, reservas confirmadas y platos populares presentados en tarjetas blancas con bordes dorados, ícono temático con fondo traslúcido e indicador porcentual de tendencia.
- **Filtro de Período Segmentado**: Botones estilo cápsula (*Hoy, Esta Semana, Este Mes, Histórico, Personalizado*) con resaltado de pestaña activa en Verde Eucalipto.
- **Gráficos & Métricas**: Tabla y barras de distribución de ventas por canal (Delivery vs. Salón) y métodos de pago estilizados.

### B. Módulo Control de Reservas & Gestión de Pedidos (`src/routes/admin.tsx`)
- **Barra de Herramientas de Filtro**:
  - Buscador universal con lupa vectorizada e input redondeado (`rounded-2xl`).
  - Pestañas de estado segmentadas (*Todas, Pendientes, Confirmadas, Completadas, Canceladas*) con contador en cápsula animada.
  - Selector de rango de fechas fluido con botón "Limpiar Filtros" en tono dorado sobrio.
- **Tabla de Registros de Reservas y Pedidos**:
  - Filas interactivas con hover sutil (`hover:bg-[#fdf8f0]`).
  - Avatar con iniciales del cliente e información de contacto.
  - Código de reserva/pedido en tipografía `mono` (`#RES-94812` / `#ORD-163804`).
  - Cápsulas de estado con indicador luminoso: `🟢 Confirmada`, `🟡 Pendiente`, `🔵 Entregado`, `🔴 Cancelado`.
  - Botón de acción directa de WhatsApp estilizado en chip verde con icono vectorizado.

### C. Módulo Salones del Local & Apagado (`AdminZonesSection.tsx`)
- **Galería de Salones**: Tarjetas con fotos panorámicas y efecto hover zoom, capacidad de mesas (`8 Mesas / Aforo 40 pers.`), estado de operación (`🟢 OPERATIVO` / `⚡ APAGADO/BLOQUEADO`) y botón para editar datos o foto.
- **Panel de Apagados Activos**: Tabla ejecutiva de bloqueos registrados con rango de fechas, motivo detallado y botón "Encender Salón".

### D. Módulo Carta & Platos (`AdminProductModal.tsx` / `admin.tsx`)
- **Catálogo de Platos**: Grid y lista ejecutiva de productos con miniatura de foto, categoría, precio en Soles (`S/ 45.00`), switch interactivo de disponibilidad ON/OFF en vivo y acciones de edición.

### E. Módulo Cupones & Promociones (`AdminCouponModal.tsx` / `admin.tsx`)
- **Tarjetas de Cupones**: Código promocional en chip tipo ticket (`FLORES2026`), descuento en tipografía dorada brillante (`S/ 10.00 OFF`), barra de progreso de uso (`1 / 100 usos - 1%`), modalidad válida (*Delivery / Salón*) y switch de activación.

### F. Módulo Trabaja con Nosotros (`AdminJobsSection.tsx`)
- **Pestañas Segmentadas**: Alternancia fluida entre *Convocatorias Activas* y *Postulantes Registrados*.
- **Tarjetas de Convocatoria & Postulante**: Chips con descarga directa de CV en PDF, área/ubicación, modalidad y selector de estado del candidato (*En revisión, Entrevistado, Contratado*).

---

## 4. Plan de Verificación & Reglas de Despliegue

1. **Desarrollo 100% Local**: No se realizará ningún `git push` ni despliegue automático a Vercel.
2. **Compilación & Tests**:
   - `npx tsc --noEmit` (0 errores de TypeScript).
   - `npm test` (50+ pruebas pasadas en Vitest).
3. **Revisión del Usuario**: El usuario probará el entorno local y dará su aprobación explícita antes de cualquier commit o push.
