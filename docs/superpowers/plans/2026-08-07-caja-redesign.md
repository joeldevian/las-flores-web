# Executive POS Command Center (/caja) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the `/caja` cashier and reception module into an Executive POS Command Center with Shift KPIs, Kanban board pipeline view, visual order timers, high-contrast order/reservation cards, and fast 1-click workflows.

**Architecture:** Split the monolith route into modular components: `CashierKPIHeader`, `CashierKanbanView`, `CashierListView`, and enhanced `CashierOrderCard` / `CashierReservationCard` components, tied together seamlessly in `src/routes/caja.tsx`.

**Tech Stack:** React, TypeScript, TanStack Router, Supabase Realtime, Lucide React Icons, Tailwind CSS / Vanilla CSS styling.

## Global Constraints

- Palette: Eucalyptus Green (`#2D473C` / `#5F8575`), Chilca Gold (`#D4AF37`), Soft Pastel Status Pills, Piedra background (`#F9F8F3`), Nogal text.
- Maintain existing RLS auth check for roles (`admin`, `cashier`, `staff`).
- Preserve real-time updates and audio alerts when new orders or reservations arrive.
- No broken imports or missing properties.

---

### Task 1: Create `CashierKPIHeader` Component

**Files:**
- Create: `src/components/CashierKPIHeader.tsx`
- Modify: `src/routes/caja.tsx`

**Interfaces:**
- Consumes: Order list, reservation list, sound alert state toggle callback, user role check.
- Produces: `<CashierKPIHeader />` component rendering top operator bar + shift KPI metrics card row.

- [ ] **Step 1: Create `src/components/CashierKPIHeader.tsx`**

