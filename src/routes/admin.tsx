import { createFileRoute } from "@tanstack/react-router";
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
  ChevronRight,
  Sparkles,
} from "lucide-react";

import { AdminOrderDetailModal } from "../components/AdminOrderDetailModal";
import { AdminProductModal } from "../components/AdminProductModal";
import { AdminAnalyticsSection } from "../components/AdminAnalyticsSection";

export const Route = createFileRoute("/admin")({
  component: AdminRoute,
});

function AdminRoute() {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<"analytics" | "orders" | "reservations" | "menu">("analytics");
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [reservations, setReservations] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // Search & Filter states
  const [resSearch, setResSearch] = useState("");
  const [resStatusFilter, setResStatusFilter] = useState("all");

  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");

  const [menuSearch, setMenuSearch] = useState("");
  const [menuCategoryFilter, setMenuCategoryFilter] = useState("all");

  // Modal states
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  useEffect(() => {
    checkAuth();

    // Supabase Realtime Listener
    const channel = supabase
      .channel("admin-realtime-dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "reservations" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => fetchData())
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
    return matchSearch && matchStatus;
  });

  const filteredOrders = orders.filter((ord) => {
    const matchSearch =
      (ord.order_number || "").toString().includes(orderSearch) ||
      (ord.client_name || "").toLowerCase().includes(orderSearch.toLowerCase()) ||
      (ord.client_phone || "").includes(orderSearch);
    const matchStatus = orderStatusFilter === "all" || ord.status === orderStatusFilter;
    return matchSearch && matchStatus;
  });

  const filteredProducts = products.filter((prod) => {
    const matchSearch = (prod.name || "").toLowerCase().includes(menuSearch.toLowerCase());
    const matchCategory = menuCategoryFilter === "all" || prod.category_id === menuCategoryFilter;
    return matchSearch && matchCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0E1814] flex items-center justify-center flex-col gap-4 text-[#FAF8F5]">
        <Loader2 className="w-10 h-10 animate-spin text-[#D4AF37]" />
        <p className="font-serif text-sm font-bold tracking-widest uppercase text-[#D4AF37]/90">
          Las Flores | Panel Ejecutivo
        </p>
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen bg-[#0E1814] text-[#FAF8F5] pb-20 font-sans selection:bg-[#D4AF37] selection:text-[#0E1814]">
      
      {/* Luxury Dark Header with Gold Accent Line */}
      <header className="bg-[#14231D]/90 backdrop-blur-md sticky top-0 z-40 border-b border-[#D4AF37]/30 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          
          {/* Brand Identity */}
          <div className="flex items-center gap-4">
            <img
              src="/flor-retablo.png"
              alt="Las Flores"
              className="h-11 w-auto object-contain filter drop-shadow-[0_2px_8px_rgba(212,175,55,0.3)]"
            />
            <div className="h-8 w-px bg-[#D4AF37]/30 hidden sm:block" />
            <div>
              <h1 className="font-serif text-xl font-bold tracking-wide text-[#FAF8F5] flex items-center gap-2.5">
                Restaurante Las Flores
                <span className="text-[10px] font-sans px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  REALTIME ACTIVO
                </span>
              </h1>
              <p className="text-[11px] text-[#D4AF37]/80 font-serif italic tracking-wide">
                Tres Generaciones Cocinando Ayacucho — Panel Ejecutivo
              </p>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              disabled={refreshing}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-[#D4AF37]/30 text-[#FAF8F5] transition-all flex items-center gap-2 text-xs font-medium"
              title="Sincronizar datos"
            >
              <RefreshCw size={14} className={`text-[#D4AF37] ${refreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>

            <button
              onClick={() => { window.location.href = "/restaurante"; }}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-[#FAF8F5] text-xs font-medium flex items-center gap-1.5 transition-all"
            >
              <ArrowLeft size={14} className="text-[#D4AF37]" />
              <span className="hidden sm:inline">Ver Sitio Web</span>
            </button>

            <button
              onClick={handleSignOut}
              className="px-3.5 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 text-xs font-medium flex items-center gap-1.5 transition-all"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Luxury Top KPI Cards (Ayacucho Dark / Gold Retablo Aesthetic) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Facturación Acumulada */}
          <div className="bg-gradient-to-br from-[#182B24] to-[#14231D] p-5 rounded-2xl border border-[#D4AF37]/30 shadow-xl relative overflow-hidden group hover:border-[#D4AF37]/60 transition-all">
            <div className="absolute right-0 top-0 w-24 h-24 bg-[#D4AF37]/5 rounded-full blur-2xl pointer-events-none group-hover:bg-[#D4AF37]/10 transition-all" />
            <div className="flex items-center justify-between text-[#FAF8F5]/70 text-[11px] font-bold uppercase tracking-widest">
              <span>Facturación Total</span>
              <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center">
                <DollarSign size={16} />
              </div>
            </div>
            <div className="mt-3">
              <span className="font-serif text-3xl font-black text-[#D4AF37] tracking-tight">
                S/ {totalSales.toFixed(2)}
              </span>
              <p className="text-[11px] text-emerald-400 mt-1 font-medium flex items-center gap-1">
                <TrendingUp size={12} /> Ordenes confirmadas
              </p>
            </div>
          </div>

          {/* Pedidos en Proceso */}
          <div className="bg-gradient-to-br from-[#182B24] to-[#14231D] p-5 rounded-2xl border border-white/10 shadow-xl hover:border-white/20 transition-all">
            <div className="flex items-center justify-between text-[#FAF8F5]/70 text-[11px] font-bold uppercase tracking-widest">
              <span>Pedidos Activos</span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                <ShoppingBag size={16} />
              </div>
            </div>
            <div className="mt-3">
              <span className="font-serif text-3xl font-black text-[#FAF8F5]">
                {activeOrdersCount}
              </span>
              <p className="text-[11px] text-blue-400 mt-1 font-medium flex items-center gap-1">
                <Clock size={12} /> En cocina o despacho
              </p>
            </div>
          </div>

          {/* Reservas Pendientes */}
          <div className="bg-gradient-to-br from-[#182B24] to-[#14231D] p-5 rounded-2xl border border-white/10 shadow-xl hover:border-white/20 transition-all">
            <div className="flex items-center justify-between text-[#FAF8F5]/70 text-[11px] font-bold uppercase tracking-widest">
              <span>Reservas Pendientes</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <Calendar size={16} />
              </div>
            </div>
            <div className="mt-3">
              <span className="font-serif text-3xl font-black text-[#FAF8F5]">
                {pendingReservationsCount}
              </span>
              <p className="text-[11px] text-amber-400 mt-1 font-medium flex items-center gap-1">
                <UserCheck size={12} /> Requieren confirmación
              </p>
            </div>
          </div>

          {/* Disponibilidad de Carta */}
          <div className="bg-gradient-to-br from-[#182B24] to-[#14231D] p-5 rounded-2xl border border-white/10 shadow-xl hover:border-white/20 transition-all">
            <div className="flex items-center justify-between text-[#FAF8F5]/70 text-[11px] font-bold uppercase tracking-widest">
              <span>Platos Activos</span>
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                <UtensilsCrossed size={16} />
              </div>
            </div>
            <div className="mt-3">
              <span className="font-serif text-3xl font-black text-[#FAF8F5]">
                {availableProductsCount} <span className="text-lg text-[#FAF8F5]/50 font-normal">/ {products.length}</span>
              </span>
              <p className="text-[11px] text-purple-300 mt-1 font-medium flex items-center gap-1">
                <CheckCircle2 size={12} /> Disponibles en carta web
              </p>
            </div>
          </div>

        </div>

        {/* Tab Navigation Menu */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#182B24]/90 backdrop-blur-md p-2 rounded-2xl border border-[#D4AF37]/30 shadow-xl">
          
          <div className="flex items-center gap-2 overflow-x-auto p-1">
            
            {/* BI Tab - FIRST */}
            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-xs font-bold font-serif tracking-wider uppercase transition-all whitespace-nowrap ${
                activeTab === "analytics"
                  ? "bg-[#D4AF37] text-[#0E1814] shadow-lg font-black"
                  : "text-[#FAF8F5]/70 hover:text-[#FAF8F5] hover:bg-white/5"
              }`}
            >
              <BarChart3 size={16} />
              Analítica & Inteligencia de Negocios
            </button>

            {/* Pedidos Tab */}
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-xs font-bold font-serif tracking-wider uppercase transition-all whitespace-nowrap ${
                activeTab === "orders"
                  ? "bg-[#D4AF37] text-[#0E1814] shadow-lg font-black"
                  : "text-[#FAF8F5]/70 hover:text-[#FAF8F5] hover:bg-white/5"
              }`}
            >
              <ShoppingBag size={16} />
              Gestión de Pedidos
              <span className={`px-2 py-0.5 text-[10px] rounded-full font-sans font-extrabold ${
                activeTab === "orders" ? "bg-[#0E1814] text-[#D4AF37]" : "bg-white/10 text-[#FAF8F5]"
              }`}>
                {orders.length}
              </span>
            </button>

            {/* Reservas Tab */}
            <button
              onClick={() => setActiveTab("reservations")}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-xs font-bold font-serif tracking-wider uppercase transition-all whitespace-nowrap ${
                activeTab === "reservations"
                  ? "bg-[#D4AF37] text-[#0E1814] shadow-lg font-black"
                  : "text-[#FAF8F5]/70 hover:text-[#FAF8F5] hover:bg-white/5"
              }`}
            >
              <Calendar size={16} />
              Control de Reservas
              <span className={`px-2 py-0.5 text-[10px] rounded-full font-sans font-extrabold ${
                activeTab === "reservations" ? "bg-[#0E1814] text-[#D4AF37]" : "bg-white/10 text-[#FAF8F5]"
              }`}>
                {reservations.length}
              </span>
            </button>

            {/* Carta Tab */}
            <button
              onClick={() => setActiveTab("menu")}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-xs font-bold font-serif tracking-wider uppercase transition-all whitespace-nowrap ${
                activeTab === "menu"
                  ? "bg-[#D4AF37] text-[#0E1814] shadow-lg font-black"
                  : "text-[#FAF8F5]/70 hover:text-[#FAF8F5] hover:bg-white/5"
              }`}
            >
              <MenuIcon size={16} />
              Gestión de Carta
              <span className={`px-2 py-0.5 text-[10px] rounded-full font-sans font-extrabold ${
                activeTab === "menu" ? "bg-[#0E1814] text-[#D4AF37]" : "bg-white/10 text-[#FAF8F5]"
              }`}>
                {products.length}
              </span>
            </button>
          </div>

          {activeTab === "menu" && (
            <button
              onClick={() => {
                setSelectedProduct(null);
                setIsProductModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#b8952c] text-[#0E1814] font-serif font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all uppercase tracking-wider"
            >
              <Plus size={15} />
              Nuevo Plato
            </button>
          )}

        </div>

        {/* Panel Content Containers */}
        <div className="bg-[#182B24]/90 backdrop-blur-md rounded-2xl border border-[#D4AF37]/30 shadow-2xl overflow-hidden">
          
          {/* ================= ANALYTICS TAB ================= */}
          {activeTab === "analytics" && (
            <AdminAnalyticsSection
              orders={orders}
              orderItems={orderItems}
              products={products}
            />
          )}

          {/* ================= RESERVATIONS TAB ================= */}
          {activeTab === "reservations" && (
            <div>
              <div className="p-4 bg-white/5 border-b border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-80">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={resSearch}
                    onChange={(e) => setResSearch(e.target.value)}
                    placeholder="Buscar cliente o teléfono..."
                    className="w-full text-xs bg-[#0E1814] border border-white/15 rounded-xl pl-9 pr-4 py-2.5 text-[#FAF8F5] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                  <span className="text-xs font-serif font-bold text-[#D4AF37] uppercase tracking-wider whitespace-nowrap">Estado:</span>
                  {["all", "pending", "confirmed", "completed", "cancelled"].map((st) => (
                    <button
                      key={st}
                      onClick={() => setResStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                        resStatusFilter === st
                          ? "bg-[#D4AF37] text-[#0E1814] font-bold"
                          : "bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10"
                      }`}
                    >
                      {st === "all" ? "Todas" : st === "pending" ? "Pendientes" : st === "confirmed" ? "Confirmadas" : st === "completed" ? "Completadas" : "Canceladas"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-[11px] font-serif font-bold uppercase tracking-wider text-[#D4AF37] bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4">Cliente</th>
                      <th className="px-6 py-4">Fecha y Hora</th>
                      <th className="px-6 py-4">Personas</th>
                      <th className="px-6 py-4">Servicio</th>
                      <th className="px-6 py-4">Estado</th>
                      <th className="px-6 py-4 text-right">Contacto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-200">
                    {filteredReservations.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                          No hay reservas para mostrar.
                        </td>
                      </tr>
                    ) : (
                      filteredReservations.map((res) => {
                        const rawPhone = res.client_phone ? res.client_phone.replace(/\D/g, "") : "";
                        const fullPhone = rawPhone.length === 9 ? `51${rawPhone}` : rawPhone;
                        const whatsappUrl = `https://wa.me/${fullPhone}?text=Hola%20${encodeURIComponent(res.client_name)},%20te%20contactamos%20de%20Restaurante%20Las%20Flores%20sobre%20tu%20reserva%20para%20el%20dia%20${encodeURIComponent(res.reservation_date)}.`;

                        return (
                          <tr key={res.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-bold text-[#FAF8F5]">{res.client_name}</div>
                              <div className="text-gray-400">{res.client_phone || "Sin teléfono"}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-bold text-[#FAF8F5]">{res.reservation_date}</div>
                              <div className="text-[#D4AF37] text-xs font-semibold">{res.reservation_time}</div>
                            </td>
                            <td className="px-6 py-4 font-bold text-gray-200">
                              {res.guest_count} personas
                            </td>
                            <td className="px-6 py-4 capitalize text-gray-300">
                              {res.service_type || "Almuerzo"}
                            </td>
                            <td className="px-6 py-4">
                              <select
                                value={res.status || "pending"}
                                onChange={(e) => handleUpdateReservationStatus(res.id, e.target.value)}
                                className="bg-[#0E1814] text-[#FAF8F5] border border-white/20 font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#D4AF37]"
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
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/20 transition-colors"
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
              <div className="p-4 bg-white/5 border-b border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-80">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Buscar pedido #, cliente..."
                    className="w-full text-xs bg-[#0E1814] border border-white/15 rounded-xl pl-9 pr-4 py-2.5 text-[#FAF8F5] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                  <span className="text-xs font-serif font-bold text-[#D4AF37] uppercase tracking-wider whitespace-nowrap">Estado:</span>
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
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                        orderStatusFilter === st.id
                          ? "bg-[#D4AF37] text-[#0E1814] font-bold"
                          : "bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10"
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-[11px] font-serif font-bold uppercase tracking-wider text-[#D4AF37] bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4">N° Orden</th>
                      <th className="px-6 py-4">Cliente</th>
                      <th className="px-6 py-4">Modalidad</th>
                      <th className="px-6 py-4">Total</th>
                      <th className="px-6 py-4">Estado</th>
                      <th className="px-6 py-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-200">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                          No hay pedidos registrados.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 font-serif font-bold text-[#D4AF37] text-sm">
                            #{ord.order_number}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-[#FAF8F5]">{ord.client_name || "Anónimo"}</div>
                            <div className="text-gray-400">{ord.client_phone}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/10 text-gray-200 border border-white/15">
                              {ord.order_type === "delivery" ? "Delivery" : "Recojo"}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-serif font-bold text-[#D4AF37] text-sm">
                            S/ {Number(ord.total).toFixed(2)}
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={ord.status || "received"}
                              onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                              className="bg-[#0E1814] text-[#FAF8F5] border border-white/20 font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#D4AF37]"
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
                              className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#FAF8F5] border border-white/15 text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
                            >
                              <Eye size={13} className="text-[#D4AF37]" /> Detalle
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
              <div className="p-4 bg-white/5 border-b border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-80">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={menuSearch}
                    onChange={(e) => setMenuSearch(e.target.value)}
                    placeholder="Buscar plato por nombre..."
                    className="w-full text-xs bg-[#0E1814] border border-white/15 rounded-xl pl-9 pr-4 py-2.5 text-[#FAF8F5] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <span className="text-xs font-serif font-bold text-[#D4AF37] uppercase tracking-wider whitespace-nowrap">Categoría:</span>
                  <select
                    value={menuCategoryFilter}
                    onChange={(e) => setMenuCategoryFilter(e.target.value)}
                    className="bg-[#0E1814] text-[#FAF8F5] border border-white/20 font-semibold rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#D4AF37]"
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
                  <thead className="text-[11px] font-serif font-bold uppercase tracking-wider text-[#D4AF37] bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4 w-20">Imagen</th>
                      <th className="px-6 py-4">Producto</th>
                      <th className="px-6 py-4">Categoría</th>
                      <th className="px-6 py-4">Precio</th>
                      <th className="px-6 py-4">Disponibilidad</th>
                      <th className="px-6 py-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-200">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                          No hay platos registrados.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((prod) => (
                        <tr key={prod.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#0E1814] border border-white/15 shrink-0">
                              {prod.image_url ? (
                                <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-500">
                                  <UtensilsCrossed size={16} />
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-serif font-bold text-[#FAF8F5] text-sm">{prod.name}</div>
                            {prod.description && <p className="text-gray-400 text-xs line-clamp-1">{prod.description}</p>}
                          </td>
                          <td className="px-6 py-4 text-gray-300">
                            {prod.categories?.name || "General"}
                          </td>
                          <td className="px-6 py-4 font-serif font-bold text-[#D4AF37] text-sm">
                            S/ {Number(prod.price).toFixed(2)}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleToggleProductAvailability(prod.id, prod.is_available)}
                              className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                                prod.is_available
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                  : "bg-red-500/10 text-red-400 border-red-500/30"
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
                              className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#FAF8F5] border border-white/15 text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
                            >
                              <Edit2 size={12} className="text-[#D4AF37]" /> Editar
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

        </div>
      </main>

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

    </div>
  );
}
