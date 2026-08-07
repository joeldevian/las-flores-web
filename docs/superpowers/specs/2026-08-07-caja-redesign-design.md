# Design Spec: Executive POS Command Center — Rediseño del Módulo de Caja (/caja)

**Fecha:** 2026-08-07  
**Estado:** Aprobado por el usuario (Opción 1: Executive POS Command Center con Vista Kanban & KPIs en Vivo)

---

## 1. Visión General & Objetivos

Transformar la interfaz del módulo de caja y recepción (`/caja`) de Restaurante Las Flores en un **Centro de Control Operativo de Clase Mundial (Executive POS Command Center)**. El objetivo principal es maximizar la velocidad de adopción del personal y la eficiencia operativa en horas pico mediante:

1. **Jerarquía Visual Impactante:** Estética gastronómica de lujo con paleta institucional (Verde Eucalipto `#2D473C`, Dorado Chilca `#D4AF37`, Tonalidades Piedra y Nogal).
2. **Tablero de KPIs en Tiempo Real:** Métricas clave del turno visibles en la parte superior (Ventas acumuladas, comandas activas, tiempo promedio y reservas del día).
3. **Modos de Vista Múltiples:** Alternancia fluida entre:
   - **Vista Kanban por Columnas** (*Pendientes ➔ En Cocina ➔ Listos / Despacho ➔ Entregados Hoy*).
   - **Vista Grid Táctil** (Tarjetas ergónomicas de alta visibilidad).
   - **Vista Lista Compacta** (Tabla de alta densidad para momentos de máxima demanda).
4. **Sistema de Urgencia por Tiempo (Timers)**: Indicadores cromáticos con animaciones de alerta por tiempo transcurrido en comandas (<10m Verde, 10–20m Ámbar, >20m Rojo pulsante).
5. **Flujo de Trabajo a 1-Clic**: Botones de acción directa para cambio de estado, despacho por WhatsApp a motorizado con GPS, impresión de ticket y confirmación de reservas.

---

## 2. Arquitectura de Componentes & UI

### 2.1 Header & Barra de KPIs del Turno
- **Header Superior Pro**:
  - Logo institucional enmarcado, título de panel y badge de estado de señal en vivo ("TIMBRE EN VIVO" con pulsación).
  - Selector de sonido de alertas (Alerta Sonora Activa / Silenciada) con reproductor de audio.
  - Enlace rápido de retorno al panel de administración.
- **Barra de Métricas Rápidas de Turno (Shift KPIs)**:
  - 💰 **Ventas Totales Hoy (S/)**: Sumatoria acumulada de comandas en estado *entregado* del día actual.
  - 🛎️ **Comandas Activas**: Total de pedidos en cola (Pendiente + En Cocina + En Camino).
  - ⏱️ **Tiempo Promedio de Espera**: Indicador de tiempo transcurrido de las comandas pendientes.
  - 📅 **Reservas de Hoy**: Total de mesas programadas para la jornada actual.

### 2.2 Barra de Navegación & Selectores de Vista
- **Selector de Módulo Principal**:
  - Tab 1: **Comandas & Pedidos** (con badge dinámico de comandas pendientes).
  - Tab 2: **Reservas de Mesas** (con badge dinámico de reservas para hoy).
- **Selector de Disposición de Vista (Layout Switcher)**:
  - Button 1: `Kanban Board` (Columnas con drag/click de avance rápido).
  - Button 2: `Grid Táctil` (Tarjetas de alto contraste).
  - Button 3: `Lista Compacta` (Fila resumida para procesamiento veloz).

### 2.3 Sistema de Filtros & Búsqueda Avanzada
- **Búsqueda Multicriterio**: Filtrado instantáneo en tiempo real por N° de orden, nombre de cliente o número de teléfono.
- **Selectores Rápidos de Fecha**: Hoy, Esta Semana, Este Mes, Histórico Completo / Rango Personalizado.
- **Filtro de Estado Histórico**: Pendientes, En Cocina, Despacho, Entregados, Cancelados.

---