```tsx
import { Volume2, BellOff, ShieldCheck, TrendingUp, ShoppingBag, Clock, Calendar } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface CashierKPIHeaderProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  todayRevenue: number;
  activeOrdersCount: number;
  avgWaitMins: number;
  todayReservationsCount: number;
}

export function CashierKPIHeader({
  soundEnabled,
  onToggleSound,
  todayRevenue,
  activeOrdersCount,
  avgWaitMins,
  todayReservationsCount,
}: CashierKPIHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Upper Operator Bar */}
      <header className="bg-[#2D473C] text-[#F9F8F3] rounded-2xl border border-[#D4AF37]/30 shadow-md p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white p-1 flex items-center justify-center border border-[#D4AF37] shadow-md shrink-0">
            <img src="/favicon.png" alt="Las Flores" className="w-full h-full object-contain rounded-lg" />
          </div>
          <div>
            <h1 className="font-serif text-xl font-black tracking-tight text-white flex items-center gap-2">
              Panel de Caja & Recepción
              <span className="text-[10px] font-sans px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/40 font-extrabold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                EN VIVO
              </span>
            </h1>
            <p className="text-xs text-white/80 font-serif italic">
              Restaurante Las Flores — Centro de Control Operativo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSound}
            className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-2 border transition-all ${
              soundEnabled
                ? "bg-emerald-500/20 text-emerald-200 border-emerald-400/40 hover:bg-emerald-500/30"
                : "bg-red-500/20 text-red-200 border-red-500/40 hover:bg-red-500/30"
            }`}
          >
            {soundEnabled ? <Volume2 size={15} className="text-emerald-300" /> : <BellOff size={15} className="text-red-300" />}
            <span>{soundEnabled ? "Alerta Sonora Activa" : "Alerta Silenciada"}</span>
          </button>

          <Link
            to="/admin"
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-2 transition-colors border border-white/20"
          >
            <ShieldCheck size={15} className="text-[#D4AF37]" />
            <span>Panel Admin</span>
          </Link>
        </div>
      </header>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
            <TrendingUp size={22} />
          </div>
          <div>
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-gray-500 block">
              Ventas Hoy
            </span>
            <span className="font-sans text-2xl font-black tracking-tight tabular-nums text-[#2D473C]">
              S/ {todayRevenue.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
            <ShoppingBag size={22} />
          </div>
          <div>
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-gray-500 block">
              Comandas en Cola
            </span>
            <span className="font-sans text-2xl font-black tracking-tight tabular-nums text-amber-900">
              {activeOrdersCount}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200">
            <Clock size={22} />
          </div>
          <div>
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-gray-500 block">
              Promedio Espera
            </span>
            <span className="font-sans text-2xl font-black tracking-tight tabular-nums text-blue-950">
              {avgWaitMins} min
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 border border-purple-200">
            <Calendar size={22} />
          </div>
          <div>
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-gray-500 block">
              Reservas Hoy
            </span>
            <span className="font-sans text-2xl font-black tracking-tight tabular-nums text-purple-950">
              {todayReservationsCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify component imports & build**

Run build check or verify syntactically.

---

### Task 2: Enhance `CashierOrderCard` Component

**Files:**
- Modify: `src/components/CashierOrderCard.tsx`

**Interfaces:**
- Consumes: Order object, Order items array, status change handler, view detail handler.
- Produces: Enhanced order card with visual elapsed timer badge (green/amber/red pulsing alert), 1-click status advancement, motorizado WhatsApp helper button.

- [ ] **Step 1: Update `src/components/CashierOrderCard.tsx` with Timer Urgency & High-Contrast Layout**

Add visual delay indicators:
- `< 10 min`: Green border badge.
- `10-20 min`: Amber border badge.
- `> 20 min`: Red border badge with pulsing animation.

Enhance payment badges and quick action buttons.

---

### Task 3: Create `CashierKanbanView` Component

**Files:**
- Create: `src/components/CashierKanbanView.tsx`

**Interfaces:**
- Consumes: Filtered orders list, order items, `onStatusChange` callback, `onViewDetail` callback.
- Produces: 4-column Kanban Pipeline (`Pendientes` | `En Cocina` | `En Camino / Listo` | `Entregados`).

- [ ] **Step 1: Create `src/components/CashierKanbanView.tsx`**

```tsx
import { CashierOrderCard } from "./CashierOrderCard";
import { Utensils, Clock, Truck, CheckCircle2 } from "lucide-react";

interface CashierKanbanViewProps {
  orders: any[];
  orderItems: any[];
  onStatusChange: (orderId: string, newStatus: string) => Promise<void>;
  onViewDetail: (order: any) => void;
}

export function CashierKanbanView({
  orders,
  orderItems,
  onStatusChange,
  onViewDetail,
}: CashierKanbanViewProps) {
  const getNormalizedStatus = (status: string | null | undefined) => {
    if (!status) return "pendiente";
    const s = status.toLowerCase().trim();
    if (s.includes("cocina") || s.includes("preparac") || s.includes("kitchen")) return "en_preparacion";
    if (s.includes("camino") || s.includes("listo") || s.includes("way") || s.includes("pickup")) return "en_camino";
    if (s.includes("entregad") || s.includes("complet") || s.includes("delivered")) return "entregado";
    if (s.includes("cancel") || s.includes("rechaz")) return "cancelado";
    return "pendiente";
  };

  const pending = orders.filter((o) => getNormalizedStatus(o.status) === "pendiente");
  const inKitchen = orders.filter((o) => getNormalizedStatus(o.status) === "en_preparacion");
  const onWay = orders.filter((o) => getNormalizedStatus(o.status) === "en_camino");
  const completed = orders.filter((o) => getNormalizedStatus(o.status) === "entregado");

  const columns = [
    {
      id: "pendiente",
      title: "1. Pendientes",
      count: pending.length,
      icon: Clock,
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-400",
      textColor: "text-amber-900",
      badgeColor: "bg-amber-500 text-white",
      items: pending,
    },
    {
      id: "en_preparacion",
      title: "2. En Cocina",
      count: inKitchen.length,
      icon: Utensils,
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-400",
      textColor: "text-blue-900",
      badgeColor: "bg-blue-500 text-white",
      items: inKitchen,
    },
    {
      id: "en_camino",
      title: "3. Listos / Despacho",
      count: onWay.length,
      icon: Truck,
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-400",
      textColor: "text-purple-900",
      badgeColor: "bg-purple-600 text-white",
      items: onWay,
    },
    {
      id: "entregado",
      title: "4. Entregados Hoy",
      count: completed.length,
      icon: CheckCircle2,
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-400",
      textColor: "text-emerald-900",
      badgeColor: "bg-emerald-600 text-white",
      items: completed,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
      {columns.map((col) => {
        const Icon = col.icon;
        return (
          <div key={col.id} className="bg-white/80 backdrop-blur-xs rounded-2xl border border-gray-200 shadow-2xs overflow-hidden flex flex-col max-h-[calc(100vh-280px)]">
            <div className={`p-3.5 border-b flex items-center justify-between ${col.bgColor} ${col.borderColor}`}>
              <div className="flex items-center gap-2">
                <Icon size={16} className={col.textColor} />
                <h3 className={`font-serif font-black text-sm uppercase tracking-wide ${col.textColor}`}>
                  {col.title}
                </h3>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${col.badgeColor}`}>
                {col.count}
              </span>
            </div>

            <div className="p-3 space-y-3 overflow-y-auto flex-1">
              {col.items.length === 0 ? (
                <div className="py-10 text-center text-xs text-gray-400 font-medium italic border-2 border-dashed border-gray-200 rounded-xl">
                  Sin comandas en esta columna
                </div>
              ) : (
                col.items.map((order) => (
                  <CashierOrderCard
                    key={order.id}
                    order={order}
                    orderItems={orderItems}
                    onStatusChange={onStatusChange}
                    onViewDetail={onViewDetail}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

---

### Task 4: Create `CashierListView` Component

**Files:**
- Create: `src/components/CashierListView.tsx`

**Interfaces:**
- Consumes: Filtered orders list, order items, `onStatusChange` callback, `onViewDetail` callback.
- Produces: High-density compact tabular list for high-volume quick order processing.

- [ ] **Step 1: Create `src/components/CashierListView.tsx`**

```tsx
import { Eye, ChevronRight, Truck, Store, Clock } from "lucide-react";

interface CashierListViewProps {
  orders: any[];
  orderItems: any[];
  onStatusChange: (orderId: string, newStatus: string) => Promise<void>;
  onViewDetail: (order: any) => void;
}

export function CashierListView({
  orders,
  orderItems,
  onStatusChange,
  onViewDetail,
}: CashierListViewProps) {
  const getNextStatus = (status: string) => {
    const raw = (status || "").toLowerCase().trim();
    if (raw.includes("cocina") || raw.includes("preparac")) return "en_camino";
    if (raw.includes("camino") || raw.includes("listo")) return "entregado";
    return "en_preparacion";
  };

  const getNextStatusLabel = (status: string, orderType: string) => {
    const raw = (status || "").toLowerCase().trim();
    if (raw.includes("cocina") || raw.includes("preparac")) {
      return orderType === "delivery" ? "A En Camino" : "A Listo Recojo";
    }
    if (raw.includes("camino") || raw.includes("listo")) return "A Entregado";
    return "Enviar a Cocina";
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-sans">
          <thead className="bg-[#2D473C] text-white uppercase text-[10px] font-bold tracking-wider">
            <tr>
              <th className="py-3 px-4">Orden</th>
              <th className="py-3 px-4">Cliente</th>
              <th className="py-3 px-4">Tipo</th>
              <th className="py-3 px-4">Hora</th>
              <th className="py-3 px-4">Estado</th>
              <th className="py-3 px-4">Total</th>
              <th className="py-3 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((ord) => {
              const items = orderItems.filter((i) => i.order_id === ord.id);
              const nextStatus = getNextStatus(ord.status);
              const nextLabel = getNextStatusLabel(ord.status, ord.order_type);

              return (
                <tr key={ord.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3 px-4 font-black text-gray-900">
                    #{ord.order_number || ord.id?.slice(0, 8)}
                  </td>
                  <td className="py-3 px-4 font-bold text-gray-800">
                    {ord.client_name || "Cliente"}
                    <span className="block text-[10px] text-gray-400 font-normal">{ord.client_phone}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 w-max ${
                      ord.order_type === "delivery" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-amber-50 text-amber-800 border border-amber-200"
                    }`}>
                      {ord.order_type === "delivery" ? <Truck size={10} /> : <Store size={10} />}
                      {ord.order_type === "delivery" ? "Delivery" : "Recojo"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 font-medium">
                    {ord.created_at ? new Date(ord.created_at).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : '-'}
                  </td>
                  <td className="py-3 px-4 uppercase font-bold text-[10px] text-gray-700">
                    {ord.status || "pendiente"}
                  </td>
                  <td className="py-3 px-4 font-black text-[#2D473C] text-sm tabular-nums">
                    S/ {Number(ord.total || 0).toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onViewDetail(ord)}
                        className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold"
                        title="Ver detalle"
                      >
                        <Eye size={14} />
                      </button>
                      {ord.status !== "entregado" && ord.status !== "cancelado" && (
                        <button
                          onClick={() => onStatusChange(ord.id, nextStatus)}
                          className="px-2.5 py-1 bg-[#5F8575] hover:bg-[#4d7061] text-white rounded-lg text-[11px] font-bold flex items-center gap-1"
                        >
                          <span>{nextLabel}</span>
                          <ChevronRight size={12} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

---

### Task 5: Refactor `src/routes/caja.tsx` Main Dashboard

**Files:**
- Modify: `src/routes/caja.tsx`

**Interfaces:**
- Integrates `CashierKPIHeader`, Layout Switcher (Kanban, Grid, List), `CashierKanbanView`, `CashierListView`, and updated `CashierOrderCard`.

- [ ] **Step 1: Update `src/routes/caja.tsx` with full layout switcher and KPI state calculation**
- [ ] **Step 2: Verify application compiles cleanly**
- [ ] **Step 3: Run npm run build to verify zero errors**

```bash
npm run build
```

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-08-07-caja-redesign.md`.
