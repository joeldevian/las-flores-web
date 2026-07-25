import { useState, useEffect } from "react";
import {
  ShoppingBag,
  Calendar,
  X,
  Clock,
  MapPin,
  Users,
  UtensilsCrossed,
  RefreshCw,
  LogOut,
} from "lucide-react";
import {
  supabase,
  signOut,
  getUserOrders,
  getUserReservations,
} from "../lib/supabase";
import type { User } from "@supabase/supabase-js";

interface CustomerHistoryModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
}

export function CustomerHistoryModal({ open, onClose, user }: CustomerHistoryModalProps) {
  const [activeTab, setActiveTab] = useState<"orders" | "reservations">("orders");
  const [orders, setOrders] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && user) {
      loadHistory();
    }
  }, [open, user]);

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
      onClose();
    } catch (e) {
      console.error("Error al cerrar sesión:", e);
    }
  };

  if (!open || !user) return null;

  const fullName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Cliente";

  const firstName = fullName.split(" ")[0];
  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-300">
      {/* Fondo oscuro con blur */}
      <div className="absolute inset-0 bg-ink/75 backdrop-blur-sm" onClick={onClose} />

      {/* Modal flotante central */}
      <div className="relative z-10 w-full max-w-lg bg-[#FBF5E6] text-ink rounded-3xl shadow-2xl overflow-hidden border border-black/10 flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-200">
        {/* Header del Modal */}
        <div className="p-5 md:p-6 bg-white border-b border-black/5 flex items-center justify-between shadow-xs">
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
              <p className="text-xs text-black/50 truncate max-w-[220px]">{user.email}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-black/5 hover:bg-black/10 text-black/70 flex items-center justify-center transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Pestañas de Historial */}
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

        {/* Contenido de Historial */}
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
                  Aún no tienes pedidos registrados
                </h4>
                <p className="text-xs text-black/50 leading-relaxed">
                  Realiza tu primer pedido desde nuestra carta digital y lo verás reflejado aquí.
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
        <div className="p-4 bg-white border-t border-black/5 flex items-center justify-between">
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-2 py-2.5 px-4 rounded-xl border border-red-200 text-red-700 bg-red-50/50 hover:bg-red-100/70 text-xs font-bold uppercase tracking-wider transition-all shadow-xs"
          >
            <LogOut size={14} />
            <span>Cerrar sesión</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-5 rounded-xl bg-eucalipto text-cream text-xs font-bold uppercase tracking-wider hover:bg-eucalipto/90 transition-all shadow-xs"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}

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
