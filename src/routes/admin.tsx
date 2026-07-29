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

    // Supabase Realtime Listener (Actualización en tiempo real sin recargar)
    const channel = supabase
      .channel("admin-realtime-dashboard")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          fetchData();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reservations" },
        () => {
          fetchData();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => {
          fetchData();
        }
      )
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

      // 3. Order Items (for BI Analytics)
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

  // Direct Supabase Handlers
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev: any) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error("Error updating order status:", err);
      alert("No se pudo actualizar el estado del pedido.");
    }
  };

  const handleUpdateReservationStatus = async (resId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("reservations")
        .update({ status: newStatus })
        .eq("id", resId);

      if (error) throw error;

      setReservations((prev) =>
        prev.map((r) => (r.id === resId ? { ...r, status: newStatus } : r))
      );
    } catch (err) {
      console.error("Error updating reservation status:", err);
      alert("No se pudo actualizar la reserva.");
    }
  };

  const handleToggleProductAvailability = async (productId: string, currentAvailable: boolean) => {
    try {
      const { error } = await supabase
        .from("products")
        .update({ is_available: !currentAvailable })
        .eq("id", productId);

      if (error) throw error;

      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, is_available: !currentAvailable } : p))
      );
    } catch (err) {
      console.error("Error toggling product:", err);
      alert("No se pudo cambiar la disponibilidad del producto.");
    }
  };

  // Metric Computations
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
      <div className="min-h-screen bg-[#14231D] flex items-center justify-center flex-col gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#D4AF37]" />
        <p className="text-[#FAF8F5]/70 text-xs font-semibold tracking-widest uppercase">Cargando Panel Ejecutivo...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-800 pb-16 font-sans">
      
      {/* Corporate Dark Header */}
      <header className="bg-[#14231D] text-[#FAF8F5] sticky top-0 z-30 shadow-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-4">
            <img
              src="/flor-retablo.png"
              alt="Las Flores"
              className="h-10 w-auto object-contain drop-shadow"
            />
            <div className="h-6 w-px bg-white/15 hidden sm:block" />
            <div>
              <h1 className="text-lg font-bold tracking-tight text-[#FAF8F5] flex items-center gap-2">
                Restaurante Las Flores
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono flex items-center gap-1.5 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  REALTIME ACTIVO
                </span>
              </h1>
              <p className="text-[11px] text-[#FAF8F5]/60 font-medium">Panel de Administración y Control Gerencial</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-1.5 bg-white/10 text-cream/90 text-xs font-semibold px-3 py-1.5 rounded-xl border border-white/10">
              <ShieldCheck size={14} className="text-[#D4AF37]" />
              <span>Rol: Administrador</span>
            </div>

            <button
              onClick={fetchData}
              disabled={refreshing}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#FAF8F5] transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Sincronizar datos"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Sincronizar</span>
            </button>

            <button
              onClick={() => { window.location.href = "/restaurante"; }}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#FAF8F5] text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">Ver Web</span>
            </button>

            <button
              onClick={handleSignOut}
              className="px-3 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* KPI Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          
          {/* Total Sales Card */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md transition-all border-t-4 border-t-emerald-600">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Facturación Acumulada</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <DollarSign size={18} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-gray-900">S/ {totalSales.toFixed(2)}</span>
              <p className="text-[11px] text-emerald-700 mt-1 font-medium flex items-center gap-1">
                <TrendingUp size={12} /> Ordenes confirmadas
              </p>
            </div>
          </div>

          {/* Active Orders Card */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md transition-all border-t-4 border-t-blue-600">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Pedidos en Proceso</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <ShoppingBag size={18} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-gray-900">{activeOrdersCount}</span>
              <p className="text-[11px] text-blue-700 mt-1 font-medium flex items-center gap-1">
                <Clock size={12} /> Despacho o entrega pendiente
              </p>
            </div>
          </div>

          {/* Pending Reservations Card */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md transition-all border-t-4 border-t-amber-500">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Reservas Pendientes</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <Calendar size={18} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-gray-900">{pendingReservationsCount}</span>
              <p className="text-[11px] text-amber-700 mt-1 font-medium flex items-center gap-1">
                <UserCheck size={12} /> Por confirmar horario
              </p>
            </div>
          </div>

          {/* Available Dishes Card */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md transition-all border-t-4 border-t-purple-600">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Carta Activa</span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                <UtensilsCrossed size={18} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-gray-900">{availableProductsCount} / {products.length}</span>
              <p className="text-[11px] text-purple-700 mt-1 font-medium flex items-center gap-1">
                <CheckCircle2 size={12} /> Platos disponibles en carta
              </p>
            </div>
          </div>

        </div>

        {/* Executive Tab Navigation Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6 bg-white p-2.5 rounded-2xl border border-gray-200 shadow-sm">
          
          <div className="flex items-center gap-2 overflow-x-auto p-1">
            
            {/* BI Tab - FIRST & DEFAULT */}
            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === "analytics"
                  ? "bg-[#14231D] text-[#FAF8F5] shadow-md border border-[#14231D]"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/80"
              }`}
            >
              <BarChart3 size={16} className={activeTab === "analytics" ? "text-[#D4AF37]" : "text-gray-500"} />
              Analítica & Business Intelligence
            </button>

            {/* Pedidos Tab */}
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === "orders"
                  ? "bg-[#14231D] text-[#FAF8F5] shadow-md border border-[#14231D]"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/80"
              }`}
            >
              <ShoppingBag size={16} className={activeTab === "orders" ? "text-[#D4AF37]" : "text-gray-500"} />
              Gestión de Pedidos
              <span className={`px-2 py-0.5 text-[10px] rounded-full font-extrabold ${
                activeTab === "orders" ? "bg-white/20 text-[#FAF8F5]" : "bg-gray-100 text-gray-700"
              }`}>
                {orders.length}
              </span>
            </button>

            {/* Reservas Tab */}
            <button
              onClick={() => setActiveTab("reservations")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === "reservations"
                  ? "bg-[#14231D] text-[#FAF8F5] shadow-md border border-[#14231D]"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/80"
              }`}
            >
              <Calendar size={16} className={activeTab === "reservations" ? "text-[#D4AF37]" : "text-gray-500"} />
              Control de Reservas
              <span className={`px-2 py-0.5 text-[10px] rounded-full font-extrabold ${
                activeTab === "reservations" ? "bg-white/20 text-[#FAF8F5]" : "bg-gray-100 text-gray-700"
              }`}>
                {reservations.length}
              </span>
            </button>

            {/* Carta Tab */}
            <button
              onClick={() => setActiveTab("menu")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === "menu"
                  ? "bg-[#14231D] text-[#FAF8F5] shadow-md border border-[#14231D]"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/80"
              }`}
            >
              <MenuIcon size={16} className={activeTab === "menu" ? "text-[#D4AF37]" : "text-gray-500"} />
              Gestión de Carta
              <span className={`px-2 py-0.5 text-[10px] rounded-full font-extrabold ${
                activeTab === "menu" ? "bg-white/20 text-[#FAF8F5]" : "bg-gray-100 text-gray-700"
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
              className="px-4 py-2 rounded-xl bg-[#14231D] hover:bg-[#1E322A] text-[#FAF8F5] text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Plus size={15} />
              Nuevo Plato
            </button>
          )}

        </div>

        {/* Tab Content Panels */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
          
          {/* ================= BI ANALYTICS TAB (DEFAULT) ================= */}
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
              {/* Filter Toolbar */}
              <div className="p-4 bg-gray-50/70 border-b border-gray-200/80 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-80">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={resSearch}
                    onChange={(e) => setResSearch(e.target.value)}
                    placeholder="Buscar reserva por cliente o teléfono..."
                    className="w-full text-xs bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#14231D]"
                  />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Estado:</span>
                  {["all", "pending", "confirmed", "completed", "cancelled"].map((st) => (
                    <button
                      key={st}
                      onClick={() => setResStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all whitespace-nowrap ${
                        resStatusFilter === st
                          ? "bg-[#14231D] text-white shadow-sm"
                          : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {st === "all" ? "Todas" : st === "pending" ? "Pendientes" : st === "confirmed" ? "Confirmadas" : st === "completed" ? "Completadas" : "Canceladas"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-[11px] text-gray-500 uppercase tracking-wider bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-4 font-bold">Cliente</th>
                      <th className="px-6 py-4 font-bold">Fecha y Hora</th>
                      <th className="px-6 py-4 font-bold">Personas</th>
                      <th className="px-6 py-4 font-bold">Servicio</th>
                      <th className="px-6 py-4 font-bold">Estado de Reserva</th>
                      <th className="px-6 py-4 font-bold text-right">Contacto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredReservations.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                          No se encontraron reservas con los filtros aplicados.
                        </td>
                      </tr>
                    ) : (
                      filteredReservations.map((res) => {
                        const rawPhone = res.client_phone ? res.client_phone.replace(/\D/g, "") : "";
                        const fullPhone = rawPhone.length === 9 ? `51${rawPhone}` : rawPhone;
                        const whatsappUrl = `https://wa.me/${fullPhone}?text=Hola%20${encodeURIComponent(res.client_name)},%20te%20contactamos%20de%20Restaurante%20Las%20Flores%20sobre%20tu%20reserva%20para%20el%20dia%20${encodeURIComponent(res.reservation_date)}.`;

                        return (
                          <tr key={res.id} className="hover:bg-gray-50/80 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-bold text-gray-900">{res.client_name}</div>
                              <div className="text-gray-500">{res.client_phone || "Sin teléfono"}</div>
                              {res.client_email && <div className="text-gray-400">{res.client_email}</div>}
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-bold text-gray-800">{res.reservation_date}</div>
                              <div className="text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                                <Clock size={12} /> {res.reservation_time}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                {res.guest_count} {res.guest_count === 1 ? "persona" : "personas"}
                              </span>
                            </td>
                            <td className="px-6 py-4 capitalize font-semibold text-gray-700">
                              {res.service_type || "Almuerzo"}
                            </td>
                            <td className="px-6 py-4">
                              <select
                                value={res.status || "pending"}
                                onChange={(e) => handleUpdateReservationStatus(res.id, e.target.value)}
                                className={`font-bold rounded-lg px-3 py-1.5 border shadow-sm focus:outline-none transition-colors ${
                                  res.status === 'confirmed' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                                  res.status === 'pending' ? 'bg-amber-50 text-amber-800 border-amber-300' :
                                  res.status === 'completed' ? 'bg-blue-50 text-blue-800 border-blue-300' :
                                  'bg-red-50 text-red-800 border-red-300'
                                }`}
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
                                  className="inline-flex items-center gap-1 px-3 py-1.5 font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
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
              {/* Filter Toolbar */}
              <div className="p-4 bg-gray-50/70 border-b border-gray-200/80 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-80">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Buscar pedido #, cliente o teléfono..."
                    className="w-full text-xs bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#14231D]"
                  />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Estado:</span>
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
                          : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-[11px] text-gray-500 uppercase tracking-wider bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-4 font-bold">N° Orden</th>
                      <th className="px-6 py-4 font-bold">Cliente</th>
                      <th className="px-6 py-4 font-bold">Modalidad</th>
                      <th className="px-6 py-4 font-bold">Total</th>
                      <th className="px-6 py-4 font-bold">Estado del Pedido</th>
                      <th className="px-6 py-4 font-bold text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                          No hay pedidos que coincidan con la búsqueda.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-black text-gray-900 text-sm">#{ord.order_number}</div>
                            <div className="text-gray-400">
                              {new Date(ord.created_at).toLocaleDateString()} - {new Date(ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-gray-900">{ord.client_name || "Anónimo"}</div>
                            <div className="text-gray-500">{ord.client_phone || "Sin teléfono"}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-lg font-bold border ${
                              ord.order_type === 'delivery'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-purple-50 text-purple-700 border-purple-200'
                            }`}>
                              {ord.order_type === 'delivery' ? 'Delivery' : 'Recojo'}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-black text-emerald-800 text-sm">
                            S/ {Number(ord.total).toFixed(2)}
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={ord.status || "received"}
                              onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                              className={`font-bold rounded-lg px-3 py-1.5 border shadow-sm focus:outline-none transition-colors ${
                                ord.status === 'received' ? 'bg-amber-50 text-amber-800 border-amber-300' :
                                ord.status === 'preparing' ? 'bg-blue-50 text-blue-800 border-blue-300' :
                                ord.status === 'on_the_way' ? 'bg-purple-50 text-purple-800 border-purple-300' :
                                ord.status === 'delivered' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                                'bg-red-50 text-red-800 border-red-300'
                              }`}
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
                              className="px-3.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold inline-flex items-center gap-1.5 transition-colors border border-gray-200"
                            >
                              <Eye size={14} /> Ver Detalle
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
              {/* Filter Toolbar */}
              <div className="p-4 bg-gray-50/70 border-b border-gray-200/80 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-80">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={menuSearch}
                    onChange={(e) => setMenuSearch(e.target.value)}
                    placeholder="Buscar plato por nombre..."
                    className="w-full text-xs bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#14231D]"
                  />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Categoría:</span>
                  <select
                    value={menuCategoryFilter}
                    onChange={(e) => setMenuCategoryFilter(e.target.value)}
                    className="text-xs font-bold bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#14231D]"
                  >
                    <option value="all">Todas las categorías ({categories.length})</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-[11px] text-gray-500 uppercase tracking-wider bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-4 font-bold w-24">Imagen</th>
                      <th className="px-6 py-4 font-bold">Producto</th>
                      <th className="px-6 py-4 font-bold">Categoría</th>
                      <th className="px-6 py-4 font-bold">Precio</th>
                      <th className="px-6 py-4 font-bold">Disponibilidad</th>
                      <th className="px-6 py-4 font-bold text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                          No se encontraron platos en la carta.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((prod) => (
                        <tr key={prod.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="px-6 py-4">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm shrink-0">
                              {prod.image_url ? (
                                <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <UtensilsCrossed size={18} />
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-gray-900 text-sm">{prod.name}</div>
                            {prod.description && (
                              <p className="text-gray-500 line-clamp-1 max-w-xs">{prod.description}</p>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 bg-gray-100 text-gray-700 font-bold rounded-lg">
                              {prod.categories?.name || "Sin categoría"}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-black text-emerald-800 text-sm">
                            S/ {Number(prod.price).toFixed(2)}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleToggleProductAvailability(prod.id, prod.is_available)}
                              className={`px-3 py-1 rounded-full font-bold flex items-center gap-1.5 transition-all ${
                                prod.is_available
                                  ? "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300"
                                  : "bg-red-50 text-red-800 hover:bg-red-100 border border-red-300"
                              }`}
                            >
                              <span className={`w-2 h-2 rounded-full ${prod.is_available ? "bg-emerald-600" : "bg-red-600"}`} />
                              {prod.is_available ? "Disponible" : "Agotado"}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedProduct(prod);
                                setIsProductModalOpen(true);
                              }}
                              className="px-3.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold inline-flex items-center gap-1.5 transition-colors border border-gray-200"
                            >
                              <Edit2 size={13} /> Editar
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
