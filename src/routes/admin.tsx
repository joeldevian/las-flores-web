import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase, signOut } from "../lib/supabase";
import { Calendar, ShoppingBag, LogOut, Loader2, ArrowLeft, UtensilsCrossed, Menu } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminRoute,
});

function AdminRoute() {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<"reservations" | "orders" | "menu">("reservations");
  
  // Data states
  const [reservations, setReservations] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    checkAuth();
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
      fetchData();
    } catch (error) {
      console.error("Error checking auth:", error);
      window.location.href = "/restaurante";
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    // Fetch reservations
    const { data: resData } = await supabase
      .from("reservations")
      .select("*")
      .order("reservation_date", { ascending: false });
    
    if (resData) setReservations(resData);

    // Fetch orders
    const { data: ordData } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
      
    if (ordData) setOrders(ordData);

    // Fetch products
    const { data: prodData } = await supabase
      .from("products")
      .select("*, categories(name)")
      .order("category_id", { ascending: true })
      .order("sort_order", { ascending: true });
      
    if (prodData) setProducts(prodData);
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/restaurante";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-eucalipto" />
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Will redirect automatically
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      {/* Admin Header */}
      <header className="bg-eucalipto text-cream py-4 shadow-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UtensilsCrossed className="w-6 h-6 text-retama" />
            <h1 className="text-xl font-bold tracking-wide">Las Flores Admin</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => { window.location.href = "/restaurante"; }}
              className="text-cream/80 hover:text-cream flex items-center gap-2 text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Ver Web
            </button>
            <button 
              onClick={handleSignOut}
              className="bg-white/10 hover:bg-white/20 text-cream px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Tabs */}
        <div className="flex space-x-1 border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab("reservations")}
            className={`flex items-center gap-2 py-3 px-6 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "reservations"
                ? "border-eucalipto text-eucalipto bg-white"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            } rounded-t-lg`}
          >
            <Calendar className="w-4 h-4" />
            Reservas ({reservations.length})
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 py-3 px-6 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "orders"
                ? "border-eucalipto text-eucalipto bg-white"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            } rounded-t-lg`}
          >
            <ShoppingBag className="w-4 h-4" />
            Pedidos Delivery/Recojo ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("menu")}
            className={`flex items-center gap-2 py-3 px-6 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "menu"
                ? "border-eucalipto text-eucalipto bg-white"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            } rounded-t-lg`}
          >
            <Menu className="w-4 h-4" />
            Carta ({products.length})
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          
          {activeTab === "reservations" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Cliente</th>
                    <th className="px-6 py-4 font-semibold">Fecha y Hora</th>
                    <th className="px-6 py-4 font-semibold">Personas</th>
                    <th className="px-6 py-4 font-semibold">Servicio</th>
                    <th className="px-6 py-4 font-semibold">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No hay reservas registradas
                      </td>
                    </tr>
                  ) : (
                    reservations.map((res) => (
                      <tr key={res.id} className="border-b hover:bg-gray-50/50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{res.client_name}</div>
                          <div className="text-gray-500 text-xs">{res.client_email}</div>
                          <div className="text-gray-500 text-xs">{res.client_phone}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium">{res.reservation_date}</div>
                          <div className="text-gray-500">{res.reservation_time}</div>
                        </td>
                        <td className="px-6 py-4 font-medium">
                          {res.guest_count} {res.guest_count === 1 ? 'persona' : 'personas'}
                        </td>
                        <td className="px-6 py-4 capitalize">
                          {res.service_type}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            res.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            res.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            res.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {res.status === 'confirmed' ? 'Confirmada' :
                             res.status === 'pending' ? 'Pendiente' :
                             res.status === 'cancelled' ? 'Cancelada' :
                             res.status === 'completed' ? 'Completada' : res.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Orden</th>
                    <th className="px-6 py-4 font-semibold">Cliente</th>
                    <th className="px-6 py-4 font-semibold">Tipo</th>
                    <th className="px-6 py-4 font-semibold">Total</th>
                    <th className="px-6 py-4 font-semibold">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No hay pedidos registrados
                      </td>
                    </tr>
                  ) : (
                    orders.map((ord) => (
                      <tr key={ord.id} className="border-b hover:bg-gray-50/50">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">#{ord.order_number}</div>
                          <div className="text-gray-400 text-xs">
                            {new Date(ord.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{ord.client_name}</div>
                          <div className="text-gray-500 text-xs">{ord.client_phone}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                            ord.order_type === 'delivery' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}>
                            {ord.order_type === 'delivery' ? 'Delivery' : 'Recojo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-eucalipto">
                          S/ {Number(ord.total).toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            ord.status === 'received' ? 'bg-yellow-100 text-yellow-800' :
                            ord.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                            ord.status === 'on_the_way' ? 'bg-orange-100 text-orange-800' :
                            ord.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {ord.status === 'received' ? 'Recibido' :
                             ord.status === 'preparing' ? 'Preparando' :
                             ord.status === 'on_the_way' ? 'En camino' :
                             ord.status === 'delivered' ? 'Entregado' :
                             ord.status === 'cancelled' ? 'Cancelado' : ord.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "menu" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 font-semibold w-24">Imagen</th>
                    <th className="px-6 py-4 font-semibold">Producto</th>
                    <th className="px-6 py-4 font-semibold">Categoría</th>
                    <th className="px-6 py-4 font-semibold">Precio</th>
                    <th className="px-6 py-4 font-semibold">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No hay productos en la carta
                      </td>
                    </tr>
                  ) : (
                    products.map((prod) => (
                      <tr key={prod.id} className="border-b hover:bg-gray-50/50">
                        <td className="px-6 py-4">
                          <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100">
                            {prod.image_url ? (
                              <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <UtensilsCrossed size={20} />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{prod.name}</div>
                          {prod.description && (
                            <div className="text-gray-500 text-xs line-clamp-2 w-64">{prod.description}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-600">
                          {prod.categories?.name || 'Sin categoría'}
                        </td>
                        <td className="px-6 py-4 font-bold text-eucalipto">
                          S/ {Number(prod.price).toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            prod.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {prod.is_available ? 'Disponible' : 'Agotado'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
          
        </div>
      </main>
    </div>
  );
}
