# Executive Admin Suite (/admin) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the `/admin` module into an Executive Admin Suite featuring a professional Sidebar Navigation, Top Command Bar with live indicators, high-contrast product catalog grid, clean tabular feeds without emojis, and seamless tab transitions.

**Architecture:** Create `AdminSidebar` component for navigation, clean emojis from sub-components (`AdminAnalyticsSection`, `AdminJobsSection`, `AdminZonesSection`, `AdminProductModal`, `AdminCouponModal`), and integrate them cleanly into `src/routes/admin.tsx`.

**Tech Stack:** React, TypeScript, TanStack Router, Supabase Realtime, Lucide React Icons, Tailwind CSS.

## Global Constraints

- Palette: Eucalyptus Green (`#2D473C` / `#5F8575`), Chilca Gold (`#D4AF37`), Piedra background (`#F9F8F3`), Nogal text.
- Maintain existing RLS role protection (`admin`).
- Zero emojis across all subcomponents, modals, and tables.
- No broken imports or missing types.

---

### Task 1: Create `AdminSidebar` Component

**Files:**
- Create: `src/components/AdminSidebar.tsx`
- Modify: `src/routes/admin.tsx`

**Interfaces:**
- Consumes: `activeTab`, `onSelectTab` callback, `applicationsCount`, `onSignOut` callback.
- Produces: `<AdminSidebar />` rendering executive sidebar navigation with Lucide React icons.

- [ ] **Step 1: Create `src/components/AdminSidebar.tsx`**

```tsx
import {
  BarChart3,
  ShoppingBag,
  Calendar,
  UtensilsCrossed,
  Ticket,
  Briefcase,
  Store,
  LogOut,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

export type AdminTab = "analytics" | "orders" | "reservations" | "menu" | "coupons" | "jobs" | "zones";

interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  applicationsCount: number;
  onSignOut: () => void;
  userEmail?: string;
}

export function AdminSidebar({
  activeTab,
  onSelectTab,
  applicationsCount,
  onSignOut,
  userEmail,
}: AdminSidebarProps) {
  const menuItems = [
    { id: "analytics" as AdminTab, label: "Analítica", icon: BarChart3 },
    { id: "orders" as AdminTab, label: "Comandas & Ventas", icon: ShoppingBag },
    { id: "reservations" as AdminTab, label: "Reservas de Mesas", icon: Calendar },
    { id: "menu" as AdminTab, label: "Carta & Productos", icon: UtensilsCrossed },
    { id: "coupons" as AdminTab, label: "Cupones Promocionales", icon: Ticket },
    { id: "jobs" as AdminTab, label: "Bolsa de Trabajo", icon: Briefcase, badge: applicationsCount },
    { id: "zones" as AdminTab, label: "Zonas & Mesas", icon: Store },
  ];

  return (
    <aside className="w-64 bg-[#2D473C] text-[#F9F8F3] flex flex-col justify-between min-h-screen border-r border-[#D4AF37]/30 shrink-0 font-sans">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-emerald-900/60 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center border border-[#D4AF37] shadow-md shrink-0">
            <img src="/favicon.png" alt="Las Flores" className="w-full h-full object-contain rounded-lg" />
          </div>
          <div>
            <h2 className="font-serif font-black text-base text-white tracking-tight flex items-center gap-1">
              Las Flores
              <ShieldCheck size={14} className="text-[#D4AF37]" />
            </h2>
            <span className="text-[10px] font-sans uppercase font-bold text-emerald-200/80 tracking-wider">
              Suite de Administración
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5">
          <span className="text-[10px] font-sans font-extrabold uppercase tracking-wider text-emerald-300/70 px-3 block mb-2">
            Navegación Principal
          </span>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between group ${
                  isActive
                    ? "bg-[#D4AF37] text-[#2D473C] font-black shadow-md"
                    : "text-emerald-100/90 hover:bg-emerald-900/50 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={16} className={isActive ? "text-[#2D473C]" : "text-emerald-300 group-hover:text-white"} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      isActive ? "bg-[#2D473C] text-white" : "bg-emerald-400 text-[#2D473C]"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {isActive && <ChevronRight size={14} className="text-[#2D473C]" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Logout */}
      <div className="p-4 border-t border-emerald-900/60 bg-black/10 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="min-w-0 pr-2">
            <span className="text-[10px] uppercase font-bold text-emerald-300/70 block">Sesión Activa</span>
            <p className="font-semibold text-white truncate">{userEmail || "Administrador"}</p>
          </div>
        </div>

        <button
          onClick={onSignOut}
          className="w-full py-2 px-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30 text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-2xs"
        >
          <LogOut size={14} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
```

---

### Task 2: Clean Emojis from Subcomponents (`AdminAnalyticsSection`, `AdminJobsSection`, `AdminZonesSection`, `AdminProductModal`, `AdminCouponModal`)

**Files:**
- Modify: `src/components/AdminAnalyticsSection.tsx`
- Modify: `src/components/AdminJobsSection.tsx`
- Modify: `src/components/AdminZonesSection.tsx`
- Modify: `src/components/AdminProductModal.tsx`
- Modify: `src/components/AdminCouponModal.tsx`

- [ ] **Step 1: Replace all emojis in `AdminAnalyticsSection.tsx` with Lucide React icons (`TrendingUp`, `ShoppingBag`, `DollarSign`, `Users`, `Calendar`).**
- [ ] **Step 2: Replace all emojis in `AdminJobsSection.tsx` with Lucide React icons (`Briefcase`, `User`, `FileText`, `CheckCircle2`).**
- [ ] **Step 3: Replace all emojis in `AdminZonesSection.tsx` with Lucide React icons (`Store`, `MapPin`, `Users`).**
- [ ] **Step 4: Replace all emojis in `AdminProductModal.tsx` and `AdminCouponModal.tsx` with Lucide React icons.**

---

### Task 3: Refactor `src/routes/admin.tsx` with Executive Sidebar Layout

**Files:**
- Modify: `src/routes/admin.tsx`

**Interfaces:**
- Integrates `AdminSidebar`, Top Command Bar, and active tab content areas seamlessly.

- [ ] **Step 1: Update `src/routes/admin.tsx` with Sidebar layout structure.**
- [ ] **Step 2: Run `npm run build` to verify zero TypeScript errors.**

```bash
npm run build
```

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-08-07-admin-redesign.md`.
