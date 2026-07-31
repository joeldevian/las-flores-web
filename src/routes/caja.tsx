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

  const setQuickDateRange = (type: "today" | "week" | "month" | "all") => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    if (type === "today") {
      setResDateFrom(todayStr);
      setResDateTo(todayStr);
    } else if (type === "week") {
      const day = today.getDay();
      const diffToMonday = today.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(today.setDate(diffToMonday));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      setResDateFrom(monday.toISOString().split("T")[0]);
      setResDateTo(sunday.toISOString().split("T")[0]);
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
        setReservations((prev) => {
          if (prev.length > 0 && resData.length > prev.length) {
            const newest = resData[0];
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
    const matchStatus = statusFilter === "all" || normStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  // Filtered reservations list
  const todayStr = new Date().toISOString().split("T")[0];

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
  const completedCount = orders.filter((o) => getNormalizedStatus(o.status) === "entregado").length;

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
    <div className="min-h-screen bg-[#FAF8F5] text-[#14231D] pb-20 font-sans selection:bg-[#D4AF37] selection:text-[#14231D]">
      
      {/* Realtime Floating Banner Toast for Orders */}
      {newOrderNotification && (
        <div className="fixed top-4 right-4 z-50 bg-[#14231D] text-[#FAF8F5] p-4 rounded-2xl shadow-2xl border-2 border-[#D4AF37] flex items-center gap-4 animate-in slide-in-from-top-5 duration-300 max-w-md">
          <div className="w-12 h-12 rounded-xl bg-[#D4AF37] text-[#14231D] flex items-center justify-center font-bold shrink-0 animate-bounce">
            🛎️
          </div>

          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-serif font-bold uppercase tracking-wider text-[#D4AF37] block">
              ¡NUEVO PEDIDO RECIBIDO!
            </span>
            <h4 className="font-mono font-black text-base text-white">
              #{newOrderNotification.order_number || "LF-NUEVO"}
            </h4>
            <p className="text-xs text-gray-300 truncate">
              {newOrderNotification.client_name || "Cliente"} — S/ {Number(newOrderNotification.total || 0).toFixed(2)}
            </p>
          </div>

          <button
            onClick={() => setNewOrderNotification(null)}
            className="p-1 text-gray-400 hover:text-white rounded-full hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Realtime Floating Banner Toast for Reservations (Tono Verde Eucalipto) */}
      {newReservationNotification && (
        <div className="fixed top-20 right-4 z-50 bg-[#14231D] text-white p-4 rounded-2xl shadow-2xl border-2 border-emerald-400 flex items-center gap-4 animate-in slide-in-from-top-5 duration-300 max-w-md">
          <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shrink-0 animate-bounce">
            🌿
          </div>

          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-serif font-bold uppercase tracking-wider text-emerald-300 block">
              ¡NUEVA RESERVA RECIBIDA!
            </span>
            <h4 className="font-serif font-bold text-base text-white">
              {newReservationNotification.client_name || "Cliente Reserva"}
            </h4>
            <p className="text-xs text-emerald-100 truncate">
              📅 {newReservationNotification.reservation_date} • 👥 {newReservationNotification.guest_count || 1} personas
            </p>
          </div>

          <button
            onClick={() => setNewReservationNotification(null)}
            className="p-1 text-gray-400 hover:text-white rounded-full hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Header Operator Bar - Eucalyptus Green Palette #5F8575 */}
      <header className="bg-[#5F8575] text-[#FAF8F5] sticky top-0 z-40 border-b border-[#D4AF37]/40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center border border-[#D4AF37] shadow-md shrink-0">
              <img src="/favicon.png" alt="Las Flores" className="w-full h-full object-contain rounded-lg" />
            </div>
            <div>
              <h1 className="font-serif text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Panel de Caja & Recepción
                <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-emerald-300/20 text-emerald-100 border border-emerald-300/40 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  TIMBRE EN VIVO
                </span>
              </h1>
              <p className="text-[11px] text-[#FAF8F5]/90 font-serif italic">
                Procesamiento Rápido de Comandas & Reservas — Restaurante Las Flores
              </p>
            </div>
          </div>

          {/* Header Controls */}
          <div className="flex items-center gap-3">
            
            {/* Sound Toggle Button */}
            <button
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                if (next) playOrderChime();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                soundEnabled
                  ? "bg-emerald-300/20 text-emerald-100 border-emerald-300/40 hover:bg-emerald-300/30"
                  : "bg-red-500/20 text-red-200 border-red-500/40 hover:bg-red-500/30"
              }`}
              title="Activar / Silenciar Timbre"
            >
              {soundEnabled ? <Volume2 size={14} className="text-emerald-300" /> : <BellOff size={14} className="text-red-300" />}
              <span className="hidden sm:inline">{soundEnabled ? "Alerta Sonora Activa" : "Alerta Silenciada"}</span>
            </button>

            <Link
              to="/admin"
              className="px-3.5 py-1.5 rounded-xl bg-black/20 hover:bg-black/30 text-white text-xs font-bold flex items-center gap-1.5 transition-colors border border-white/20"
            >
              <ShieldCheck size={14} className="text-[#D4AF37]" />
              <span className="hidden md:inline">Volver a Admin</span>
            </Link>

          </div>

        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* View Mode Switcher Header Bar */}
        <div className="bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-2 max-w-xl">
          <button
            onClick={() => setViewMode("orders")}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-sans transition-all flex items-center justify-center gap-2 ${
              viewMode === "orders"
                ? "bg-[#5F8575] text-white shadow-md font-extrabold ring-2 ring-[#5F8575]/30"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 font-bold"
            }`}
          >
            <ShoppingBag size={15} className={viewMode === "orders" ? "text-[#D4AF37]" : "text-gray-500"} />
            <span>Comandas & Pedidos ({pendingCount} Pendientes)</span>
          </button>

          <button
            onClick={() => setViewMode("reservations")}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-sans transition-all flex items-center justify-center gap-2 ${
              viewMode === "reservations"
                ? "bg-[#5F8575] text-white shadow-md font-extrabold ring-2 ring-[#5F8575]/30"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 font-bold"
            }`}
          >
            <Calendar size={15} className={viewMode === "reservations" ? "text-[#D4AF37]" : "text-gray-500"} />
            <span>Reservas de Mesas ({todayReservationsCount} Hoy)</span>
          </button>
        </div>

        {/* ==================================================================== */}
        {/* VISTA 1: COMANDAS Y PEDIDOS */}
        {/* ==================================================================== */}
        {viewMode === "orders" && (
          <>
            {/* Quick Filter Status Tabs for Orders - Semantic Soft Pastel Tone Palette */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              
              {/* 1. PENDIENTES (Ámbar Pastel) */}
              <button
                onClick={() => setStatusFilter("pendiente")}
                className={`p-4 rounded-2xl text-left transition-all relative overflow-hidden font-sans ${
                  statusFilter === "pendiente"
                    ? "bg-amber-100/90 text-amber-950 border-2 border-amber-500 shadow-md font-extrabold scale-[1.02]"
                    : "bg-white text-amber-900 border border-amber-200/80 hover:bg-amber-50/60 shadow-2xs"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-sans font-extrabold uppercase tracking-wider text-amber-900">
                    Pendientes
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    statusFilter === "pendiente" ? "bg-amber-300 text-amber-950" : "bg-amber-100 text-amber-800"
                  }`}>
                    Acción
                  </span>
                </div>
                <span className="font-sans text-3xl font-black tracking-tight tabular-nums block mt-2 text-amber-950">
                  {pendingCount}
                </span>
                <p className="text-[10px] mt-0.5 font-medium text-amber-800">Requieren atención</p>
              </button>

              {/* 2. EN COCINA (Azul Pastel) */}
              <button
                onClick={() => setStatusFilter("en_preparacion")}
                className={`p-4 rounded-2xl text-left transition-all relative overflow-hidden font-sans ${
                  statusFilter === "en_preparacion"
                    ? "bg-blue-100/90 text-blue-950 border-2 border-blue-500 shadow-md font-extrabold scale-[1.02]"
                    : "bg-white text-blue-900 border border-blue-200/80 hover:bg-blue-50/60 shadow-2xs"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-sans font-extrabold uppercase tracking-wider text-blue-900">
                    En Cocina
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    statusFilter === "en_preparacion" ? "bg-blue-300 text-blue-950" : "bg-blue-100 text-blue-800"
                  }`}>
                    Cocina
                  </span>
                </div>
                <span className="font-sans text-3xl font-black tracking-tight tabular-nums block mt-2 text-blue-950">
                  {inKitchenCount}
                </span>
                <p className="text-[10px] mt-0.5 font-medium text-blue-800">En preparación</p>
              </button>

              {/* 3. EN CAMINO / LISTO (Morado / Púrpura Pastel) */}
              <button
                onClick={() => setStatusFilter("en_camino")}
                className={`p-4 rounded-2xl text-left transition-all relative overflow-hidden font-sans ${
                  statusFilter === "en_camino"
                    ? "bg-purple-100/90 text-purple-950 border-2 border-purple-500 shadow-md font-extrabold scale-[1.02]"
                    : "bg-white text-purple-900 border border-purple-200/80 hover:bg-purple-50/60 shadow-2xs"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-sans font-extrabold uppercase tracking-wider text-purple-900">
                    En Camino / Listo
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    statusFilter === "en_camino" ? "bg-purple-300 text-purple-950" : "bg-purple-100 text-purple-800"
                  }`}>
                    Despacho
                  </span>
                </div>
                <span className="font-sans text-3xl font-black tracking-tight tabular-nums block mt-2 text-purple-950">
                  {onWayCount}
                </span>
                <p className="text-[10px] mt-0.5 font-medium text-purple-800">Delivery / Recojo</p>
              </button>

              {/* 4. ENTREGADOS (Esmeralda Pastel) */}
              <button
                onClick={() => setStatusFilter("entregado")}
                className={`p-4 rounded-2xl text-left transition-all relative overflow-hidden font-sans ${
                  statusFilter === "entregado"
                    ? "bg-emerald-100/90 text-emerald-950 border-2 border-emerald-500 shadow-md font-extrabold scale-[1.02]"
                    : "bg-white text-emerald-900 border border-emerald-200/80 hover:bg-emerald-50/60 shadow-2xs"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-sans font-extrabold uppercase tracking-wider text-emerald-900">
                    Entregados
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    statusFilter === "entregado" ? "bg-emerald-300 text-emerald-950" : "bg-emerald-100 text-emerald-800"
                  }`}>
                    Listo
                  </span>
                </div>
                <span className="font-sans text-3xl font-black tracking-tight tabular-nums block mt-2 text-emerald-950">
                  {completedCount}
                </span>
                <p className="text-[10px] mt-0.5 font-medium text-emerald-800">Completados</p>
              </button>

              {/* 5. TODOS LOS PEDIDOS (Eucalipto Pastel de Marca) */}
              <button
                onClick={() => setStatusFilter("all")}
                className={`p-4 rounded-2xl text-left transition-all col-span-2 sm:col-span-1 font-sans ${
                  statusFilter === "all"
                    ? "bg-[#5F8575]/25 text-[#1E322A] border-2 border-[#5F8575] shadow-md font-extrabold scale-[1.02]"
                    : "bg-white text-[#2A4237] border border-gray-200/80 hover:bg-[#FAF8F5] shadow-2xs"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-sans font-extrabold uppercase tracking-wider text-[#2A4237]">
                    Todos los Pedidos
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    statusFilter === "all" ? "bg-[#5F8575] text-white" : "bg-gray-100 text-gray-700"
                  }`}>
                    Total
                  </span>
                </div>
                <span className="font-sans text-3xl font-black tracking-tight tabular-nums block mt-2 text-[#2A4237]">
                  {orders.length}
                </span>
                <p className="text-[10px] mt-0.5 font-medium text-[#5F8575]">Total de comandas</p>
              </button>

            </div>

            {/* Search Bar & Manual Refresh */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-gray-200 shadow-sm">
              
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por # de orden, cliente o teléfono..."
                  className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#14231D]"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  onClick={() => fetchData()}
                  disabled={refreshing}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={14} className={refreshing ? "animate-spin text-emerald-700" : ""} />
                  <span>Actualizar Tabla</span>
                </button>
              </div>

            </div>

            {/* Orders Cards Grid */}
            {loading ? (
              <div className="py-20 text-center space-y-3">
                <RefreshCw size={28} className="animate-spin text-[#14231D] mx-auto" />
                <p className="text-sm font-bold text-gray-600">Cargando comandas en vivo...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-2xl border border-gray-200 p-8 shadow-xs">
                <UtensilsCrossed size={36} className="text-gray-300 mx-auto mb-3" />
                <h3 className="font-serif font-bold text-base text-gray-800">No hay comandas en este estado</h3>
                <p className="text-xs text-gray-500 mt-1">Selecciona otro filtro o realiza una búsqueda diferente.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredOrders.map((order) => (
                  <CashierOrderCard
                    key={order.id}
                    order={order}
                    orderItems={orderItems}
                    onStatusChange={handleUpdateOrderStatus}
                    onViewDetail={(ord) => {
                      setSelectedOrder(ord);
                      setIsDetailModalOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ==================================================================== */}
        {/* VISTA 2: RESERVAS DE MESAS */}
        {/* ==================================================================== */}
        {viewMode === "reservations" && (
          <>
            {/* Quick Filter Tabs for Reservations - Semantic Soft Pastel Tone Palette */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              
              <button
                onClick={() => setReservationStatusFilter("today")}
                className={`p-4 rounded-2xl text-left transition-all relative overflow-hidden font-sans ${
                  reservationStatusFilter === "today"
                    ? "bg-[#5F8575]/25 text-[#1E322A] border-2 border-[#5F8575] shadow-md font-extrabold scale-[1.02]"
                    : "bg-white text-[#2A4237] border border-gray-200/80 hover:bg-[#FAF8F5] shadow-2xs"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-sans font-extrabold uppercase tracking-wider text-[#2A4237]">
                    Reservas del Día
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    reservationStatusFilter === "today" ? "bg-[#5F8575] text-white" : "bg-[#5F8575]/15 text-[#5F8575]"
                  }`}>
                    Hoy
                  </span>
                </div>
                <span className="font-sans text-3xl font-black tracking-tight tabular-nums block mt-2 text-[#2A4237]">
                  {todayReservationsCount}
                </span>
                <p className="text-[10px] mt-0.5 font-medium text-[#5F8575]">Programadas para HOY</p>
              </button>

              <button
                onClick={() => setReservationStatusFilter("pendiente")}
                className={`p-4 rounded-2xl text-left transition-all relative overflow-hidden font-sans ${
                  reservationStatusFilter === "pendiente"
                    ? "bg-amber-100/90 text-amber-950 border-2 border-amber-500 shadow-md font-extrabold scale-[1.02]"
                    : "bg-white text-amber-900 border border-amber-200/80 hover:bg-amber-50/60 shadow-2xs"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-sans font-extrabold uppercase tracking-wider text-amber-900">
                    Pendientes
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    reservationStatusFilter === "pendiente" ? "bg-amber-300 text-amber-950" : "bg-amber-100 text-amber-800"
                  }`}>
                    Por Confirmar
                  </span>
                </div>
                <span className="font-sans text-3xl font-black tracking-tight tabular-nums block mt-2 text-amber-950">
                  {pendingReservationsCount}
                </span>
                <p className="text-[10px] mt-0.5 font-medium text-amber-800">Por confirmar WhatsApp</p>
              </button>

              <button
                onClick={() => setReservationStatusFilter("confirmada")}
                className={`p-4 rounded-2xl text-left transition-all relative overflow-hidden font-sans ${
                  reservationStatusFilter === "confirmada"
                    ? "bg-blue-100/90 text-blue-950 border-2 border-blue-500 shadow-md font-extrabold scale-[1.02]"
                    : "bg-white text-blue-900 border border-blue-200/80 hover:bg-blue-50/60 shadow-2xs"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-sans font-extrabold uppercase tracking-wider text-blue-900">
                    Confirmadas
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    reservationStatusFilter === "confirmada" ? "bg-blue-300 text-blue-950" : "bg-blue-100 text-blue-800"
                  }`}>
                    Confirmado
                  </span>
                </div>
                <span className="font-sans text-3xl font-black tracking-tight tabular-nums block mt-2 text-blue-950">
                  {confirmedReservationsCount}
                </span>
                <p className="text-[10px] mt-0.5 font-medium text-blue-800">Listas para recibir</p>
              </button>

              <button
                onClick={() => setReservationStatusFilter("all")}
                className={`p-4 rounded-2xl text-left transition-all font-sans ${
                  reservationStatusFilter === "all"
                    ? "bg-slate-100 text-slate-950 border-2 border-slate-500 shadow-md font-extrabold scale-[1.02]"
                    : "bg-white text-slate-800 border border-gray-200/80 hover:bg-slate-50 shadow-2xs"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-sans font-extrabold uppercase tracking-wider text-slate-800">
                    Todas / Historial
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    reservationStatusFilter === "all" ? "bg-slate-300 text-slate-950" : "bg-gray-100 text-gray-700"
                  }`}>
                    Total
                  </span>
                </div>
                <span className="font-sans text-3xl font-black tracking-tight tabular-nums block mt-2 text-slate-950">
                  {reservations.length}
                </span>
                <p className="text-[10px] mt-0.5 font-medium text-slate-600">Total de reservas</p>
              </button>

            </div>

            {/* Search Bar & Optional Date Range Panel */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3">
              
              <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
                {/* Search input */}
                <div className="relative w-full lg:w-80">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar cliente o teléfono..."
                    className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>

                {/* Date Range Inputs (Desde - Hasta) - SOLO VISIBLES EN "TODAS" O "CONFIRMADAS" */}
                {(reservationStatusFilter === "all" || reservationStatusFilter === "confirmada") && (
                  <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                    <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
                      <span className="text-[10px] font-serif font-bold text-gray-500 uppercase">Desde:</span>
                      <input
                        type="date"
                        value={resDateFrom}
                        onChange={(e) => setResDateFrom(e.target.value)}
                        className="text-xs bg-transparent font-semibold text-gray-800 focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
                      <span className="text-[10px] font-serif font-bold text-gray-500 uppercase">Hasta:</span>
                      <input
                        type="date"
                        value={resDateTo}
                        onChange={(e) => setResDateTo(e.target.value)}
                        className="text-xs bg-transparent font-semibold text-gray-800 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Refresh Button */}
                <button
                  onClick={() => fetchData()}
                  disabled={refreshing}
                  className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50 shrink-0 w-full lg:w-auto justify-center"
                >
                  <RefreshCw size={14} className={refreshing ? "animate-spin text-emerald-700" : ""} />
                  <span>Actualizar</span>
                </button>
              </div>

              {/* Quick Date Range Shortcuts - SOLO VISIBLES EN "TODAS" O "CONFIRMADAS" */}
              {(reservationStatusFilter === "all" || reservationStatusFilter === "confirmada") && (
                <div className="flex items-center gap-2 pt-2.5 border-t border-gray-100 overflow-x-auto pb-0.5">
                  <span className="text-[11px] font-sans font-bold text-gray-400 uppercase tracking-wider shrink-0">
                    Filtro Rápido de Calendario:
                  </span>
                  <button
                    onClick={() => setQuickDateRange("today")}
                    className="px-3 py-1 bg-[#5F8575] hover:bg-[#4d7061] text-white font-bold text-xs rounded-lg transition-colors shrink-0"
                  >
                    Hoy
                  </button>
                  <button
                    onClick={() => setQuickDateRange("week")}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-lg transition-colors border border-gray-200 shrink-0"
                  >
                    Esta Semana
                  </button>
                  <button
                    onClick={() => setQuickDateRange("month")}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-lg transition-colors border border-gray-200 shrink-0"
                  >
                    Este Mes
                  </button>
                  {(resDateFrom || resDateTo) && (
                    <button
                      onClick={() => setQuickDateRange("all")}
                      className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-lg transition-colors border border-red-200 shrink-0"
                    >
                      Limpiar Fechas
                    </button>
                  )}
                </div>
              )}

            </div>

            {/* Reservations Cards Grid */}
            {loading ? (
              <div className="py-20 text-center space-y-3">
                <RefreshCw size={28} className="animate-spin text-emerald-800 mx-auto" />
                <p className="text-sm font-bold text-gray-600">Cargando reservas en vivo...</p>
              </div>
            ) : filteredReservations.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-2xl border border-gray-200 p-8 shadow-xs">
                <Calendar size={36} className="text-gray-300 mx-auto mb-3" />
                <h3 className="font-serif font-bold text-base text-gray-800">No hay reservas registradas en este filtro</h3>
                <p className="text-xs text-gray-500 mt-1">Selecciona otro filtro de reserva o realiza una búsqueda diferente.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredReservations.map((reservation) => (
                  <CashierReservationCard
                    key={reservation.id}
                    reservation={reservation}
                    onStatusChange={handleUpdateReservationStatus}
                  />
                ))}
              </div>
            )}
          </>
        )}

      </main>

      {/* Detail & Printable Ticket Modal */}
      <AdminOrderDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        order={selectedOrder}
        onStatusChange={handleUpdateOrderStatus}
      />

    </div>
  );
}
