import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { playOrderChime } from "../utils/audioAlert";
import { CashierOrderCard } from "../components/CashierOrderCard";
import { CashierReservationCard } from "../components/CashierReservationCard";
import { AdminOrderDetailModal } from "../components/AdminOrderDetailModal";
import {
  Bell,
  BellOff,
  Search,
  RefreshCw,
  UtensilsCrossed,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  Store,
  ShieldCheck,
  ArrowLeft,
  X,
  Volume2,
  Calendar,
  Users,
  MessageCircle,
  Sparkles,
  Layers,
  ShoppingBag,
} from "lucide-react";

const getLocalYYYYMMDD = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const Route = createFileRoute("/caja")({
  component: CashierDashboardRoute,
});

function CashierDashboardRoute() {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  // View mode switcher: 'orders' vs 'reservations'
  const [viewMode, setViewMode] = useState<"orders" | "reservations">("orders");

  // Orders state
  const [orders, setOrders] = useState<any[]>([]);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("pendiente");
  
  // Reservations state
  const [reservations, setReservations] = useState<any[]>([]);
  const [reservationStatusFilter, setReservationStatusFilter] = useState<string>("today");
  const [resDateFrom, setResDateFrom] = useState<string>("");
  const [resDateTo, setResDateTo] = useState<string>("");
  const [activeDateFilter, setActiveDateFilter] = useState<"today" | "week" | "month" | "all" | "custom">("all");

  const setQuickDateRange = (type: "today" | "week" | "month" | "all") => {
    setActiveDateFilter(type);
    const today = new Date();
    const todayStr = getLocalYYYYMMDD(today);

    if (type === "today") {
      setResDateFrom(todayStr);
      setResDateTo(todayStr);
    } else if (type === "week") {
      const day = today.getDay();
      const diffToMonday = today.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(today.setDate(diffToMonday));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      setResDateFrom(getLocalYYYYMMDD(monday));
      setResDateTo(getLocalYYYYMMDD(sunday));
    } else if (type === "month") {
      const year = today.getFullYear();
      const month = today.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      // Simple YYYY-MM-DD formatting to avoid timezone offset shifts
      const fMonth = String(month + 1).padStart(2, "0");
      const lDay = String(lastDay.getDate()).padStart(2, "0");

      setResDateFrom(`${year}-${fMonth}-01`);
      setResDateTo(`${year}-${fMonth}-${lDay}`);
    } else if (type === "all") {
      setResDateFrom("");
      setResDateTo("");
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [orderDateFrom, setOrderDateFrom] = useState<string>("");
  const [orderDateTo, setOrderDateTo] = useState<string>("");
  const [activeOrderDateFilter, setActiveOrderDateFilter] = useState<"today" | "week" | "month" | "all" | "custom">("today");

  const setQuickOrderDateRange = (type: "today" | "week" | "month" | "all") => {
    setActiveOrderDateFilter(type);
    const today = new Date();
    const todayStr = getLocalYYYYMMDD(today);

    if (type === "today") {
      setOrderDateFrom(todayStr);
      setOrderDateTo(todayStr);
    } else if (type === "week") {
      const day = today.getDay();
      const diffToMonday = today.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(today.setDate(diffToMonday));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      setOrderDateFrom(getLocalYYYYMMDD(monday));
      setOrderDateTo(getLocalYYYYMMDD(sunday));
    } else if (type === "month") {
      const year = today.getFullYear();
      const month = today.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const fMonth = String(month + 1).padStart(2, "0");
      const lDay = String(lastDay.getDate()).padStart(2, "0");
      setOrderDateFrom(`${year}-${fMonth}-01`);
      setOrderDateTo(`${year}-${fMonth}-${lDay}`);
    } else if (type === "all") {
      setOrderDateFrom("");
      setOrderDateTo("");
    }
  };
  const [historicalStatusFilter, setHistoricalStatusFilter] = useState<string>("all");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Floating Toast Alerts
  const [newOrderNotification, setNewOrderNotification] = useState<any | null>(null);
  const [newReservationNotification, setNewReservationNotification] = useState<any | null>(null);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        window.location.href = "/restaurante";
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      const userRole = profile?.role?.toLowerCase();
      // Permitir acceso a admin, cashier y staff
      if (userRole !== "admin" && userRole !== "cashier" && userRole !== "staff") {
        console.warn("Acceso denegado a caja. Rol insuficiente:", userRole);
        window.location.href = "/restaurante";
        return;
      }

      setIsAuthorized(true);
      await fetchData();
    } catch (err) {
      console.error("Error al comprobar permisos de caja:", err);
      window.location.href = "/restaurante";
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async (isSilent = false) => {
    if (!isSilent) setRefreshing(true);
    try {
      // 1. Fetch Orders
      const { data: ordData, error: ordErr } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (!ordErr && ordData) {
        setOrders((prev) => {
          if (prev.length > 0 && ordData.length > prev.length) {
            const newest = ordData[0];
            if (soundEnabled) {
              playOrderChime();
            }
            setNewOrderNotification(newest);
          }
          return ordData;
        });
      }

      // 2. Fetch Order Items
      const { data: itemsData } = await supabase
        .from("order_items")
        .select("*, products(name, image_url)");

      if (itemsData) setOrderItems(itemsData);

      // 3. Fetch Reservations
      const { data: resData, error: resErr } = await supabase
        .from("reservations")
        .select("*")
        .order("reservation_date", { ascending: false })
        .order("created_at", { ascending: false });

      if (!resErr && resData) {
        // Auto-cancel past unfulfilled reservations
        const todayStr = getLocalYYYYMMDD(new Date());
        const pastUnfulfilled = resData.filter(res => 
          (res.status === "pending" || res.status === "confirmed") && 
          res.reservation_date && res.reservation_date < todayStr
        );

        if (pastUnfulfilled.length > 0) {
          pastUnfulfilled.forEach(res => {
            supabase.from("reservations").update({ status: "cancelled" }).eq("id", res.id).then();
            res.status = "cancelled"; // Actualización optimista local
          });
        }

        setReservations((prev) => {
          if (prev.length > 0 && resData.length > prev.length) {
            const newest = [...resData].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())[0];
            if (soundEnabled) {
              playOrderChime();
            }
            setNewReservationNotification(newest);
          }
          return resData;
        });
      }
    } catch (err) {
      console.error("Error fetching cashier data:", err);
    } finally {
      setLoading(false);
      if (!isSilent) setRefreshing(false);
    }
  };

  useEffect(() => {
    checkAuth();

    // 1. Automatic 3-second Silent Background Auto-Polling
    const pollInterval = setInterval(() => {
      fetchData(true);
    }, 3000);

    // 2. Supabase Realtime Listener for Orders & Reservations with Sound Alert
    const channel = supabase
      .channel("cashier-realtime-all")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            if (soundEnabled) playOrderChime();
            setNewOrderNotification(payload.new);
          }
          fetchData(true);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reservations" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            if (soundEnabled) playOrderChime();
            setNewReservationNotification(payload.new);
          }
          fetchData(true);
        }
      )
      .subscribe();

    return () => {
      clearInterval(pollInterval);
      supabase.removeChannel(channel);
    };
  }, [soundEnabled]);

  // Handle status update from order card
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;
      await fetchData();
    } catch (err: any) {
      console.error("Error updating order status:", err);
      alert(`No se pudo actualizar el estado del pedido: ${err?.message || "Revisa la política RLS en Supabase."}`);
    }
  };

  // Handle status update from reservation card
  const handleUpdateReservationStatus = async (reservationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("reservations")
        .update({ status: newStatus })
        .eq("id", reservationId);

      if (error) throw error;
      await fetchData();
    } catch (err: any) {
      console.error("Error updating reservation status:", err);
      alert(`No se pudo actualizar el estado de la reserva: ${err?.message || "Revisa la política RLS."}`);
    }
  };

  const getNormalizedStatus = (status: string | null | undefined) => {
    if (!status) return "pendiente";
    const s = status.toLowerCase().trim();
    if (s.includes("cocina") || s.includes("preparac") || s.includes("kitchen")) return "en_preparacion";
    if (s.includes("camino") || s.includes("listo") || s.includes("way") || s.includes("pickup")) return "en_camino";
    if (s.includes("entregad") || s.includes("complet") || s.includes("delivered")) return "entregado";
    if (s.includes("cancel") || s.includes("rechaz")) return "cancelado";
    return "pendiente";
  };

  // Filtered orders list
  const filteredOrders = orders.filter((ord) => {
    const matchSearch =
      (ord.order_number || "").toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ord.client_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ord.client_phone || "").includes(searchQuery);

    const normStatus = getNormalizedStatus(ord.status);
    let matchStatus = false;
    
    if (statusFilter === "all") {
      if (historicalStatusFilter === "all") {
        matchStatus = true;
      } else {
        matchStatus = normStatus === historicalStatusFilter;
      }
    } else {
      matchStatus = normStatus === statusFilter;
    }

    const ordDateStr = ord.created_at ? getLocalYYYYMMDD(new Date(ord.created_at)) : "";
    let matchDate = true;
    
    if (statusFilter === "entregado") {
      const todayStr = getLocalYYYYMMDD(new Date());
      matchDate = ordDateStr === todayStr;
    } else if (statusFilter === "all") {
      matchDate = (!orderDateFrom || ordDateStr >= orderDateFrom) &&
                  (!orderDateTo || ordDateStr <= orderDateTo);
    }

    return matchSearch && matchStatus && matchDate;
  });

  // Filtered reservations list
  const todayStr = getLocalYYYYMMDD(new Date());

  const filteredReservations = reservations.filter((res) => {
    const matchSearch =
      (res.client_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (res.client_phone || "").includes(searchQuery) ||
      (res.reservation_date || "").includes(searchQuery);

    const resStatus = (res.status || "pending").toLowerCase().trim();
    
    let matchStatus = true;
    if (reservationStatusFilter === "today") {
      matchStatus = res.reservation_date === todayStr;
    } else if (reservationStatusFilter === "pendiente") {
      matchStatus = resStatus === "pending" || resStatus === "pendiente";
    } else if (reservationStatusFilter === "confirmada") {
      matchStatus = resStatus === "confirmed" || resStatus === "confirmada";
    } else if (reservationStatusFilter === "completed") {
      matchStatus = resStatus === "completed" || resStatus === "completada" || resStatus === "asistio";
    }

    const matchDateRange =
      (!resDateFrom || res.reservation_date >= resDateFrom) &&
      (!resDateTo || res.reservation_date <= resDateTo);

    return matchSearch && matchStatus && matchDateRange;
  });

  // Counts by status (Orders)
  const pendingCount = orders.filter((o) => getNormalizedStatus(o.status) === "pendiente").length;
  const inKitchenCount = orders.filter((o) => getNormalizedStatus(o.status) === "en_preparacion").length;
  const onWayCount = orders.filter((o) => getNormalizedStatus(o.status) === "en_camino").length;
  const completedCount = orders.filter((o) => {
    if (getNormalizedStatus(o.status) !== "entregado") return false;
    const ordDateStr = o.created_at ? getLocalYYYYMMDD(new Date(o.created_at)) : "";
    return ordDateStr === todayStr;
  }).length;

  // Counts by status (Reservations)
  const todayReservationsCount = reservations.filter((r) => r.reservation_date === todayStr).length;
  const pendingReservationsCount = reservations.filter((r) => {
    const s = (r.status || "pending").toLowerCase();
    return s === "pending" || s === "pendiente";
  }).length;
  const confirmedReservationsCount = reservations.filter((r) => {
    const s = (r.status || "").toLowerCase();
    return s === "confirmed" || s === "confirmada";
  }).length;


  return (
    <div className="min-h-screen font-sans" style={{ background: "#F0EFE9" }}>

      {/* ── TOAST: Nuevo Pedido ─────────────────────────────────────────── */}
      {newOrderNotification && (
        <div className="fixed top-4 right-4 z-[200] max-w-sm w-full animate-in slide-in-from-top-4 duration-300">
          <div className="rounded-2xl shadow-2xl overflow-hidden flex" style={{ background: "#1C3528" }}>
            <div className="w-1.5 shrink-0" style={{ background: "#F0C060" }} />
            <div className="flex items-center gap-3 p-4 flex-1">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 animate-bounce" style={{ background: "rgba(240,192,96,0.15)" }}>
                🛎️
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#F0C060" }}>Nuevo pedido</p>
                <p className="font-bold text-white text-sm">#{newOrderNotification.order_number || "LF-NUEVO"}</p>
                <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.6)" }}>
                  {newOrderNotification.client_name} — S/ {Number(newOrderNotification.total || 0).toFixed(2)}
                </p>
              </div>
              <button onClick={() => setNewOrderNotification(null)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST: Nueva Reserva ────────────────────────────────────────── */}
      {newReservationNotification && (
        <div className="fixed top-20 right-4 z-[200] max-w-sm w-full animate-in slide-in-from-top-4 duration-300 cursor-pointer"
          onClick={() => { setViewMode("reservations"); setReservationStatusFilter("pendiente"); setNewReservationNotification(null); }}>
          <div className="rounded-2xl shadow-2xl overflow-hidden flex" style={{ background: "#1C3528" }}>
            <div className="w-1.5 shrink-0" style={{ background: "#6EE7B7" }} />
            <div className="flex items-center gap-3 p-4 flex-1">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(110,231,183,0.15)" }}>
                <Calendar size={18} style={{ color: "#6EE7B7" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#6EE7B7" }}>Nueva reserva</p>
                <p className="font-bold text-white text-sm">{newReservationNotification.client_name}</p>
                <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.6)" }}>
                  📅 {newReservationNotification.reservation_date} · 👥 {newReservationNotification.guest_count || 1} personas
                </p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); setNewReservationNotification(null); }} className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b" style={{ background: "#1C3528", borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

          {/* Logo + título */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-white p-0.5">
              <img src="/favicon.png" alt="Las Flores" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0">
              <h1 className="text-white font-bold text-sm leading-none tracking-tight truncate">Caja & Recepción</h1>
              <p className="text-[10px] leading-none mt-0.5 truncate" style={{ color: "rgba(255,255,255,0.45)" }}>
                Restaurante Las Flores
              </p>
            </div>
            {/* Indicador live */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold" style={{ background: "rgba(110,231,183,0.12)", color: "#6EE7B7" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              EN VIVO
            </div>
          </div>

          {/* Controles derecha */}
          <div className="flex items-center gap-2">
            {/* Botón sonido */}
            <button
              onClick={() => { const next = !soundEnabled; setSoundEnabled(next); if (next) playOrderChime(); }}
              title={soundEnabled ? "Silenciar alertas" : "Activar alertas"}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: soundEnabled ? "rgba(110,231,183,0.12)" : "rgba(239,68,68,0.12)", color: soundEnabled ? "#6EE7B7" : "#FCA5A5" }}
            >
              {soundEnabled ? <Volume2 size={15} /> : <BellOff size={15} />}
            </button>

            {/* Botón refrescar */}
            <button
              onClick={() => fetchData()}
              disabled={refreshing}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-40"
              style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)" }}
              title="Actualizar datos"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            </button>

            {/* Volver admin */}
            <Link to="/admin" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)" }}>
              <ShieldCheck size={13} />
              Admin
            </Link>
          </div>
        </div>
      </header>

      {/* ── CONTENIDO PRINCIPAL ─────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* ── SWITCHER VISTAS ─────────────────────────────────────────── */}
        <div className="flex items-center gap-2 p-1 rounded-xl w-fit" style={{ background: "#E2E0D8" }}>
          <button
            onClick={() => setViewMode("orders")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={viewMode === "orders"
              ? { background: "#1C3528", color: "#fff", boxShadow: "0 2px 8px rgba(28,53,40,0.25)" }
              : { background: "transparent", color: "#5A5A4A" }}
          >
            <ShoppingBag size={15} />
            Comandas
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black leading-none"
                style={viewMode === "orders" ? { background: "#F0C060", color: "#1C3528" } : { background: "#1C3528", color: "#fff" }}>
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setViewMode("reservations")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={viewMode === "reservations"
              ? { background: "#1C3528", color: "#fff", boxShadow: "0 2px 8px rgba(28,53,40,0.25)" }
              : { background: "transparent", color: "#5A5A4A" }}
          >
            <Calendar size={15} />
            Reservas
            {todayReservationsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black leading-none"
                style={viewMode === "reservations" ? { background: "#F0C060", color: "#1C3528" } : { background: "#1C3528", color: "#fff" }}>
                {todayReservationsCount}
              </span>
            )}
          </button>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            VISTA COMANDAS
        ════════════════════════════════════════════════════════════════ */}
        {viewMode === "orders" && (
          <>
            {/* Métricas de estado */}
            <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-5 gap-3">

              {/* Pendientes */}
              {[
                { key: "pendiente",      label: "Pendientes",   count: pendingCount,    emoji: "⏳", accent: "#F0C060", textDark: "#78450A" },
                { key: "en_preparacion", label: "En Cocina",    count: inKitchenCount,  emoji: "🍳", accent: "#60A5FA", textDark: "#1E3A5F" },
                { key: "en_camino",      label: "En Camino",    count: onWayCount,      emoji: "🛵", accent: "#C084FC", textDark: "#4B1D82" },
                { key: "entregado",      label: "Entregados",   count: completedCount,  emoji: "✅", accent: "#34D399", textDark: "#064E3B" },
              ].map(({ key, label, count, emoji, accent, textDark }) => (
                <button
                  key={key}
                  onClick={() => setStatusFilter(key)}
                  className="relative p-4 rounded-2xl text-left transition-all"
                  style={{
                    background: statusFilter === key ? "#1C3528" : "#fff",
                    boxShadow: statusFilter === key ? `0 4px 20px rgba(28,53,40,0.2), inset 3px 0 0 ${accent}` : "0 1px 4px rgba(0,0,0,0.06)",
                    transform: statusFilter === key ? "translateY(-2px)" : "none",
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-2xl">{emoji}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: statusFilter === key ? `${accent}22` : `${accent}18`, color: statusFilter === key ? accent : textDark }}>
                      {label}
                    </span>
                  </div>
                  <p className="text-3xl font-black tabular-nums leading-none"
                    style={{ color: statusFilter === key ? "#fff" : "#1a1a1a" }}>
                    {count}
                  </p>
                  <p className="text-[11px] mt-1 font-medium"
                    style={{ color: statusFilter === key ? "rgba(255,255,255,0.5)" : "#888" }}>
                    {key === "pendiente" ? "Requieren atención" : key === "en_preparacion" ? "En preparación" : key === "en_camino" ? "Delivery / Recojo" : "Completados hoy"}
                  </p>
                </button>
              ))}

              {/* Todos */}
              <button
                onClick={() => setStatusFilter("all")}
                className="p-4 rounded-2xl text-left transition-all col-span-2 sm:col-span-4 xl:col-span-1"
                style={{
                  background: statusFilter === "all" ? "#1C3528" : "#fff",
                  boxShadow: statusFilter === "all" ? "0 4px 20px rgba(28,53,40,0.2), inset 3px 0 0 #F0C060" : "0 1px 4px rgba(0,0,0,0.06)",
                  transform: statusFilter === "all" ? "translateY(-2px)" : "none",
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-2xl">📋</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: statusFilter === "all" ? "rgba(240,192,96,0.2)" : "rgba(28,53,40,0.08)", color: statusFilter === "all" ? "#F0C060" : "#1C3528" }}>
                    Historial
                  </span>
                </div>
                <p className="text-3xl font-black tabular-nums leading-none" style={{ color: statusFilter === "all" ? "#fff" : "#1a1a1a" }}>
                  {orders.length}
                </p>
                <p className="text-[11px] mt-1 font-medium" style={{ color: statusFilter === "all" ? "rgba(255,255,255,0.5)" : "#888" }}>
                  Total de comandas
                </p>
              </button>
            </div>

            {/* Barra búsqueda + filtros comandas */}
            <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-3 flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-48">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="# orden, cliente o teléfono..."
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800/30"
                />
              </div>

              {statusFilter === "all" && (
                <>
                  <select
                    value={historicalStatusFilter}
                    onChange={(e) => setHistoricalStatusFilter(e.target.value)}
                    className="text-xs border border-gray-100 bg-gray-50 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 font-medium text-gray-700"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="pendiente">Pendientes</option>
                    <option value="en_preparacion">En Cocina</option>
                    <option value="en_camino">En Camino</option>
                    <option value="entregado">Entregados</option>
                    <option value="cancelado">Cancelados</option>
                  </select>
                  <input type="date" value={orderDateFrom}
                    onChange={(e) => { setOrderDateFrom(e.target.value); setActiveOrderDateFilter("custom"); }}
                    className="text-xs border border-gray-100 bg-gray-50 rounded-xl px-3 py-2 focus:outline-none text-gray-700" />
                  <input type="date" value={orderDateTo}
                    onChange={(e) => { setOrderDateTo(e.target.value); setActiveOrderDateFilter("custom"); }}
                    className="text-xs border border-gray-100 bg-gray-50 rounded-xl px-3 py-2 focus:outline-none text-gray-700" />
                </>
              )}

              {statusFilter === "all" && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(["today","week","month","all"] as const).map((t) => {
                    const labels = { today: "Hoy", week: "Semana", month: "Mes", all: "Todo" };
                    return (
                      <button key={t} onClick={() => setQuickOrderDateRange(t)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors"
                        style={activeOrderDateFilter === t
                          ? { background: "#1C3528", color: "#fff" }
                          : { background: "#F0EFE9", color: "#555" }}>
                        {labels[t]}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Grid de comandas */}
            {loading ? (
              <div className="py-24 flex flex-col items-center gap-3">
                <RefreshCw size={24} className="animate-spin text-emerald-800" />
                <p className="text-sm font-medium text-gray-500">Cargando comandas...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="py-24 flex flex-col items-center gap-3 bg-white rounded-2xl border border-black/5">
                <UtensilsCrossed size={32} className="text-gray-300" />
                <p className="font-semibold text-gray-500">Sin comandas en este filtro</p>
                <p className="text-xs text-gray-400">Prueba otro estado o amplía el rango de fechas</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredOrders.map((order) => (
                  <CashierOrderCard
                    key={order.id}
                    order={order}
                    orderItems={orderItems}
                    onStatusChange={handleUpdateOrderStatus}
                    onViewDetail={(ord) => { setSelectedOrder(ord); setIsDetailModalOpen(true); }}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ════════════════════════════════════════════════════════════════
            VISTA RESERVAS
        ════════════════════════════════════════════════════════════════ */}
        {viewMode === "reservations" && (
          <>
            {/* Métricas reservas */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { key: "today",     label: "Hoy",          count: todayReservationsCount,   emoji: "📅", accent: "#34D399", sub: "Programadas para hoy" },
                { key: "pendiente", label: "Pendientes",   count: pendingReservationsCount, emoji: "⏳", accent: "#F0C060", sub: "Por confirmar" },
                { key: "confirmada",label: "Confirmadas",  count: confirmedReservationsCount,emoji: "✅", accent: "#60A5FA", sub: "Listas para recibir" },
                { key: "all",       label: "Historial",    count: reservations.length,       emoji: "📋", accent: "#94A3B8", sub: "Total de reservas" },
              ].map(({ key, label, count, emoji, accent, sub }) => (
                <button
                  key={key}
                  onClick={() => {
                    setReservationStatusFilter(key);
                    if ((key === "confirmada" || key === "all") && !resDateFrom && !resDateTo) setQuickDateRange("month");
                  }}
                  className="p-4 rounded-2xl text-left transition-all"
                  style={{
                    background: reservationStatusFilter === key ? "#1C3528" : "#fff",
                    boxShadow: reservationStatusFilter === key ? `0 4px 20px rgba(28,53,40,0.2), inset 3px 0 0 ${accent}` : "0 1px 4px rgba(0,0,0,0.06)",
                    transform: reservationStatusFilter === key ? "translateY(-2px)" : "none",
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-2xl">{emoji}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: `${accent}22`, color: reservationStatusFilter === key ? accent : "#444" }}>
                      {label}
                    </span>
                  </div>
                  <p className="text-3xl font-black tabular-nums leading-none"
                    style={{ color: reservationStatusFilter === key ? "#fff" : "#1a1a1a" }}>{count}</p>
                  <p className="text-[11px] mt-1 font-medium"
                    style={{ color: reservationStatusFilter === key ? "rgba(255,255,255,0.5)" : "#888" }}>{sub}</p>
                </button>
              ))}
            </div>

            {/* Barra búsqueda + fechas reservas */}
            <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-3 flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-48">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cliente, teléfono o fecha..."
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-800/20"
                />
              </div>
              {(reservationStatusFilter === "all" || reservationStatusFilter === "confirmada") && (
                <>
                  <input type="date" value={resDateFrom}
                    onChange={(e) => { setResDateFrom(e.target.value); setActiveDateFilter("custom"); }}
                    className="text-xs border border-gray-100 bg-gray-50 rounded-xl px-3 py-2 focus:outline-none text-gray-700" />
                  <input type="date" value={resDateTo}
                    onChange={(e) => { setResDateTo(e.target.value); setActiveDateFilter("custom"); }}
                    className="text-xs border border-gray-100 bg-gray-50 rounded-xl px-3 py-2 focus:outline-none text-gray-700" />
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {(["today","week","month","all"] as const).map((t) => {
                      const labels = { today: "Hoy", week: "Semana", month: "Mes", all: "Todo" };
                      return (
                        <button key={t} onClick={() => setQuickDateRange(t)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors"
                          style={activeDateFilter === t ? { background: "#1C3528", color: "#fff" } : { background: "#F0EFE9", color: "#555" }}>
                          {labels[t]}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
              <button onClick={() => fetchData()} disabled={refreshing}
                className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors disabled:opacity-40"
                style={{ background: "#F0EFE9", color: "#1C3528" }}>
                <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
                Actualizar
              </button>
            </div>

            {/* Grid reservas */}
            {loading ? (
              <div className="py-24 flex flex-col items-center gap-3">
                <RefreshCw size={24} className="animate-spin text-emerald-800" />
                <p className="text-sm font-medium text-gray-500">Cargando reservas...</p>
              </div>
            ) : filteredReservations.length === 0 ? (
              <div className="py-24 flex flex-col items-center gap-3 bg-white rounded-2xl border border-black/5">
                <Calendar size={32} className="text-gray-300" />
                <p className="font-semibold text-gray-500">Sin reservas en este filtro</p>
                <p className="text-xs text-gray-400">Selecciona otro estado o amplía el rango de fechas</p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(
                  reservationStatusFilter === "pendiente"
                    ? { "ORDEN_LLEGADA": [...filteredReservations].sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()) }
                    : filteredReservations.reduce((acc, res) => {
                        const date = res.reservation_date || "Sin fecha";
                        if (!acc[date]) acc[date] = [];
                        acc[date].push(res);
                        return acc;
                      }, {} as Record<string, typeof filteredReservations>)
                )
                .sort(([a], [b]) => {
                  if (reservationStatusFilter === "pendiente") return 0;
                  if (a === "Sin fecha") return 1;
                  if (b === "Sin fecha") return -1;
                  return new Date(a).getTime() - new Date(b).getTime();
                })
                .map(([dateStr, items]) => {
                  let label = dateStr;
                  if (dateStr === "ORDEN_LLEGADA") {
                    label = "Por orden de ingreso";
                  } else if (dateStr !== "Sin fecha") {
                    const [y, m, d] = dateStr.split("-");
                    const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
                    const isToday = dateStr === getLocalYYYYMMDD(new Date());
                    label = isToday
                      ? "HOY — " + dateObj.toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" })
                      : dateObj.toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" });
                  }
                  return (
                    <div key={dateStr} className="space-y-3">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-sm uppercase tracking-widest" style={{ color: "#1C3528" }}>{label}</h3>
                        <div className="flex-1 h-px" style={{ background: "rgba(28,53,40,0.1)" }} />
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(28,53,40,0.08)", color: "#1C3528" }}>
                          {(items as any[]).length} reservas
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(items as any[]).map((res) => (
                          <CashierReservationCard key={res.id} reservation={res} onStatusChange={handleUpdateReservationStatus} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

      </main>

      {/* Modal detalle pedido */}
      <AdminOrderDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        order={selectedOrder}
        onStatusChange={handleUpdateOrderStatus}
      />

    </div>
  );
}
