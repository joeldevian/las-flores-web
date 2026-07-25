import { useState, useEffect } from "react";
import {
  User as UserIcon,
  LogOut,
  ShoppingBag,
  Calendar,
  X,
  Clock,
  MapPin,
  Users,
  UtensilsCrossed,
  RefreshCw,
  LogIn,
} from "lucide-react";
import {
  supabase,
  signInWithGoogle,
  signOut,
  getUserOrders,
  getUserReservations,
} from "../lib/supabase";
import type { User } from "@supabase/supabase-js";

interface UserAccountMenuProps {
  /** Variante para adaptarse a barras transparentes/oscuras o claras */
  variant?: "nav-transparent" | "nav-cream" | "floating";
}

export function UserAccountMenu({ variant = "nav-cream" }: UserAccountMenuProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"orders" | "reservations">("orders");
  const [orders, setOrders] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar sesión inicial y escuchar cambios en la autenticación
  useEffect(() => {
    const fetchSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };

    fetchSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    const handleFocus = () => fetchSession();
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === "SUPABASE_AUTH_SUCCESS") {
        fetchSession();
      }
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("message", handleMessage);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  // Cargar el historial de pedidos y reservas cuando el modal está abierto y el usuario autenticado
  useEffect(() => {
    if (isOpen && user) {
      loadHistory();
    }
  }, [isOpen, user]);

  const loadHistory = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [userOrders, userRes] = await Promise.all([
        getUserOrders(user.id, user.email),
        getUserReservations(user.id, user.email),
      ]);
      setOrders(userOrders);
      setReservations(userRes);
    } catch (e) {
      console.error("Error al cargar historial:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      setIsOpen(false);
    } catch (e) {
      console.error("Error al cerrar sesión:", e);
    }
  };

  // Datos del usuario
  const fullName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Cliente";

  const firstName = fullName.split(" ")[0];
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  // Estilos según la variante del nav
  const isDarkNav = variant === "nav-transparent";

  return (
    <>
      {/* --- BOTÓN DE USUARIO MINIMALISTA TIPO ÍCONO / AVATAR CIRCULAR --- */}
      {!user ? (
        <button
          type="button"
          aria-label="Iniciar sesión"
          title="Iniciar sesión"
          onClick={async () => {
            try {
              await signInWithGoogle();
            } catch (err) {
              console.error("Google Auth error:", err);
            }
          }}
          className={`w-8 h-8 md:w-9 md:h-9 rounded-full border flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 shadow-xs ${
            isDarkNav
              ? "bg-white/10 border-white/30 text-cream hover:bg-white/20 hover:border-cream"
              : "bg-white/90 border-black/15 text-eucalipto hover:bg-white hover:border-eucalipto hover:shadow-md"
          }`}
        >
          <UserIcon size={16} />
        </button>
      ) : (
        <button
          type="button"
          aria-label={`Mi Cuenta (${firstName})`}
          title={`Hola, ${firstName}`}
          onClick={() => setIsOpen(true)}
          className={`relative w-8 h-8 md:w-9 md:h-9 rounded-full border flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 shadow-xs ${
            isDarkNav
              ? "bg-white/15 border-white/30 text-cream"
              : "bg-white border-eucalipto/30 text-eucalipto hover:shadow-md"
          }`}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={firstName}
              className="w-full h-full rounded-full object-cover p-0.5"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-eucalipto text-cream flex items-center justify-center font-serif text-xs font-bold">
              {firstName.charAt(0).toUpperCase()}
            </div>
          )}
          {/* Indicador de conexión verde */}
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
        </button>
      )}

      {/* --- PANEL / DRAWER FLOTANTE DE HISTORIAL Y BIENVENIDA --- */}
      {isOpen && user && (
        <div className="fixed inset-0 z-[100] flex justify-end animate-in fade-in duration-300">
          {/* Fondo oscuro con blur */}
          <div
            className="absolute inset-0 bg-ink/60 backdrop-blur-xs"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel Lateral */}
          <div className="relative z-10 w-full max-w-md bg-[#FBF5E6] text-ink h-full shadow-2xl flex flex-col overflow-hidden border-l border-black/10 animate-in slide-in-from-right duration-400">
            {/* Header del Panel */}
            <div className="p-6 bg-white border-b border-black/5 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3.5">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={fullName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-eucalipto/20 shadow-xs"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-eucalipto text-cream flex items-center justify-center text-lg font-serif font-bold shadow-xs">
                    {firstName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-eucalipto block mb-0.5">
                    Cliente Preferencial
                  </span>
                  <h3 className="font-serif font-bold text-xl text-ink leading-none mb-1">
                    ¡Hola, {firstName}!
                  </h3>
                  <p className="text-xs text-black/50 truncate max-w-[200px]">{user.email}</p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-9 h-9 rounded-full bg-black/5 hover:bg-black/10 text-black/70 flex items-center justify-center transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Pestañas: Mis Pedidos / Mis Reservas */}
            <div className="flex border-b border-black/5 bg-white/50 px-4 pt-3 gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("orders")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 ${
                  activeTab === "orders"
                    ? "border-eucalipto text-eucalipto bg-white shadow-xs"
                    : "border-transparent text-black/50 hover:text-black/80"
                }`}
              >
                <ShoppingBag size={15} />
                <span>Mis Pedidos ({orders.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("reservations")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 ${
                  activeTab === "reservations"
                    ? "border-eucalipto text-eucalipto bg-white shadow-xs"
                    : "border-transparent text-black/50 hover:text-black/80"
                }`}
              >
                <Calendar size={15} />
                <span>Mis Reservas ({reservations.length})</span>
              </button>
            </div>

            {/* Contenido de las Pestañas */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {loading ? (
                <div className="py-16 text-center space-y-3">
                  <RefreshCw size={24} className="animate-spin text-eucalipto mx-auto" />
                  <p className="text-xs font-bold text-black/50 uppercase tracking-widest">
                    Cargando tu historial...
                  </p>
                </div>
              ) : activeTab === "orders" ? (
                /* --- TABLA / LISTA DE PEDIDOS --- */
                orders.length === 0 ? (
                  <div className="py-16 text-center px-6 bg-white/70 rounded-2xl border border-black/5">
                    <UtensilsCrossed size={32} className="text-black/30 mx-auto mb-3" />
                    <h4 className="font-serif font-bold text-base text-ink mb-1">
                      Aún no tienes pedidos
                    </h4>
                    <p className="text-xs text-black/50 leading-relaxed">
                      Explora nuestra carta gastronómica y realiza tu primer pedido de delivery o recojo.
                    </p>
                  </div>
                ) : (
                  orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl p-4 border border-black/5 shadow-xs space-y-3 hover:border-eucalipto/30 transition-all"
                    >
                      <div className="flex items-center justify-between border-b border-black/5 pb-2.5">
                        <div>
                          <span className="font-serif font-bold text-sm text-ink block">
                            #{order.order_number}
                          </span>
                          <span className="text-[10px] text-black/45 block">
                            {new Date(order.created_at).toLocaleDateString("es-PE", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <OrderStatusBadge status={order.status} />
                      </div>

                      {/* Lista de ítems */}
                      <div className="space-y-1 text-xs text-black/75">
                        {order.order_items?.map((item: any) => (
                          <div key={item.id} className="flex justify-between">
                            <span className="truncate pr-2">
                              {item.quantity}× {item.product_name}
                            </span>
                            <span className="font-bold text-ink/90">
                              S/ {item.subtotal?.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-black/5 flex items-center justify-between text-xs">
                        <span className="text-black/55 capitalize">
                          {order.order_type === "delivery" ? "🚀 Delivery" : "🏪 Recojo en local"}
                        </span>
                        <div className="text-right">
                          <span className="text-[10px] text-black/45 block uppercase">Total</span>
                          <span className="font-serif font-bold text-sm text-eucalipto">
                            S/ {order.total?.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )
              ) : /* --- TABLA / LISTA DE RESERVAS --- */
              reservations.length === 0 ? (
                <div className="py-16 text-center px-6 bg-white/70 rounded-2xl border border-black/5">
                  <Calendar size={32} className="text-black/30 mx-auto mb-3" />
                  <h4 className="font-serif font-bold text-base text-ink mb-1">
                    No tienes reservas agendadas
                  </h4>
                  <p className="text-xs text-black/50 leading-relaxed">
                    Reserva tu mesa con anticipación para disfrutar de nuestra experiencia culinaria.
                  </p>
                </div>
              ) : (
                reservations.map((res) => (
                  <div
                    key={res.id}
                    className="bg-white rounded-2xl p-4 border border-black/5 shadow-xs space-y-3 hover:border-eucalipto/30 transition-all"
                  >
                    <div className="flex items-center justify-between border-b border-black/5 pb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-eucalipto/10 text-eucalipto flex items-center justify-center font-bold text-xs">
                          <Users size={14} />
                        </div>
                        <div>
                          <span className="font-serif font-bold text-sm text-ink block">
                            {res.guest_count} {res.guest_count === 1 ? "Comensal" : "Comensales"}
                          </span>
                          <span className="text-[10px] text-black/45 capitalize block">
                            {res.service_type}
                          </span>
                        </div>
                      </div>

                      <ReservationStatusBadge status={res.status} />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-black/75">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-eucalipto/70" />
                        <span>{res.reservation_date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={13} className="text-eucalipto/70" />
                        <span>{res.reservation_time}</span>
                      </div>
                    </div>

                    {res.table_number && (
                      <div className="p-2 bg-eucalipto/5 rounded-xl border border-eucalipto/10 text-xs font-bold text-eucalipto flex items-center gap-1.5">
                        <MapPin size={13} />
                        <span>Mesa asignada: {res.table_number}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer con opción de cerrar sesión */}
            <div className="p-4 bg-white border-t border-black/5">
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-red-200 text-red-700 bg-red-50/50 hover:bg-red-100/70 text-xs font-bold uppercase tracking-wider transition-all shadow-xs"
              >
                <LogOut size={15} />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Badges de estado para Pedidos
function OrderStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; text: string }> = {
    received: { label: "Recibido", bg: "bg-amber-100", text: "text-amber-800" },
    preparing: { label: "En preparación", bg: "bg-blue-100", text: "text-blue-800" },
    on_the_way: { label: "En camino", bg: "bg-purple-100", text: "text-purple-800" },
    delivered: { label: "Entregado", bg: "bg-emerald-100", text: "text-emerald-800" },
    cancelled: { label: "Cancelado", bg: "bg-red-100", text: "text-red-800" },
  };

  const style = map[status] || { label: status, bg: "bg-gray-100", text: "text-gray-800" };

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
}

// Badges de estado para Reservas
function ReservationStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; text: string }> = {
    confirmed: { label: "Confirmada", bg: "bg-emerald-100", text: "text-emerald-800" },
    pending: { label: "Pendiente", bg: "bg-amber-100", text: "text-amber-800" },
    completed: { label: "Completada", bg: "bg-blue-100", text: "text-blue-800" },
    cancelled: { label: "Cancelada", bg: "bg-red-100", text: "text-red-800" },
  };

  const style = map[status] || { label: status, bg: "bg-gray-100", text: "text-gray-800" };

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
}
