import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase, signOut } from "../lib/supabase";
import {
  Calendar,
  ShoppingBag,
  LogOut,
  Loader2,
  ArrowLeft,
  UtensilsCrossed,
  Menu as MenuIcon,
  Search,
  RefreshCw,
  Plus,
  Eye,
  Edit2,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  ExternalLink,
  UserCheck,
  BarChart3,
  ShieldCheck,
  Ticket,
} from "lucide-react";

import { AdminOrderDetailModal } from "../components/AdminOrderDetailModal";
import { AdminProductModal } from "../components/AdminProductModal";
import { AdminCouponModal } from "../components/AdminCouponModal";
import { AdminAnalyticsSection } from "../components/AdminAnalyticsSection";

const getLocalYYYYMMDD = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const Route = createFileRoute("/admin")({
  component: AdminRoute,
});

function AdminRoute() {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<"analytics" | "orders" | "reservations" | "menu" | "coupons">("analytics");
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [reservations, setReservations] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);

  // Search & Filter states
  const [resSearch, setResSearch] = useState("");
  const [resStatusFilter, setResStatusFilter] = useState("all");
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

      const fMonth = String(month + 1).padStart(2, "0");
      const lDay = String(lastDay.getDate()).padStart(2, "0");

      setResDateFrom(`${year}-${fMonth}-01`);
      setResDateTo(`${year}-${fMonth}-${lDay}`);
    } else if (type === "all") {
      setResDateFrom("");
      setResDateTo("");
    }
  };

  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [orderDateFrom, setOrderDateFrom] = useState<string>("");
  const [orderDateTo, setOrderDateTo] = useState<string>("");
  const [activeOrderDateFilter, setActiveOrderDateFilter] = useState<"today" | "week" | "month" | "all" | "custom">("all");

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

  const [menuSearch, setMenuSearch] = useState("");
  const [menuCategoryFilter, setMenuCategoryFilter] = useState("all");

  // Modal states
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const [selectedCoupon, setSelectedCoupon] = useState<any | null>(null);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);

  useEffect(() => {
    checkAuth();

    const channel = supabase
      .channel("admin-realtime-dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "reservations" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "coupons" }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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

      if (profile?.role !== "admin") {
        window.location.href = "/restaurante";
        return;
      }

      setIsAuthorized(true);
      await fetchData();
    } catch (error) {
      console.error("Error checking auth:", error);
      window.location.href = "/restaurante";
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    setRefreshing(true);
    try {
      // 1. Reservations
      const { data: resData } = await supabase
        .from("reservations")
        .select("*")
        .order("reservation_date", { ascending: false });
      if (resData) setReservations(resData);

      // 2. Orders
      const { data: ordData } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (ordData) setOrders(ordData);

      // 3. Order Items
      const { data: itemsData } = await supabase
        .from("order_items")
        .select("*, products(name, image_url)");
      if (itemsData) setOrderItems(itemsData);

      // 4. Products
      const { data: prodData } = await supabase
        .from("products")
        .select("*, categories(name)")
        .order("category_id", { ascending: true })
        .order("sort_order", { ascending: true });
      if (prodData) setProducts(prodData);

      // 5. Categories
      const { data: catData } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true });
      if (catData) setCategories(catData);

      // 6. Coupons
      const { data: coupData } = await supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });
      if (coupData) setCoupons(coupData);

    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/restaurante";
  };

  // Status Handlers
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
      if (error) throw error;
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev: any) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error(err);
      alert("Error al actualizar estado del pedido.");
    }
  };

  const handleUpdateReservationStatus = async (resId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from("reservations").update({ status: newStatus }).eq("id", resId);
      if (error) throw error;
      setReservations((prev) => prev.map((r) => (r.id === resId ? { ...r, status: newStatus } : r)));
    } catch (err) {
      console.error(err);
      alert("Error al actualizar la reserva.");
    }
  };

  const handleToggleProductAvailability = async (productId: string, currentAvailable: boolean) => {
    try {
      const { error } = await supabase
        .from("products")
        .update({ is_available: !currentAvailable })
        .eq("id", productId);
      if (error) throw error;
      setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, is_available: !currentAvailable } : p)));
    } catch (err) {
      console.error(err);
      alert("Error al cambiar disponibilidad.");
    }
  };

  // Metrics
  const totalSales = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + Number(o.total || 0), 0);

  const activeOrdersCount = orders.filter((o) =>
    ["received", "preparing", "on_the_way"].includes(o.status)
  ).length;

  const pendingReservationsCount = reservations.filter((r) => r.status === "pending").length;
  const availableProductsCount = products.filter((p) => p.is_available).length;

  // Filtered lists
  const filteredReservations = reservations.filter((res) => {
    const matchSearch =
      (res.client_name || "").toLowerCase().includes(resSearch.toLowerCase()) ||
      (res.client_phone || "").includes(resSearch);
    const matchStatus = resStatusFilter === "all" || res.status === resStatusFilter;

    const matchDateRange =
      (!resDateFrom || res.reservation_date >= resDateFrom) &&
      (!resDateTo || res.reservation_date <= resDateTo);

    return matchSearch && matchStatus && matchDateRange;
  });

  const filteredOrders = orders.filter((ord) => {
    const matchSearch =
      (ord.order_number || "").toString().includes(orderSearch) ||
      (ord.client_name || "").toLowerCase().includes(orderSearch.toLowerCase()) ||
      (ord.client_phone || "").includes(orderSearch);
    const matchStatus = orderStatusFilter === "all" || ord.status === orderStatusFilter;

    // Filter by order date (using created_at or explicitly storing an order_date would be ideal, falling back to created_at)
    const ordDate = ord.created_at ? getLocalYYYYMMDD(new Date(ord.created_at)) : "";
    const matchDateRange =
      (!orderDateFrom || ordDate >= orderDateFrom) &&
      (!orderDateTo || ordDate <= orderDateTo);

    return matchSearch && matchStatus && matchDateRange;
  });

  const filteredProducts = products.filter((prod) => {
    const matchSearch = (prod.name || "").toLowerCase().includes(menuSearch.toLowerCase());
    const matchCategory = menuCategoryFilter === "all" || prod.category_id === menuCategoryFilter;
    return matchSearch && matchCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center flex-col gap-4 text-[#14231D]">
        <Loader2 className="w-10 h-10 animate-spin text-[#D4AF37]" />
        <p className="font-serif text-sm font-bold tracking-widest uppercase text-[#14231D]">
          Restaurante Las Flores | Cargas de Panel...
        </p>
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen bg-[#F5F3EE] text-[#14231D] font-sans selection:bg-[#D4AF37] selection:text-[#14231D] flex flex-col md:flex-row">
      
      {/* ==================================================================== */}
      {/* LEFT VERTICAL NAVIGATION SIDEBAR (Eucalyptus Green #5F8575)          */}
      {/* ==================================================================== */}
      <aside className="w-full md:w-64 lg:w-72 bg-[#14231D] text-white border-r border-white/5 shrink-0 flex flex-col justify-between md:h-screen md:sticky md:top-0 z-40 shadow-2xl overflow-hidden font-sans">
        
        {/* Top Scrollable Navigation Container */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-white/10 p-1.5 flex items-center justify-center border border-white/20 shadow-md shrink-0">
              <img
                src="/favicon.png"
                alt="Las Flores Logo"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
            <div className="min-w-0">
              <h2 className="font-sans text-sm font-bold tracking-tight text-white truncate">
                Restaurante Las Flores
              </h2>
              <p className="text-[10px] text-white/50 font-sans tracking-wide truncate font-medium">
                Panel Ejecutivo BI & Gestión
              </p>
            </div>
          </div>

          {/* User Profile Chip */}
          <div className="bg-white/5 border border-white/10 p-3 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37] font-sans font-black flex items-center justify-center text-xs shrink-0 shadow-xs">
              AD
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase font-bold text-white/40 block tracking-wider">
                Administrador
              </span>
              <span className="text-xs font-bold text-white truncate block">
                Gerencia General
              </span>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" title="Realtime Activo" />
          </div>

          {/* Vertical Navigation Items */}
          <nav className="space-y-1.5 pt-1">
            <span className="text-[10px] font-sans uppercase tracking-widest text-white/60 font-bold px-2 block mb-1">
              MENÚ PRINCIPAL
            </span>

            {/* Analítica BI */}
            <button
              onClick={() => setActiveTab("analytics")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-sans transition-all ${
                activeTab === "analytics"
                  ? "bg-[#D4AF37] text-[#14231D] font-black shadow-md"
                  : "text-white/60 hover:text-white hover:bg-white/8 font-semibold"
              }`}
            >
              <div className="flex items-center gap-3">
                <BarChart3 size={17} className={activeTab === "analytics" ? "text-[#14231D]" : "text-white/40"} />
                <span>Analítica & BI</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-sans font-bold ${
                activeTab === "analytics" ? "bg-[#14231D]/15 text-[#14231D]" : "bg-white/10 text-white/60"
              }`}>
                PRO
              </span>
            </button>

            {/* Control de Reservas */}
            <button
              onClick={() => setActiveTab("reservations")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-sans transition-all ${
                activeTab === "reservations"
                  ? "bg-[#D4AF37] text-[#14231D] font-black shadow-md"
                  : "text-white/60 hover:text-white hover:bg-white/8 font-semibold"
              }`}
            >
              <div className="flex items-center gap-3">
                <Calendar size={17} className={activeTab === "reservations" ? "text-[#14231D]" : "text-white/40"} />
                <span>Control de Reservas</span>
              </div>
              <span className={`px-2 py-0.5 text-[10px] rounded-full font-sans font-bold tabular-nums ${
                activeTab === "reservations" ? "bg-[#14231D]/15 text-[#14231D]" : "bg-white/10 text-white/60"
              }`}>
                {reservations.length}
              </span>
            </button>

            {/* Gestión de Pedidos */}
            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-sans transition-all ${
                activeTab === "orders"
                  ? "bg-[#D4AF37] text-[#14231D] font-black shadow-md"
                  : "text-white/60 hover:text-white hover:bg-white/8 font-semibold"
              }`}
            >
              <div className="flex items-center gap-3">
                <ShoppingBag size={17} className={activeTab === "orders" ? "text-[#14231D]" : "text-white/40"} />
                <span>Gestión de Pedidos</span>
              </div>
              <span className={`px-2 py-0.5 text-[10px] rounded-full font-sans font-bold tabular-nums ${
                activeTab === "orders" ? "bg-[#14231D]/15 text-[#14231D]" : "bg-white/10 text-white/60"
              }`}>
                {orders.length}
              </span>
            </button>

            {/* Gestión de Carta */}
            <button
              onClick={() => setActiveTab("menu")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-sans transition-all ${
                activeTab === "menu"
                  ? "bg-[#D4AF37] text-[#14231D] font-black shadow-md"
                  : "text-white/60 hover:text-white hover:bg-white/8 font-semibold"
              }`}
            >
              <div className="flex items-center gap-3">
                <MenuIcon size={17} className={activeTab === "menu" ? "text-[#14231D]" : "text-white/40"} />
                <span>Gestión de Carta</span>
              </div>
              <span className={`px-2 py-0.5 text-[10px] rounded-full font-sans font-bold tabular-nums ${
                activeTab === "menu" ? "bg-[#14231D]/15 text-[#14231D]" : "bg-white/10 text-white/60"
              }`}>
                {products.length}
              </span>
            </button>

            {/* Cupones & Promos */}
            <button
              onClick={() => setActiveTab("coupons")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-sans transition-all ${
                activeTab === "coupons"
                  ? "bg-[#D4AF37] text-[#14231D] font-black shadow-md"
                  : "text-white/60 hover:text-white hover:bg-white/8 font-semibold"
              }`}
            >
              <div className="flex items-center gap-3">
                <Ticket size={17} className={activeTab === "coupons" ? "text-[#14231D]" : "text-white/40"} />
                <span>Cupones & Ofertas</span>
              </div>
              <span className={`px-2 py-0.5 text-[10px] rounded-full font-sans font-bold tabular-nums ${
                activeTab === "coupons" ? "bg-[#14231D]/15 text-[#14231D]" : "bg-white/10 text-white/60"
              }`}>
                {coupons.length}
              </span>
            </button>

          </nav>
        </div>

        {/* Bottom Sidebar Action Quick Links - ALWAYS PINNED & VISIBLE */}
        <div className="p-4 space-y-2 border-t border-white/8 bg-black/40 shrink-0 font-sans">
          <Link
            to="/caja"
            className="w-full py-2.5 px-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-98 border border-white/10"
          >
            <UtensilsCrossed size={15} className="text-[#D4AF37]" />
            <span>Panel Caja / Cocina</span>
          </Link>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={fetchData}
              disabled={refreshing}
              className="py-2 px-2 rounded-xl bg-white/8 hover:bg-white/15 text-white text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors border border-white/8"
              title="Sincronizar Supabase"
            >
              <RefreshCw size={13} className={`text-[#D4AF37] ${refreshing ? "animate-spin" : ""}`} />
              <span>Sincronizar</span>
            </button>

            <button
              onClick={() => { window.location.href = "/restaurante"; }}
              className="py-2 px-2 rounded-xl bg-white/8 hover:bg-white/15 text-white text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors border border-white/8"
            >
              <ArrowLeft size={13} className="text-[#D4AF37]" />
              <span>Ver Web</span>
            </button>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full py-2 px-3 rounded-xl bg-red-900/30 hover:bg-red-800/50 text-red-300 border border-red-500/20 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all mt-1"
          >
            <LogOut size={14} />
            <span>Cerrar Sesión</span>
          </button>
        </div>

      </aside>

      {/* ==================================================================== */}
      {/* RIGHT MAIN CONTENT CANVAS AREA                                        */}
      {/* ==================================================================== */}
      <div className="flex-1 flex flex-col min-w-0 pb-20">
        
        {/* Top Header Bar */}
        <header className="bg-white border-b border-[#14231D]/8 px-6 py-4 sticky top-0 z-30 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#5F8575]/70 block">
              Panel Administrativo • Restaurante Las Flores
            </span>
            <h1 className="font-sans text-xl font-bold text-[#14231D] flex items-center gap-2">
              {activeTab === "analytics" && "Analítica & Inteligencia de Negocios (BI)"}
              {activeTab === "reservations" && "Control de Reservas de Mesas"}
              {activeTab === "orders" && "Gestión de Pedidos & Comandas"}
              {activeTab === "menu" && "Gestión de Carta & Platos"}
              {activeTab === "coupons" && "Cupones & Promociones"}
            </h1>
          </div>

          {/* Quick Header Action Buttons */}
          <div className="flex items-center gap-3">
            {activeTab === "menu" && (
              <button
                onClick={() => {
                  setSelectedProduct(null);
                  setIsProductModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-[#14231D] hover:bg-[#1E322A] text-[#D4AF37] font-sans font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
              >
                <Plus size={15} />
                Nuevo Plato
              </button>
            )}

            {activeTab === "coupons" && (
              <button
                onClick={() => {
                  setSelectedCoupon(null);
                  setIsCouponModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-[#14231D] hover:bg-[#1E322A] text-[#D4AF37] font-sans font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
              >
                <Plus size={15} />
                Crear Cupón
              </button>
            )}
          </div>
        </header>

        {/* Main Content Body */}
        <main className="p-6 md:p-8 space-y-8 max-w-7xl">
          
          {/* Executive KPI Metric Cards - Harmonized Clean Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Facturación Acumulada */}
            <div className="bg-white p-5 rounded-2xl border border-[#14231D]/8 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between text-[#14231D]/50 text-[11px] font-sans font-bold uppercase tracking-wider">
                <span>Facturación Total</span>
                <div className="w-9 h-9 rounded-xl bg-[#14231D] text-[#D4AF37] flex items-center justify-center">
                  <DollarSign size={18} />
                </div>
              </div>
              <div className="mt-3">
                <span className="font-sans text-3xl font-black tracking-tight tabular-nums text-[#14231D]">
                  S/ {totalSales.toFixed(2)}
                </span>
                <p className="text-[11px] text-[#5F8575] mt-1 font-semibold flex items-center gap-1">
                  <TrendingUp size={12} /> Órdenes confirmadas
                </p>
              </div>
            </div>

            {/* Pedidos en Proceso */}
            <div className="bg-white p-5 rounded-2xl border border-[#14231D]/8 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between text-[#14231D]/50 text-[11px] font-sans font-bold uppercase tracking-wider">
                <span>Pedidos Activos</span>
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <ShoppingBag size={18} />
                </div>
              </div>
              <div className="mt-3">
                <span className="font-sans text-3xl font-black tracking-tight tabular-nums text-[#14231D]">
                  {activeOrdersCount}
                </span>
                <p className="text-[11px] text-blue-600 mt-1 font-semibold flex items-center gap-1">
                  <Clock size={12} /> En cocina o despacho
                </p>
              </div>
            </div>

            {/* Reservas Pendientes */}
            <div className="bg-white p-5 rounded-2xl border border-[#14231D]/8 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between text-[#14231D]/50 text-[11px] font-sans font-bold uppercase tracking-wider">
                <span>Reservas Pendientes</span>
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                  <Calendar size={18} />
                </div>
              </div>
              <div className="mt-3">
                <span className="font-sans text-3xl font-black tracking-tight tabular-nums text-[#14231D]">
                  {pendingReservationsCount}
                </span>
                <p className="text-[11px] text-amber-600 mt-1 font-semibold flex items-center gap-1">
                  <UserCheck size={12} /> Por confirmar horario
                </p>
              </div>
            </div>

            {/* Platos Disponibles */}
            <div className="bg-white p-5 rounded-2xl border border-[#14231D]/8 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between text-[#14231D]/50 text-[11px] font-sans font-bold uppercase tracking-wider">
                <span>Carta Activa</span>
                <div className="w-9 h-9 rounded-xl bg-[#5F8575] text-white flex items-center justify-center">
                  <UtensilsCrossed size={18} />
                </div>
              </div>
              <div className="mt-3">
                <span className="font-sans text-3xl font-black tracking-tight tabular-nums text-[#14231D]">
                  {availableProductsCount} <span className="text-base text-[#14231D]/30 font-normal">/ {products.length}</span>
                </span>
                <p className="text-[11px] text-[#5F8575] mt-1 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={12} /> Platos disponibles en carta
                </p>
              </div>
            </div>

          </div>

          {/* Panel Tab Content Display */}
          <div className="bg-white rounded-2xl border border-[#14231D]/8 shadow-sm overflow-hidden">
            
            {/* ================= ANALYTICS TAB ================= */}
            {activeTab === "analytics" && (
              <AdminAnalyticsSection
                orders={orders}
                orderItems={orderItems}
                products={products}
                reservations={reservations}
              />
            )}

          {/* ================= RESERVATIONS TAB ================= */}
          {activeTab === "reservations" && (
            <div>
              <div className="p-4 bg-[#F5F3EE] border-b border-[#14231D]/8 space-y-3">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                  {/* Search bar */}
                  <div className="relative w-full lg:w-80">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#14231D]/30" />
                    <input
                      type="text"
                      value={resSearch}
                      onChange={(e) => setResSearch(e.target.value)}
                      placeholder="Buscar cliente o teléfono..."
                      className="w-full text-xs bg-white border border-[#14231D]/12 rounded-xl pl-9 pr-4 py-2.5 text-[#14231D] focus:outline-none focus:ring-2 focus:ring-[#14231D]/20"
                    />
                  </div>

                  {/* Date Range Inputs - SOLO VISIBLES EN "TODAS" O "CONFIRMADAS" */}
                  {(resStatusFilter === "all" || resStatusFilter === "confirmed") && (
                    <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                      <div className="flex items-center gap-1.5 bg-white border border-[#14231D]/12 rounded-xl px-3 py-1.5 shadow-2xs">
                        <span className="text-[10px] font-serif font-bold text-[#14231D]/40 uppercase">Desde:</span>
                        <input
                          type="date"
                          value={resDateFrom}
                          onChange={(e) => { setResDateFrom(e.target.value); setActiveDateFilter("custom"); }}
                          className="text-xs bg-transparent font-semibold text-[#14231D] focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-1.5 bg-white border border-[#14231D]/12 rounded-xl px-3 py-1.5 shadow-2xs">
                        <span className="text-[10px] font-serif font-bold text-[#14231D]/40 uppercase">Hasta:</span>
                        <input
                          type="date"
                          value={resDateTo}
                          onChange={(e) => { setResDateTo(e.target.value); setActiveDateFilter("custom"); }}
                          className="text-xs bg-transparent font-semibold text-[#14231D] focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Status buttons */}
                  <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto">
                    <span className="text-xs font-serif font-bold text-[#14231D]/40 uppercase tracking-wider whitespace-nowrap">Estado:</span>
                    {["all", "pending", "confirmed", "completed", "cancelled"].map((st) => (
                      <button
                        key={st}
                        onClick={() => setResStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all whitespace-nowrap ${
                          resStatusFilter === st
                            ? "bg-[#14231D] text-white shadow-sm"
                            : "bg-white border border-[#14231D]/12 text-[#14231D]/60 hover:bg-[#14231D]/5"
                        }`}
                      >
                        {st === "all" ? "Todas" : st === "pending" ? "Pendientes" : st === "confirmed" ? "Confirmadas" : st === "completed" ? "Completadas" : "Canceladas"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Date Range Shortcuts - SOLO VISIBLES EN "TODAS" O "CONFIRMADAS" */}
                {(resStatusFilter === "all" || resStatusFilter === "confirmed") && (
                  <div className="flex items-center gap-2 pt-2 border-t border-[#14231D]/8 overflow-x-auto">
                    <span className="text-[11px] font-serif font-bold text-[#14231D]/40 uppercase tracking-wider shrink-0">
                      Filtro Rápido de Calendario:
                    </span>
                    <button
                      onClick={() => setQuickDateRange("today")}
                      className={`px-3 py-1 font-bold text-xs rounded-lg transition-colors shrink-0 ${activeDateFilter === "today" ? "bg-[#14231D] text-white" : "bg-white hover:bg-[#14231D]/5 text-[#14231D]/70 border border-[#14231D]/15"}`}
                    >
                      Hoy
                    </button>
                    <button
                      onClick={() => setQuickDateRange("week")}
                      className={`px-3 py-1 font-bold text-xs rounded-lg transition-colors shrink-0 ${activeDateFilter === "week" ? "bg-[#14231D] text-white" : "bg-white hover:bg-[#14231D]/5 text-[#14231D]/70 border border-[#14231D]/15"}`}
                    >
                      Esta Semana
                    </button>
                    <button
                      onClick={() => setQuickDateRange("month")}
                      className={`px-3 py-1 font-bold text-xs rounded-lg transition-colors shrink-0 ${activeDateFilter === "month" ? "bg-[#14231D] text-white" : "bg-white hover:bg-[#14231D]/5 text-[#14231D]/70 border border-[#14231D]/15"}`}
                    >
                      Este Mes
                    </button>
                    <button
                      onClick={() => setQuickDateRange("all")}
                      className={`px-3 py-1 font-bold text-xs rounded-lg transition-colors shrink-0 ${activeDateFilter === "all" ? "bg-red-600 text-white" : "bg-white hover:bg-red-50 text-red-700 border border-red-200"}`}
                    >
                      Limpiar Fechas (Ver Histórico Completo)
                    </button>
                  </div>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-[11px] font-serif font-bold uppercase tracking-wider text-[#14231D]/40 bg-[#F5F3EE] border-b border-[#14231D]/8">
                    <tr>
                      <th className="px-6 py-4">Cliente</th>
                      <th className="px-6 py-4">Fecha y Hora</th>
                      <th className="px-6 py-4">Personas</th>
                      <th className="px-6 py-4">Servicio</th>
                      <th className="px-6 py-4">Estado</th>
                      <th className="px-6 py-4 text-right">Contacto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#14231D]/5">
                    {filteredReservations.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-[#14231D]/30">
                          No hay reservas para mostrar.
                        </td>
                      </tr>
                    ) : (
                      filteredReservations.map((res) => {
                        const rawPhone = res.client_phone ? res.client_phone.replace(/\D/g, "") : "";
                        const fullPhone = rawPhone.length === 9 ? `51${rawPhone}` : rawPhone;
                        const whatsappUrl = `https://wa.me/${fullPhone}?text=Hola%20${encodeURIComponent(res.client_name)},%20te%20contactamos%20de%20Restaurante%20Las%20Flores%20sobre%20tu%20reserva%20para%20el%20dia%20${encodeURIComponent(res.reservation_date)}.`;

                        return (
                          <tr key={res.id} className="hover:bg-[#F5F3EE]/60 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-bold text-[#14231D]">{res.client_name}</div>
                              <div className="text-[#14231D]/40">{res.client_phone || "Sin teléfono"}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-bold text-[#14231D]">{res.reservation_date}</div>
                              <div className="text-[#5F8575] font-semibold">{res.reservation_time}</div>
                            </td>
                            <td className="px-6 py-4 font-bold text-[#14231D]">
                              {res.guest_count} personas
                            </td>
                            <td className="px-6 py-4 capitalize text-[#14231D]/60 font-medium">
                              {res.service_type || "Almuerzo"}
                            </td>
                            <td className="px-6 py-4">
                              <select
                                value={res.status || "pending"}
                                onChange={(e) => handleUpdateReservationStatus(res.id, e.target.value)}
                                className="bg-white border border-[#14231D]/12 text-[#14231D] font-bold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#14231D]/20"
                              >
                                <option value="pending">Pendiente</option>
                                <option value="confirmed">Confirmada</option>
                                <option value="completed">Completada</option>
                                <option value="cancelled">Cancelada</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 text-right">
                              {res.client_phone && (
                                <a
                                  href={whatsappUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                                >
                                  WhatsApp <ExternalLink size={12} />
                                </a>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= ORDERS TAB ================= */}
          {activeTab === "orders" && (
            <div>
              <div className="p-4 bg-[#F5F3EE] border-b border-[#14231D]/8 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-col gap-4 w-full md:w-auto">
                  <div className="relative w-full md:w-80">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#14231D]/30" />
                    <input
                      type="text"
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      placeholder="Buscar pedido #, cliente..."
                      className="w-full text-xs bg-white border border-[#14231D]/12 rounded-xl pl-9 pr-4 py-2.5 text-[#14231D] focus:outline-none focus:ring-2 focus:ring-[#14231D]/20"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                    <div className="flex items-center gap-1.5 bg-white border border-[#14231D]/12 rounded-xl px-3 py-1.5 shadow-2xs">
                      <span className="text-[10px] font-serif font-bold text-[#14231D]/40 uppercase">Desde:</span>
                      <input
                        type="date"
                        value={orderDateFrom}
                        onChange={(e) => { setOrderDateFrom(e.target.value); setActiveOrderDateFilter("custom"); }}
                        className="text-xs bg-transparent font-semibold text-[#14231D] focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 bg-white border border-[#14231D]/12 rounded-xl px-3 py-1.5 shadow-2xs">
                      <span className="text-[10px] font-serif font-bold text-[#14231D]/40 uppercase">Hasta:</span>
                      <input
                        type="date"
                        value={orderDateTo}
                        onChange={(e) => { setOrderDateTo(e.target.value); setActiveOrderDateFilter("custom"); }}
                        className="text-xs bg-transparent font-semibold text-[#14231D] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 w-full md:w-auto items-start md:items-end">
                  <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                    <span className="text-xs font-serif font-bold text-[#14231D]/40 uppercase tracking-wider whitespace-nowrap">Estado:</span>
                    {[
                      { id: "all", label: "Todos" },
                      { id: "received", label: "Recibidos" },
                      { id: "preparing", label: "En Preparación" },
                      { id: "on_the_way", label: "En Camino" },
                      { id: "delivered", label: "Entregados" },
                      { id: "cancelled", label: "Cancelados" },
                    ].map((st) => (
                      <button
                        key={st.id}
                        onClick={() => setOrderStatusFilter(st.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                          orderStatusFilter === st.id
                            ? "bg-[#14231D] text-white shadow-sm"
                            : "bg-white border border-[#14231D]/12 text-[#14231D]/60 hover:bg-[#14231D]/5"
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Date Range Shortcuts */}
              <div className="px-4 pb-4 pt-3 bg-[#F5F3EE] border-b border-[#14231D]/8 flex items-center gap-2 overflow-x-auto">
                <span className="text-[11px] font-serif font-bold text-[#14231D]/40 uppercase tracking-wider shrink-0">
                  Filtro Rápido de Calendario:
                </span>
                <button onClick={() => setQuickOrderDateRange("today")} className={`px-3 py-1 font-bold text-xs rounded-lg transition-colors shrink-0 ${activeOrderDateFilter === "today" ? "bg-[#14231D] text-white" : "bg-white hover:bg-[#14231D]/5 text-[#14231D]/70 border border-[#14231D]/15"}`}>Hoy</button>
                <button onClick={() => setQuickOrderDateRange("week")} className={`px-3 py-1 font-bold text-xs rounded-lg transition-colors shrink-0 ${activeOrderDateFilter === "week" ? "bg-[#14231D] text-white" : "bg-white hover:bg-[#14231D]/5 text-[#14231D]/70 border border-[#14231D]/15"}`}>Esta Semana</button>
                <button onClick={() => setQuickOrderDateRange("month")} className={`px-3 py-1 font-bold text-xs rounded-lg transition-colors shrink-0 ${activeOrderDateFilter === "month" ? "bg-[#14231D] text-white" : "bg-white hover:bg-[#14231D]/5 text-[#14231D]/70 border border-[#14231D]/15"}`}>Este Mes</button>
                <button onClick={() => setQuickOrderDateRange("all")} className={`px-3 py-1 font-bold text-xs rounded-lg transition-colors shrink-0 ${activeOrderDateFilter === "all" ? "bg-red-600 text-white" : "bg-white hover:bg-red-50 text-red-700 border border-red-200"}`}>Limpiar Fechas (Ver Histórico Completo)</button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-[11px] font-serif font-bold uppercase tracking-wider text-[#14231D]/40 bg-[#F5F3EE] border-b border-[#14231D]/8">
                    <tr>
                      <th className="px-6 py-4">N° Orden</th>
                      <th className="px-6 py-4">Cliente</th>
                      <th className="px-6 py-4">Modalidad</th>
                      <th className="px-6 py-4">Total</th>
                      <th className="px-6 py-4">Estado</th>
                      <th className="px-6 py-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#14231D]/5">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-[#14231D]/30">
                          No hay pedidos registrados.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-[#F5F3EE]/60 transition-colors">
                          <td className="px-6 py-4 font-serif font-bold text-[#14231D] text-sm">
                            #{ord.order_number}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-[#14231D]">{ord.client_name || "Anónimo"}</div>
                            <div className="text-[#14231D]/40">{ord.client_phone}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#14231D]/5 text-[#14231D]/70 border border-[#14231D]/10">
                              {ord.order_type === "delivery" ? "Delivery" : "Recojo"}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-serif font-black text-[#5F8575] text-sm">
                            S/ {Number(ord.total).toFixed(2)}
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={ord.status || "received"}
                              onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                              className="bg-white border border-[#14231D]/12 text-[#14231D] font-bold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#14231D]/20"
                            >
                              <option value="received">Recibido</option>
                              <option value="preparing">En Preparación</option>
                              <option value="on_the_way">En Camino</option>
                              <option value="delivered">Entregado</option>
                              <option value="cancelled">Cancelado</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedOrder(ord);
                                setIsOrderModalOpen(true);
                              }}
                              className="px-3.5 py-1.5 rounded-lg bg-[#14231D]/5 hover:bg-[#14231D]/10 text-[#14231D] font-bold border border-[#14231D]/10 text-xs inline-flex items-center gap-1.5 transition-colors"
                            >
                              <Eye size={13} /> Detalle
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= MENU TAB ================= */}
          {activeTab === "menu" && (
            <div>
              <div className="p-4 bg-[#F5F3EE] border-b border-[#14231D]/8 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-80">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#14231D]/30" />
                  <input
                    type="text"
                    value={menuSearch}
                    onChange={(e) => setMenuSearch(e.target.value)}
                    placeholder="Buscar plato por nombre..."
                    className="w-full text-xs bg-white border border-[#14231D]/12 rounded-xl pl-9 pr-4 py-2.5 text-[#14231D] focus:outline-none focus:ring-2 focus:ring-[#14231D]/20"
                  />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <span className="text-xs font-serif font-bold text-[#14231D]/40 uppercase tracking-wider whitespace-nowrap">Categoría:</span>
                  <select
                    value={menuCategoryFilter}
                    onChange={(e) => setMenuCategoryFilter(e.target.value)}
                    className="bg-white border border-[#14231D]/12 text-[#14231D] font-bold rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#14231D]/20"
                  >
                    <option value="all">Todas ({categories.length})</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-[11px] font-serif font-bold uppercase tracking-wider text-[#14231D]/40 bg-[#F5F3EE] border-b border-[#14231D]/8">
                    <tr>
                      <th className="px-6 py-4 w-20">Imagen</th>
                      <th className="px-6 py-4">Producto</th>
                      <th className="px-6 py-4">Categoría</th>
                      <th className="px-6 py-4">Precio</th>
                      <th className="px-6 py-4">Disponibilidad</th>
                      <th className="px-6 py-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#14231D]/5">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-[#14231D]/30">
                          No hay platos registrados.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((prod) => (
                        <tr key={prod.id} className="hover:bg-[#F5F3EE]/60 transition-colors">
                          <td className="px-6 py-4">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#14231D]/5 border border-[#14231D]/8 shrink-0">
                              {prod.image_url ? (
                                <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[#14231D]/30">
                                  <UtensilsCrossed size={16} />
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-serif font-bold text-[#14231D] text-sm">{prod.name}</div>
                            {prod.description && <p className="text-[#14231D]/40 text-xs line-clamp-1">{prod.description}</p>}
                          </td>
                          <td className="px-6 py-4 text-[#14231D]/60 font-medium">
                            {prod.categories?.name || "General"}
                          </td>
                          <td className="px-6 py-4 font-serif font-bold text-[#5F8575] text-sm">
                            S/ {Number(prod.price).toFixed(2)}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleToggleProductAvailability(prod.id, prod.is_available)}
                              className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                                prod.is_available
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : "bg-red-50 text-red-800 border-red-200"
                              }`}
                            >
                              {prod.is_available ? "Disponible" : "Agotado"}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedProduct(prod);
                                setIsProductModalOpen(true);
                              }}
                              className="px-3.5 py-1.5 rounded-lg bg-[#14231D]/5 hover:bg-[#14231D]/10 text-[#14231D] font-bold border border-[#14231D]/10 text-xs inline-flex items-center gap-1.5 transition-colors"
                            >
                              <Edit2 size={12} /> Editar
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= COUPONS TAB ================= */}
          {activeTab === "coupons" && (
            <div>
              <div className="p-4 bg-[#F5F3EE] border-b border-[#14231D]/8 flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-sm text-[#14231D] flex items-center gap-2">
                    <Ticket size={16} className="text-[#14231D]" />
                    Gestión de Cupones & Códigos Promocionales
                  </h3>
                  <p className="text-xs text-[#14231D]/40">Configuración de límites de uso, descuentos en % o S/ y restricciones</p>
                </div>

                <button
                  onClick={() => {
                    setSelectedCoupon(null);
                    setIsCouponModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#14231D] hover:bg-[#1E322A] text-[#D4AF37] text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
                >
                  <Plus size={14} /> Crear Nuevo Cupón
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-[11px] font-serif font-bold uppercase tracking-wider text-[#14231D]/40 bg-[#F5F3EE] border-b border-[#14231D]/8">
                    <tr>
                      <th className="px-6 py-4">Código del Cupón</th>
                      <th className="px-6 py-4">Descuento</th>
                      <th className="px-6 py-4">Límite de Usos & Progreso</th>
                      <th className="px-6 py-4">Modalidad Válida</th>
                      <th className="px-6 py-4">Estado</th>
                      <th className="px-6 py-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#14231D]/5">
                    {coupons.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-[#14231D]/30">
                          No hay cupones creados aún. Haz clic en "Crear Nuevo Cupón" para comenzar (ej: FLORES).
                        </td>
                      </tr>
                    ) : (
                      coupons.map((c) => {
                        const usedPercent = Math.min(Math.round(((c.used_count || 0) / (c.max_uses || 1)) * 100), 100);
                        const isExpired = (c.used_count || 0) >= (c.max_uses || 1);

                        return (
                          <tr key={c.id} className="hover:bg-[#F5F3EE]/60 transition-colors">
                            <td className="px-6 py-4">
                              <span className="font-mono font-black text-sm px-3 py-1 bg-[#D4AF37]/10 text-[#14231D] border border-[#D4AF37]/30 rounded-lg tracking-wider">
                                {c.code}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-serif font-extrabold text-sm text-[#5F8575]">
                                {c.discount_type === "percent" ? `${c.discount_value}% OFF` : `S/ ${Number(c.discount_value).toFixed(2)} OFF`}
                              </span>
                              {c.min_order_total > 0 && (
                                <p className="text-[10px] text-[#14231D]/40 mt-0.5">Min: S/ {c.min_order_total}</p>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs font-bold">
                                  <span className={isExpired ? "text-red-700" : "text-[#14231D]"}>
                                    {c.used_count || 0} / {c.max_uses} usos
                                  </span>
                                  <span className="text-[#14231D]/30 font-mono text-[11px]">{usedPercent}%</span>
                                </div>
                                <div className="w-48 bg-[#14231D]/8 h-2 rounded-full overflow-hidden border border-[#14231D]/8">
                                  <div
                                    style={{ width: `${usedPercent}%` }}
                                    className={`h-full transition-all ${isExpired ? "bg-red-500" : "bg-[#5F8575]"}`}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 font-semibold text-[#14231D]/60 capitalize">
                              {c.order_type_restriction === "delivery" ? "Solo Delivery" : c.order_type_restriction === "pickup" ? "Solo Recojo" : "Todas las Modalidades"}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                                c.is_active && !isExpired
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : "bg-red-50 text-red-800 border-red-200"
                              }`}>
                                {isExpired ? "Agotado (100 usos)" : c.is_active ? "Activo" : "Inactivo"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => {
                                  setSelectedCoupon(c);
                                  setIsCouponModalOpen(true);
                                }}
                                className="px-3.5 py-1.5 rounded-lg bg-[#14231D]/5 hover:bg-[#14231D]/10 text-[#14231D] font-bold border border-[#14231D]/10 text-xs inline-flex items-center gap-1.5 transition-colors"
                              >
                                <Edit2 size={12} /> Editar
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>

      {/* Modals */}
      <AdminOrderDetailModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        order={selectedOrder}
        onStatusChange={handleUpdateOrderStatus}
      />

      <AdminProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        product={selectedProduct}
        categories={categories}
        onSave={fetchData}
      />

      <AdminCouponModal
        isOpen={isCouponModalOpen}
        onClose={() => setIsCouponModalOpen(false)}
        coupon={selectedCoupon}
        onSave={fetchData}
      />

    </div>
  );
}