## 3. Vista 1: Comandas & Pedidos (Orders Pipeline)

### 3.1 Disposición Kanban (4 Columnas)
1. **Pendientes por Confirmar (Ámbar / Chilca)**:
   - Requieren aceptación rápida de caja para enviar a cocina.
2. **En Cocina / Preparación (Azul Cielo)**:
   - En preparación activa por los chefs.
3. **Listos / En Camino (Púrpura / Despacho)**:
   - Listos en barra para recojo en tienda o en ruta delivery.
   - Acceso directo al botón **"Pedir Motorizado"** (prepara mensaje estructurado con GPS para WhatsApp del motorizado).
4. **Entregados del Día (Verde Pacay / Esmeralda)**:
   - Registro de pedidos completados exitosamente en la jornada.

### 3.2 Diseño de Tarjeta de Comanda (`CashierOrderCard`)
- **Encabezado**: Número de orden (`#LF-1024`), badge de estado semántico y temporizador con alerta de retraso.
- **Cuerpo del Cliente**: Nombre, teléfono con enlace WhatsApp directo, tipo de servicio (Delivery vs Recojo en Tienda) y botón GPS a Google Maps si es delivery.
- **Resumen de Platos**: Lista de ítems solicitados con cantidades, observaciones y precios unitarios.
- **Pie de Tarjeta**: Total a cobrar (S/), método de pago (Yape/Plin/Efectivo/Tarjeta), botón de vista previa e impresión de ticket (`Eye`) y botón principal de avance de estado a 1-clic.

---

## 4. Vista 2: Reservas de Mesas (`CashierReservationCard`)

### 4.1 Agrupación & Calendario
- Agrupación automática por fecha con resaltado especial de **"HOY"**.
- Pestañas rápidas: *Hoy*, *Pendientes de Confirmar*, *Confirmadas*, *Todas / Historial*.

### 4.2 Tarjeta de Reserva
- **Encabezado Semántico**: Tipo de servicio (Almuerzo / Cena), fecha, hora y distintivo de estado.
- **Detalle del Comensal**: Nombre, teléfono, correo, número de personas (`guest_count`), mesa/zona asignada y notas especiales.
- **Acciones Rápidas por WhatsApp**:
  - **Confirmar WhatsApp**: Genera mensaje de confirmación con datos del restaurante.
  - **Recordatorio Hoy**: Envía alerta amistosa previa al turno.
  - **Avance de Estado**: Confirmar, Cliente Llegó (Mesa Ocupada), Cancelar.

---

## 5. Diseño Estético & Animaciones

- **Paleta de Colores Gastronómica**:
  - Fondo general: `#F9F8F3` (Piedra suave).
  - Encabezados & Acentos Principales: `#2D473C` (Verde Eucalipto Profundo) & `#5F8575` (Eucalipto Suave).
  - Detalles de Lujo & Aceptación: `#D4AF37` (Dorado Chilca).
  - Tipografía: Sans-serif moderna y limpia para máxima legibilidad táctil.
- **Microinteracciones & Transiciones**:
  - Transición suave al cambiar entre vistas Kanban, Grid y Lista.
  - Banner flotante de animación `slide-in-from-top-5` cuando entra un nuevo pedido o reserva en tiempo real con reproductor de timbre.
  - Efectos hover con elevación sutil de tarjeta (`scale-[1.01]`, `shadow-md`).

---

## 6. Plan de Verificación & Criterios de Éxito

1. **Carga & Permisos**: Verificación de redirección si el usuario no tiene rol `admin`, `cashier` o `staff`.
2. **Navegación**: Comprobación del funcionamiento fluido entre los tab de Comandas/Reservas y las vistas Kanban/Grid/Lista.
3. **Flujo Realtime**: Validación de alertas flotantes de nuevos pedidos y reproducción del timbre sonoro.
4. **Acciones a 1-Clic**: Verificación del avance de estado de órdenes y reservas sin errores de Supabase.
5. **Integraciones**: Apertura correcta del enlace de WhatsApp para motorizado con coordenadas GPS e impresión de ticket.
