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
  Trash2,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  ExternalLink,
  UserCheck,
  BarChart3,
  ShieldCheck,
  Ticket,
  ListTree,
  Briefcase,
  Store,
} from "lucide-react";

import { AdminOrderDetailModal } from "../components/AdminOrderDetailModal";
import { AdminProductModal } from "../components/AdminProductModal";
import { AdminCouponModal } from "../components/AdminCouponModal";
import { AdminCategoryListModal } from "../components/AdminCategoryListModal";
import { AdminAnalyticsSection } from "../components/AdminAnalyticsSection";
import { AdminJobsSection } from "../components/AdminJobsSection";
import { AdminZonesSection } from "../components/AdminZonesSection";
import { removeProductById } from "../utils/adminProducts";

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
  const [activeTab, setActiveTab] = useState<"analytics" | "orders" | "reservations" | "menu" | "coupons" | "jobs" | "zones">("analytics");
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [reservations, setReservations] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [applicationsCount, setApplicationsCount] = useState<number>(0);

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
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

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

      // 7. Job Applications Count
      const { count: jobAppsCount } = await supabase
        .from("job_applications")
        .select("*", { count: "exact", head: true });
      if (jobAppsCount !== null && jobAppsCount !== undefined) {
        setApplicationsCount(jobAppsCount);
      }

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

  const handleDeleteProduct = async (productId: string) => {
    const productToDelete = products.find((product) => product.id === productId);
    if (!productToDelete) return;

    const confirmed = window.confirm(
      `¿Estás seguro de eliminar permanentemente el plato "${productToDelete.name}" de la carta?`
    );
    if (!confirmed) return;

    try {
      const { error } = await supabase.from("products").delete().eq("id", productId);
      if (error) throw error;

      setProducts((prev) => removeProductById(prev, productId));

      if (selectedProduct?.id === productId) {
        setSelectedProduct(null);
      }
      if (isProductModalOpen) {
        setIsProductModalOpen(false);
      }
    } catch (err) {
      console.error(err);
      alert("Error al eliminar el plato.");
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

  interface NavItem {
    id: "analytics" | "orders" | "reservations" | "menu" | "coupons" | "jobs" | "zones";
    label: string;
    helper: string;
    icon: any;
    count?: number;
  }

  interface NavGroup {
    title: string;
    items: NavItem[];
  }

  const navGroups: NavGroup[] = [
    {
      title: "Dirección",
      items: [
        {
          id: "analytics" as const,
          label: "Analítica & BI",
          helper: "Ventas, KPIs y reportes",
          icon: BarChart3,
        },
      ],
    },
    {
      title: "Operación",
      items: [
        {
          id: "reservations" as const,
          label: "Control de Reservas",
          helper: "Reservas y lista de espera",
          icon: Calendar,
          count: pendingReservationsCount > 0 ? pendingReservationsCount : undefined,
        },
        {
          id: "orders" as const,
          label: "Gestión de Pedidos",
          helper: "Órdenes y estados",
          icon: ShoppingBag,
          count: activeOrdersCount > 0 ? activeOrdersCount : undefined,
        },
        {
          id: "zones" as const,
          label: "Salones & Apagado",
          helper: "Zonas, mesas y bloqueos",
          icon: Store,
        },
      ],
    },
    {
      title: "Comercial",
      items: [
        {
          id: "menu" as const,
          label: "Carta & Platos",
          helper: "Menú digital y stock",
          icon: MenuIcon,
          count: products.length,
        },
        {
          id: "coupons" as const,
          label: "Cupones & Ofertas",
          helper: "Promociones y descuentos",
          icon: Ticket,
          count: coupons.length,
        },
      ],
    },
    {
      title: "Equipo & Local",
      items: [
        {
          id: "jobs" as const,
          label: "Trabaja con Nosotros",
          helper: "Postulaciones y vacantes",
          icon: Briefcase,
          count: applicationsCount,
        },
      ],
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-piedra flex items-center justify-center flex-col gap-4 text-nogal">
        <Loader2 className="w-10 h-10 animate-spin text-chilca" />
        <p className="font-serif text-sm font-bold tracking-widest uppercase text-nogal">
          Restaurante Las Flores | Cargas de Panel...
        </p>
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen bg-[#f7f5ef] text-nogal font-sans selection:bg-cochinillahilca selection:text-nogal flex flex-col md:flex-row">
      
      {/* ==================================================================== */}
      {/* LEFT VERTICAL NAVIGATION SIDEBAR (Eucalyptus Green #5F8575)          */}
      {/* ==================================================================== */}
      <aside className="w-full md:w-64 lg:w-72 bg-eucalipto text-white border-r border-white/5 shrink-0 flex flex-col justify-between md:h-screen md:sticky md:top-0 z-40 shadow-2xl overflow-hidden font-sans">
        
        {/* Top Scrollable Navigation Container */}
        <div className="p-3.5 space-y-3 overflow-y-auto flex-1 hide-scrollbar min-h-0">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2.5 border-b border-white/10 pb-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 p-1 flex items-center justify-center border border-white/20 shadow-md shrink-0">
              <img
                src="/favicon.png"
                alt="Las Flores Logo"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            <div className="min-w-0">
              <h2 className="font-sans text-xs font-bold tracking-tight text-white truncate">
                Restaurante Las Flores
              </h2>
              <p className="text-[9.5px] text-white/50 font-sans tracking-wide truncate font-medium">
                Panel Ejecutivo BI & Gestión
              </p>
            </div>
          </div>

          {/* User Profile Chip */}
          <div className="bg-white/[0.06] border border-white/10 p-2.5 rounded-xl flex items-center gap-2.5 shadow-inner">
            <div className="w-8 h-8 rounded-lg bg-cochinilla/15 border border-chilca/30 text-chilca font-sans font-black flex items-center justify-center text-xs shrink-0 shadow-xs">
              AD
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[9px] uppercase font-bold text-white/40 block tracking-wider">
                Administrador
              </span>
              <span className="text-xs font-bold text-white truncate block">
                Gerencia General
              </span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" title="Realtime Activo" />
          </div>

          {/* Vertical Navigation Items */}
          <nav className="space-y-2.5 pt-0.5">
            {navGroups.map((group) => (
              <div key={group.title} className="space-y-1">
                <span className="text-[8.5px] font-sans uppercase tracking-[0.2em] text-white/40 font-black px-2 block">
                  {group.title}
                </span>

                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`group w-full flex items-center justify-between gap-2.5 px-2.5 py-1.5 rounded-xl text-left font-sans transition-all ${
                        isActive
                          ? "bg-white/[0.16] text-white ring-1 ring-white/20 shadow-md"
                          : "text-white/70 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                            isActive
                              ? "bg-chilca/20 text-chilca"
                              : "bg-white/[0.05] text-white/40 group-hover:text-chilca"
                          }`}
                        >
                          <Icon size={14} />
                        </span>
                        <span className="min-w-0">
                          <span className={`block text-[11.5px] leading-3.5 truncate ${isActive ? "font-bold" : "font-semibold"}`}>
                            {item.label}
                          </span>
                          <span className="block text-[9.5px] leading-3 text-white/40 truncate">
                            {item.helper}
                          </span>
                        </span>
                      </div>

                      {typeof item.count === "number" && (
                        <span
                          className={`min-w-5 px-1.5 py-0.5 text-[9.5px] rounded-full font-sans font-bold tabular-nums text-center shrink-0 ${
                            isActive ? "bg-chilca text-cafe" : "bg-white/10 text-white/70"
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Sidebar Action Quick Links - ALWAYS PINNED & VISIBLE */}
        <div className="p-3 space-y-2 border-t border-white/10 bg-black/10 shrink-0 font-sans">
          <Link
            to="/caja"
            className="w-full py-2 px-3 rounded-xl bg-chilca/15 hover:bg-chilca/25 text-white text-[11.5px] font-bold flex items-center justify-center gap-2 transition-all shadow-xs border border-chilca/25"
          >
            <UtensilsCrossed size={14} className="text-chilca" />
            <span>Panel Caja / Cocina</span>
          </Link>

          <div className="grid grid-cols-2 gap-1.5 pt-0.5">
            <button
              onClick={fetchData}
              disabled={refreshing}
              className="py-1.5 px-2 rounded-xl bg-white/8 hover:bg-white/15 text-white/85 text-[10.5px] font-semibold flex items-center justify-center gap-1 transition-colors border border-white/10"
              title="Sincronizar Supabase"
            >
              <RefreshCw size={12} className={`text-chilca ${refreshing ? "animate-spin" : ""}`} />
              <span>Sincronizar</span>
            </button>

            <button
              onClick={() => { window.location.href = "/restaurante"; }}
              className="py-1.5 px-2 rounded-xl bg-white/8 hover:bg-white/15 text-white/85 text-[10.5px] font-semibold flex items-center justify-center gap-1 transition-colors border border-white/10"
            >
              <ArrowLeft size={12} className="text-chilca" />
              <span>Ver Web</span>
            </button>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full py-2 px-3 rounded-xl bg-cochinilla hover:bg-cochinilla/90 text-white border border-transparent shadow-xs text-[11.5px] font-semibold flex items-center justify-center gap-1.5 transition-all"
          >
            <LogOut size={13} />
            <span>Cerrar Sesión</span>
          </button>
        </div>

      </aside>

      {/* ==================================================================== */}
      {/* RIGHT MAIN CONTENT CANVAS AREA                                        */}
      {/* ==================================================================== */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 bg-[#f7f5ef]">
        
        {/* Top Header Bar */}
        <header className="bg-white/80 backdrop-blur-md border-b border-[#d4a373]/20 px-6 py-4 sticky top-0 z-30 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[#d4a373] block">
              Panel Administrativo • Restaurante Las Flores
            </span>
            <h1 className="font-serif italic text-2xl text-[#3b1f10] font-bold flex items-center gap-2">
              {activeTab === "analytics" && "Analítica & Inteligencia de Negocios (BI)"}
              {activeTab === "reservations" && "Control de Reservas de Mesas"}
              {activeTab === "orders" && "Gestión de Pedidos & Comandas"}
              {activeTab === "menu" && "Gestión de Carta & Platos"}
              {activeTab === "coupons" && "Cupones & Promociones"}
              {activeTab === "jobs" && "Convocatorias & Postulantes"}
              {activeTab === "zones" && "Salones del Local & Apagado de Reservas"}
            </h1>
          </div>

          {/* Quick Header Action Buttons */}
          <div className="flex items-center gap-3">
            {activeTab === "menu" && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="px-4 py-2.5 rounded-2xl bg-white border border-[#d4a373]/30 hover:bg-[#fdf8f0] text-[#3b1f10] font-sans font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <ListTree size={15} className="text-[#2e5339]" />
                  Categorías
                </button>
                <button
                  onClick={() => {
                    setSelectedProduct(null);
                    setIsProductModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-[#2e5339] hover:bg-[#23412c] text-white font-sans font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <Plus size={15} />
                  Nuevo Plato
                </button>
              </div>
            )}

            {activeTab === "coupons" && (
              <button
                onClick={() => {
                  setSelectedCoupon(null);
                  setIsCouponModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-2xl bg-[#2e5339] hover:bg-[#23412c] text-white font-sans font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Plus size={15} />
                Crear Cupón
              </button>
            )}
          </div>
        </header>

        {/* Main Content Body */}
        <main className="p-6 md:p-8 space-y-8 max-w-7xl">
          
          {/* Executive KPI Metric Cards - Harmonized Clean Grid (Only in Analytics BI tab) */}
          {activeTab === "analytics" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              
              {/* Facturación Acumulada */}
              <div className="bg-white p-5 rounded-2xl border border-eucalipto/8 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between text-nogal/50 text-[11px] font-sans font-bold uppercase tracking-wider">
                  <span>Facturación Total</span>
                  <div className="w-9 h-9 rounded-xl bg-eucalipto text-chilca flex items-center justify-center">
                    <DollarSign size={18} />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="font-sans text-3xl font-black tracking-tight tabular-nums text-nogal">
                    S/ {totalSales.toFixed(2)}
                  </span>
                  <p className="text-[11px] text-pacay mt-1 font-semibold flex items-center gap-1">
                    <TrendingUp size={12} /> Órdenes confirmadas
                  </p>
                </div>
              </div>

              {/* Pedidos en Proceso */}
              <div className="bg-white p-5 rounded-2xl border border-eucalipto/8 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between text-nogal/50 text-[11px] font-sans font-bold uppercase tracking-wider">
                  <span>Pedidos Activos</span>
                  <div className="w-9 h-9 rounded-xl bg-cielo text-white flex items-center justify-center">
                    <ShoppingBag size={18} />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="font-sans text-3xl font-black tracking-tight tabular-nums text-nogal">
                    {activeOrdersCount}
                  </span>
                  <p className="text-[11px] text-cielo mt-1 font-semibold flex items-center gap-1">
                    <Clock size={12} /> En cocina o despacho
                  </p>
                </div>
              </div>

              {/* Reservas Pendientes */}
              <div className="bg-white p-5 rounded-2xl border border-eucalipto/8 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between text-nogal/50 text-[11px] font-sans font-bold uppercase tracking-wider">
                  <span>Reservas Pendientes</span>
                  <div className="w-9 h-9 rounded-xl bg-chilca text-cafe flex items-center justify-center">
                    <Calendar size={18} />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="font-sans text-3xl font-black tracking-tight tabular-nums text-nogal">
                    {pendingReservationsCount}
                  </span>
                  <p className="text-[11px] text-chilca-dark mt-1 font-semibold flex items-center gap-1">
                    <UserCheck size={12} /> Por confirmar horario
                  </p>
                </div>
              </div>

              {/* Carta Activa */}
              <div className="bg-white p-5 rounded-2xl border border-eucalipto/8 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between text-nogal/50 text-[11px] font-sans font-bold uppercase tracking-wider">
                  <span>Carta Activa</span>
                  <div className="w-9 h-9 rounded-xl bg-eucalipto text-white flex items-center justify-center">
                    <UtensilsCrossed size={18} />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="font-sans text-3xl font-black tracking-tight tabular-nums text-nogal">
                    {availableProductsCount} <span className="text-base text-nogal/30 font-normal">/ {products.length}</span>
                  </span>
                  <p className="text-[11px] text-pacay mt-1 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={12} /> Platos disponibles en carta
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* Panel Tab Content Display */}
          <div className="bg-white rounded-3xl border border-[#d4a373]/25 shadow-sm overflow-hidden">
            
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
              <div className="p-5 bg-white border-b border-[#d4a373]/20 space-y-4">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                  {/* Search bar */}
                  <div className="relative w-full lg:w-80">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2e5339]" />
                    <input
                      type="text"
                      value={resSearch}
                      onChange={(e) => setResSearch(e.target.value)}
                      placeholder="Buscar cliente o teléfono..."
                      className="w-full text-xs bg-[#f7f5ef] border border-[#d4a373]/25 rounded-2xl pl-9 pr-4 py-2.5 text-[#3b1f10] focus:outline-none focus:ring-2 focus:ring-[#2e5339]/30"
                    />
                  </div>

                  {/* Date Range Inputs - SOLO VISIBLES EN "TODAS" O "CONFIRMADAS" */}
                  {(resStatusFilter === "all" || resStatusFilter === "confirmed") && (
                    <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                      <div className="flex items-center gap-1.5 bg-[#f7f5ef] border border-[#d4a373]/25 rounded-2xl px-3 py-1.5 shadow-2xs">
                        <span className="text-[10px] font-serif font-bold text-[#3b1f10]/60 uppercase">Desde:</span>
                        <input
                          type="date"
                          value={resDateFrom}
                          onChange={(e) => { setResDateFrom(e.target.value); setActiveDateFilter("custom"); }}
                          className="text-xs bg-transparent font-semibold text-[#3b1f10] focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-1.5 bg-[#f7f5ef] border border-[#d4a373]/25 rounded-2xl px-3 py-1.5 shadow-2xs">
                        <span className="text-[10px] font-serif font-bold text-[#3b1f10]/60 uppercase">Hasta:</span>
                        <input
                          type="date"
                          value={resDateTo}
                          onChange={(e) => { setResDateTo(e.target.value); setActiveDateFilter("custom"); }}
                          className="text-xs bg-transparent font-semibold text-[#3b1f10] focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Status buttons */}
                  <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto">
                    <span className="text-xs font-serif font-bold text-[#3b1f10]/60 uppercase tracking-wider whitespace-nowrap">Estado:</span>
                    {["all", "pending", "confirmed", "completed", "cancelled"].map((st) => (
                      <button
                        key={st}
                        onClick={() => setResStatusFilter(st)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap cursor-pointer ${
                          resStatusFilter === st
                            ? "bg-[#2e5339] text-white shadow-xs"
                            : "bg-[#f7f5ef] border border-[#d4a373]/25 text-[#3b1f10]/70 hover:bg-white"
                        }`}
                      >
                        {st === "all" ? "Todas" : st === "pending" ? "Pendientes" : st === "confirmed" ? "Confirmadas" : st === "completed" ? "Completadas" : "Canceladas"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Date Range Shortcuts - SOLO VISIBLES EN "TODAS" O "CONFIRMADAS" */}
                {(resStatusFilter === "all" || resStatusFilter === "confirmed") && (
                  <div className="flex items-center gap-2 pt-3 border-t border-[#d4a373]/15 overflow-x-auto">
                    <span className="text-[11px] font-serif font-bold text-[#3b1f10]/60 uppercase tracking-wider shrink-0">
                      Filtro Rápido:
                    </span>
                    <button
                      onClick={() => setQuickDateRange("today")}
                      className={`px-3 py-1 font-bold text-xs rounded-xl transition-colors shrink-0 cursor-pointer ${activeDateFilter === "today" ? "bg-[#2e5339] text-white" : "bg-[#f7f5ef] hover:bg-white text-[#3b1f10]/70 border border-[#d4a373]/25"}`}
                    >
                      Hoy
                    </button>
                    <button
                      onClick={() => setQuickDateRange("week")}
                      className={`px-3 py-1 font-bold text-xs rounded-xl transition-colors shrink-0 cursor-pointer ${activeDateFilter === "week" ? "bg-[#2e5339] text-white" : "bg-[#f7f5ef] hover:bg-white text-[#3b1f10]/70 border border-[#d4a373]/25"}`}
                    >
                      Esta Semana
                    </button>
                    <button
                      onClick={() => setQuickDateRange("month")}
                      className={`px-3 py-1 font-bold text-xs rounded-xl transition-colors shrink-0 cursor-pointer ${activeDateFilter === "month" ? "bg-[#2e5339] text-white" : "bg-[#f7f5ef] hover:bg-white text-[#3b1f10]/70 border border-[#d4a373]/25"}`}
                    >
                      Este Mes
                    </button>
                    <button
                      onClick={() => setQuickDateRange("all")}
                      className={`px-3 py-1 font-bold text-xs rounded-xl transition-colors shrink-0 cursor-pointer ${activeDateFilter === "all" ? "bg-[#8C1D40] text-white" : "bg-[#8C1D40]/10 hover:bg-[#8C1D40] hover:text-white text-[#8C1D40] border border-[#8C1D40]/20"}`}
                    >
                      Limpiar Fechas (Ver Histórico)
                    </button>
                  </div>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-[11px] font-serif font-bold uppercase tracking-wider text-[#3b1f10]/60 bg-[#f7f5ef] border-b border-[#d4a373]/20">
                    <tr>
                      <th className="px-6 py-4">Cliente</th>
                      <th className="px-6 py-4">Fecha y Hora</th>
                      <th className="px-6 py-4">Personas</th>
                      <th className="px-6 py-4">Servicio</th>
                      <th className="px-6 py-4">Estado</th>
                      <th className="px-6 py-4 text-right">Contacto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#d4a373]/15">
                    {filteredReservations.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-[#3b1f10]/40">
                          No hay reservas para mostrar.
                        </td>
                      </tr>
                    ) : (
                      filteredReservations.map((res) => {
                        const rawPhone = res.client_phone ? res.client_phone.replace(/\D/g, "") : "";
                        const fullPhone = rawPhone.length === 9 ? `51${rawPhone}` : rawPhone;
                        const whatsappUrl = `https://wa.me/${fullPhone}?text=Hola%20${encodeURIComponent(res.client_name)},%20te%20contactamos%20de%20Restaurante%20Las%20Flores%20sobre%20tu%20reserva%20para%20el%20dia%20${encodeURIComponent(res.reservation_date)}.`;

                        return (
                          <tr key={res.id} className="hover:bg-[#fdf8f0]/80 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-[#2e5339]/10 text-[#2e5339] font-bold text-xs flex items-center justify-center shrink-0 border border-[#2e5339]/20">
                                  {(res.client_name || "C").charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-bold text-[#3b1f10] text-sm">{res.client_name}</div>
                                  <div className="text-[#3b1f10]/50 text-[11px] font-mono">{res.client_phone || "Sin teléfono"}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-bold text-[#3b1f10]">{res.reservation_date}</div>
                              <div className="text-[#2e5339] font-semibold">{res.reservation_time}</div>
                            </td>
                            <td className="px-6 py-4 font-bold text-[#3b1f10]">
                              {res.guest_count} personas
                            </td>
                            <td className="px-6 py-4 capitalize text-[#3b1f10]/70 font-medium">
                              {res.service_type || "Almuerzo"}
                            </td>
                            <td className="px-6 py-4">
                              <select
                                value={res.status || "pending"}
                                onChange={(e) => handleUpdateReservationStatus(res.id, e.target.value)}
                                className={`border font-bold rounded-xl px-3 py-1.5 focus:outline-none text-xs cursor-pointer transition-colors shadow-2xs ${
                                  res.status === "confirmed"
                                    ? "bg-emerald-50 text-emerald-900 border-emerald-300/70 hover:bg-emerald-100"
                                    : res.status === "completed"
                                    ? "bg-sky-50 text-sky-900 border-sky-300/70 hover:bg-sky-100"
                                    : res.status === "cancelled"
                                    ? "bg-rose-50 text-rose-900 border-rose-300/70 hover:bg-rose-100"
                                    : "bg-amber-50 text-amber-900 border-amber-300/70 hover:bg-amber-100"
                                }`}
                              >
                                <option value="pending" className="bg-white text-[#3b1f10]">Pendiente</option>
                                <option value="confirmed" className="bg-white text-[#3b1f10]">Confirmada</option>
                                <option value="completed" className="bg-white text-[#3b1f10]">Completada</option>
                                <option value="cancelled" className="bg-white text-[#3b1f10]">Cancelada</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 text-right">
                              {res.client_phone && (
                                <a
                                  href={whatsappUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#2e5339] bg-[#2e5339]/10 hover:bg-[#2e5339] hover:text-white border border-[#2e5339]/25 rounded-xl shadow-2xs transition-all"
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
              <div className="p-5 bg-white border-b border-[#d4a373]/20 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-col gap-3 w-full md:w-auto">
                  <div className="relative w-full md:w-80">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2e5339]" />
                    <input
                      type="text"
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      placeholder="Buscar pedido #, cliente..."
                      className="w-full text-xs bg-[#f7f5ef] border border-[#d4a373]/25 rounded-2xl pl-9 pr-4 py-2.5 text-[#3b1f10] focus:outline-none focus:ring-2 focus:ring-[#2e5339]/30"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                    <div className="flex items-center gap-1.5 bg-[#f7f5ef] border border-[#d4a373]/25 rounded-2xl px-3 py-1.5 shadow-2xs">
                      <span className="text-[10px] font-serif font-bold text-[#3b1f10]/60 uppercase">Desde:</span>
                      <input
                        type="date"
                        value={orderDateFrom}
                        onChange={(e) => { setOrderDateFrom(e.target.value); setActiveOrderDateFilter("custom"); }}
                        className="text-xs bg-transparent font-semibold text-[#3b1f10] focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 bg-[#f7f5ef] border border-[#d4a373]/25 rounded-2xl px-3 py-1.5 shadow-2xs">
                      <span className="text-[10px] font-serif font-bold text-[#3b1f10]/60 uppercase">Hasta:</span>
                      <input
                        type="date"
                        value={orderDateTo}
                        onChange={(e) => { setOrderDateTo(e.target.value); setActiveOrderDateFilter("custom"); }}
                        className="text-xs bg-transparent font-semibold text-[#3b1f10] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 w-full md:w-auto items-start md:items-end">
                  <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                    <span className="text-xs font-serif font-bold text-[#3b1f10]/60 uppercase tracking-wider whitespace-nowrap">Estado:</span>
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
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                          orderStatusFilter === st.id
                            ? "bg-[#2e5339] text-white shadow-xs"
                            : "bg-[#f7f5ef] border border-[#d4a373]/25 text-[#3b1f10]/70 hover:bg-white"
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Date Range Shortcuts */}
              <div className="px-5 pb-4 pt-3 bg-white border-b border-[#d4a373]/20 flex items-center gap-2 overflow-x-auto">
                <span className="text-[11px] font-serif font-bold text-[#3b1f10]/60 uppercase tracking-wider shrink-0">
                  Filtro Rápido:
                </span>
                <button onClick={() => setQuickOrderDateRange("today")} className={`px-3 py-1 font-bold text-xs rounded-xl transition-colors shrink-0 cursor-pointer ${activeOrderDateFilter === "today" ? "bg-[#2e5339] text-white" : "bg-[#f7f5ef] hover:bg-white text-[#3b1f10]/70 border border-[#d4a373]/25"}`}>Hoy</button>
                <button onClick={() => setQuickOrderDateRange("week")} className={`px-3 py-1 font-bold text-xs rounded-xl transition-colors shrink-0 cursor-pointer ${activeOrderDateFilter === "week" ? "bg-[#2e5339] text-white" : "bg-[#f7f5ef] hover:bg-white text-[#3b1f10]/70 border border-[#d4a373]/25"}`}>Esta Semana</button>
                <button onClick={() => setQuickOrderDateRange("month")} className={`px-3 py-1 font-bold text-xs rounded-xl transition-colors shrink-0 cursor-pointer ${activeOrderDateFilter === "month" ? "bg-[#2e5339] text-white" : "bg-[#f7f5ef] hover:bg-white text-[#3b1f10]/70 border border-[#d4a373]/25"}`}>Este Mes</button>
                <button onClick={() => setQuickOrderDateRange("all")} className={`px-3 py-1 font-bold text-xs rounded-xl transition-colors shrink-0 cursor-pointer ${activeOrderDateFilter === "all" ? "bg-[#8C1D40] text-white" : "bg-[#8C1D40]/10 hover:bg-[#8C1D40] hover:text-white text-[#8C1D40] border border-[#8C1D40]/20"}`}>Limpiar Fechas (Ver Histórico)</button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-[11px] font-serif font-bold uppercase tracking-wider text-[#3b1f10]/60 bg-[#f7f5ef] border-b border-[#d4a373]/20">
                    <tr>
                      <th className="px-6 py-4">N° Orden</th>
                      <th className="px-6 py-4">Cliente</th>
                      <th className="px-6 py-4">Modalidad</th>
                      <th className="px-6 py-4">Total</th>
                      <th className="px-6 py-4">Estado</th>
                      <th className="px-6 py-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#d4a373]/15">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-[#3b1f10]/40">
                          No hay pedidos registrados.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-[#fdf8f0]/80 transition-colors">
                          <td className="px-6 py-4 font-mono font-bold text-[#3b1f10] text-sm">
                            #{ord.order_number}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-[#3b1f10]">{ord.client_name || "Anónimo"}</div>
                            <div className="text-[#3b1f10]/50 text-[11px] font-mono">{ord.client_phone}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-[#f7f5ef] text-[#3b1f10]/80 border border-[#d4a373]/25">
                              {ord.order_type === "delivery" ? "Delivery" : "Recojo"}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-serif font-extrabold text-[#2e5339] text-base">
                            S/ {Number(ord.total).toFixed(2)}
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={ord.status || "received"}
                              onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                              className={`border font-bold rounded-xl px-3 py-1.5 focus:outline-none text-xs cursor-pointer transition-colors shadow-2xs ${
                                ord.status === "preparing"
                                  ? "bg-indigo-50 text-indigo-900 border-indigo-300/70 hover:bg-indigo-100"
                                  : ord.status === "on_the_way"
                                  ? "bg-sky-50 text-sky-900 border-sky-300/70 hover:bg-sky-100"
                                  : ord.status === "delivered"
                                  ? "bg-emerald-50 text-emerald-900 border-emerald-300/70 hover:bg-emerald-100"
                                  : ord.status === "cancelled"
                                  ? "bg-rose-50 text-rose-900 border-rose-300/70 hover:bg-rose-100"
                                  : "bg-amber-50 text-amber-900 border-amber-300/70 hover:bg-amber-100"
                              }`}
                            >
                              <option value="received" className="bg-white text-[#3b1f10]">Recibido</option>
                              <option value="preparing" className="bg-white text-[#3b1f10]">En Preparación</option>
                              <option value="on_the_way" className="bg-white text-[#3b1f10]">En Camino</option>
                              <option value="delivered" className="bg-white text-[#3b1f10]">Entregado</option>
                              <option value="cancelled" className="bg-white text-[#3b1f10]">Cancelado</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedOrder(ord);
                                setIsOrderModalOpen(true);
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#2e5339] hover:text-white text-[#3b1f10] font-bold border border-[#d4a373]/30 text-xs inline-flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
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
              <div className="p-4 bg-piedra border-b border-eucalipto/8 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-80">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-nogal/30" />
                  <input
                    type="text"
                    value={menuSearch}
                    onChange={(e) => setMenuSearch(e.target.value)}
                    placeholder="Buscar plato por nombre..."
                    className="w-full text-xs bg-white border border-eucalipto/12 rounded-xl pl-9 pr-4 py-2.5 text-nogal focus:outline-none focus:ring-2 focus:ring-cafe/20"
                  />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <span className="text-xs font-serif font-bold text-nogal/40 uppercase tracking-wider whitespace-nowrap">Categoría:</span>
                  <select
                    value={menuCategoryFilter}
                    onChange={(e) => setMenuCategoryFilter(e.target.value)}
                    className="bg-white border border-eucalipto/12 text-nogal font-bold rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-cafe/20"
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
                  <thead className="text-[11px] font-serif font-bold uppercase tracking-wider text-nogal/40 bg-piedra border-b border-eucalipto/8">
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
                        <td colSpan={6} className="px-6 py-12 text-center text-nogal/30">
                          No hay platos registrados.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((prod) => (
                        <tr key={prod.id} className="hover:bg-piedra/60 transition-colors">
                          <td className="px-6 py-4">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-eucalipto/5 border border-eucalipto/8 shrink-0">
                              {prod.image_url ? (
                                <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-nogal/30">
                                  <UtensilsCrossed size={16} />
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-serif font-bold text-nogal text-sm">{prod.name}</div>
                            {prod.description && <p className="text-nogal/40 text-xs line-clamp-1">{prod.description}</p>}
                          </td>
                          <td className="px-6 py-4 text-nogal/60 font-medium">
                            {prod.categories?.name || "General"}
                          </td>
                          <td className="px-6 py-4 font-serif font-bold text-pacay text-sm">
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
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setSelectedProduct(prod);
                                  setIsProductModalOpen(true);
                                }}
                                className="px-3.5 py-1.5 rounded-lg bg-eucalipto/5 hover:bg-eucalipto/10 text-nogal font-bold border border-eucalipto/10 text-xs inline-flex items-center gap-1.5 transition-colors"
                              >
                                <Edit2 size={12} /> Editar
                              </button>
                            </div>
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
              <div className="p-5 bg-white border-b border-[#d4a373]/20 flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-base text-[#3b1f10] flex items-center gap-2">
                    <Ticket size={18} className="text-[#2e5339]" />
                    Gestión de Cupones & Códigos Promocionales
                  </h3>
                  <p className="text-xs text-[#3b1f10]/60">Configuración de límites de uso, descuentos en % o S/ y restricciones</p>
                </div>

                <button
                  onClick={() => {
                    setSelectedCoupon(null);
                    setIsCouponModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-[#2e5339] hover:bg-[#23412c] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Plus size={14} /> Crear Nuevo Cupón
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-[11px] font-serif font-bold uppercase tracking-wider text-[#3b1f10]/60 bg-[#f7f5ef] border-b border-[#d4a373]/20">
                    <tr>
                      <th className="px-6 py-4">Código del Cupón</th>
                      <th className="px-6 py-4">Descuento</th>
                      <th className="px-6 py-4">Límite de Usos & Progreso</th>
                      <th className="px-6 py-4">Modalidad Válida</th>
                      <th className="px-6 py-4">Estado</th>
                      <th className="px-6 py-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#d4a373]/15">
                    {coupons.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-[#3b1f10]/40">
                          No hay cupones creados aún. Haz clic en "Crear Nuevo Cupón" para comenzar (ej: FLORES2026).
                        </td>
                      </tr>
                    ) : (
                      coupons.map((c) => {
                        const usedPercent = Math.min(Math.round(((c.used_count || 0) / (c.max_uses || 1)) * 100), 100);
                        const isExpired = (c.used_count || 0) >= (c.max_uses || 1);

                        return (
                          <tr key={c.id} className="hover:bg-[#fdf8f0]/80 transition-colors">
                            <td className="px-6 py-4">
                              <span className="font-mono font-black text-sm px-3.5 py-1.5 bg-[#f7f5ef] text-[#3b1f10] border border-dashed border-[#d4a373]/50 rounded-xl tracking-wider shadow-2xs">
                                {c.code}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-serif font-extrabold text-base text-[#2e5339]">
                                {c.discount_type === "percent" ? `${c.discount_value}% OFF` : `S/ ${Number(c.discount_value).toFixed(2)} OFF`}
                              </span>
                              {c.min_order_total > 0 && (
                                <p className="text-[10px] text-[#3b1f10]/50 font-semibold mt-0.5">Mínimo: S/ {c.min_order_total}</p>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-1.5">
                                <div className="flex justify-between text-xs font-bold">
                                  <span className={isExpired ? "text-[#8C1D40]" : "text-[#3b1f10]"}>
                                    {c.used_count || 0} / {c.max_uses} usos
                                  </span>
                                  <span className="text-[#3b1f10]/50 font-mono text-[11px]">{usedPercent}%</span>
                                </div>
                                <div className="w-48 bg-[#f7f5ef] h-2.5 rounded-full overflow-hidden border border-[#d4a373]/25">
                                  <div
                                    style={{ width: `${usedPercent}%` }}
                                    className={`h-full transition-all ${isExpired ? "bg-[#8C1D40]" : "bg-[#2e5339]"}`}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 font-semibold text-[#3b1f10]/70 capitalize">
                              {c.order_type_restriction === "delivery" ? "Solo Delivery" : c.order_type_restriction === "pickup" ? "Solo Recojo" : "Todas las Modalidades"}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                c.is_active && !isExpired
                                  ? "bg-emerald-50 text-[#2e5339] border-emerald-200"
                                  : "bg-red-50 text-[#8C1D40] border-red-200"
                              }`}>
                                {isExpired ? "Agotado (100% usos)" : c.is_active ? "Activo" : "Inactivo"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => {
                                  setSelectedCoupon(c);
                                  setIsCouponModalOpen(true);
                                }}
                                className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#2e5339] hover:text-white text-[#3b1f10] font-bold border border-[#d4a373]/30 text-xs inline-flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
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

          {/* TRABAJA CON NOSOTROS (CONVOCATORIAS & CVS) */}
          {activeTab === "jobs" && <AdminJobsSection />}

          {/* SALONES & APAGADO DE RESERVAS */}
          {activeTab === "zones" && <AdminZonesSection />}

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
        onDelete={handleDeleteProduct}
      />

      <AdminCouponModal
        isOpen={isCouponModalOpen}
        onClose={() => setIsCouponModalOpen(false)}
        coupon={selectedCoupon}
        onSave={fetchData}
      />

      <AdminCategoryListModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onCategoryChanged={fetchData}
      />

    </div>
  );
}

// Inject CSS rule to completely hide browser scrollbars on the admin sidebar
const hideScrollbarStyles = `
.hide-scrollbar::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}
.hide-scrollbar {
  -ms-overflow-style: none !important;
  scrollbar-width: none !important;
}
`;
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = hideScrollbarStyles;
  document.head.appendChild(styleSheet);
}






