import { useState, useEffect, useRef } from "react";
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
  User as UserIcon,
  Phone,
  Check,
  Edit3,
  Save,
} from "lucide-react";
import {
  supabase,
  signOut,
  getUserOrders,
  getUserReservations,
  updateUserProfile,
} from "../lib/supabase";
import type { User } from "@supabase/supabase-js";

interface CustomerHistoryModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
}

const MONTHS = [
  { value: "01", label: "Enero" },
  { value: "02", label: "Febrero" },
  { value: "03", label: "Marzo" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Mayo" },
  { value: "06", label: "Junio" },
  { value: "07", label: "Julio" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Setiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
];

const DAYS = Array.from({ length: 31 }, (_, i) => {
  const d = i + 1;
  return { value: d < 10 ? `0${d}` : `${d}`, label: `${d}` };
});

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 80 }, (_, i) => {
  const y = currentYear - 6 - i;
  return { value: `${y}`, label: `${y}` };
});

export function CustomerHistoryModal({ open, onClose, user }: CustomerHistoryModalProps) {
  const [activeTab, setActiveTab] = useState<"orders" | "reservations" | "profile">("orders");
  const [orders, setOrders] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const loadedUserIdRef = useRef<string | null>(null);

  // Estado para edición de perfil
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileBirthDate, setProfileBirthDate] = useState("");
  const [initialName, setInitialName] = useState("");
  const [initialPhone, setInitialPhone] = useState("");
  const [initialBirthDate, setInitialBirthDate] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      const nameVal = user.user_metadata?.full_name || user.user_metadata?.name || "";
      const phoneVal = user.user_metadata?.phone !== undefined && user.user_metadata?.phone !== null
        ? String(user.user_metadata.phone)
        : String(user.phone || "");
      const dateVal = user.user_metadata?.birth_date || "";

      setProfileName(nameVal);
      setInitialName(nameVal);

      setProfilePhone(phoneVal);
      setInitialPhone(phoneVal);

      setProfileBirthDate(dateVal);
      setInitialBirthDate(dateVal);

      if (dateVal) {
        const parts = dateVal.split("-");
        if (parts.length === 3) {
          setBirthYear(parts[0]);
          setBirthMonth(parts[1]);
          setBirthDay(parts[2]);
        }
      }
    }
  }, [user]);

  const hasChanges =
    activeTab === "profile" &&
    (profileName.trim() !== initialName.trim() ||
      profilePhone.trim() !== initialPhone.trim() ||
      profileBirthDate !== initialBirthDate);

  const handleDateChange = (d: string, m: string, y: string) => {
    setBirthDay(d);
    setBirthMonth(m);
    setBirthYear(y);
    if (d && m && y) {
      setProfileBirthDate(`${y}-${m}-${d}`);
    } else {
      setProfileBirthDate("");
    }
  };

  useEffect(() => {
    let cancelled = false;

    if (open && user?.id) {
      // Si cambió de usuario, limpiar datos anteriores
      if (loadedUserIdRef.current !== user.id) {
        setOrders([]);
        setReservations([]);
        loadedUserIdRef.current = user.id;
      }

      const fetchHistory = async () => {
        setLoading(true);
        try {
          const [userOrders, userRes] = await Promise.all([
            getUserOrders(user.id, user.email),
            getUserReservations(user.id, user.email),
          ]);
          if (!cancelled) {
            setOrders(userOrders);
            setReservations(userRes);
          }
        } catch (e) {
          console.error("Error al cargar historial:", e);
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

      fetchHistory();
    }

    return () => {
      cancelled = true;
    };
  }, [open, user?.id, user?.email]);

  const handleSignOut = async () => {
    try {
      await signOut();
      onClose();
    } catch (e) {
      console.error("Error al cerrar sesión:", e);
    }
  };

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingProfile(true);
    setProfileMessage(null);

    const nameToSave = profileName.trim();
    const phoneToSave = profilePhone.trim();
    const dateToSave = profileBirthDate;

    try {
      const updated = await updateUserProfile({
        full_name: nameToSave,
        phone: phoneToSave,
        birth_date: dateToSave,
      });

      // Actualizar valores iniciales para desactivar el modo edición y volver a 'Aceptar'
      setInitialName(nameToSave);
      setInitialPhone(phoneToSave);
      setInitialBirthDate(dateToSave);

      setProfileMessage({
        type: "success",
        text: "¡Perfil actualizado con éxito!",
      });

      // Disparar evento global para sincronizar en toda la aplicación
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("supabase_auth_changed", { detail: updated?.user })
        );
      }
    } catch (err: any) {
      console.error("Error al actualizar perfil:", err);
      setProfileMessage({
        type: "error",
        text: err?.message || "No se pudo actualizar el perfil. Inténtalo de nuevo.",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCloseOrAccept = async () => {
    if (hasChanges) {
      await handleSaveProfile();
    }
    onClose();
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
      <div className="absolute inset-0 bg-ink/75 backdrop-blur-sm" onClick={handleCloseOrAccept} />

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
            onClick={handleCloseOrAccept}
            className="w-9 h-9 rounded-full bg-black/5 hover:bg-black/10 text-black/70 flex items-center justify-center transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Pestañas de Historial y Perfil */}
        <div className="flex border-b border-black/5 bg-white/50 px-3 pt-3 gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 text-[11px] font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
              activeTab === "orders"
                ? "border-eucalipto text-eucalipto bg-white shadow-xs"
                : "border-transparent text-black/50 hover:text-black/80"
            }`}
          >
            <ShoppingBag size={14} />
            <span>Pedidos ({orders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("reservations")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 text-[11px] font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
              activeTab === "reservations"
                ? "border-eucalipto text-eucalipto bg-white shadow-xs"
                : "border-transparent text-black/50 hover:text-black/80"
            }`}
          >
            <Calendar size={14} />
            <span>Reservas ({reservations.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 text-[11px] font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
              activeTab === "profile"
                ? "border-eucalipto text-eucalipto bg-white shadow-xs"
                : "border-transparent text-black/50 hover:text-black/80"
            }`}
          >
            <UserIcon size={14} />
            <span>Mi Perfil</span>
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
          ) : activeTab === "reservations" ? (
            /* --- TABLA / LISTA DE RESERVAS --- */
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
            )
          ) : (
            /* --- FORMULARIO EDITAR PERFIL DE USUARIO --- */
            <form onSubmit={handleSaveProfile} className="space-y-4 py-1">
              <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-black/5 pb-3">
                  <h4 className="font-serif font-bold text-base text-ink flex items-center gap-2">
                    <UserIcon size={18} className="text-eucalipto" />
                    <span>Datos del Cliente</span>
                  </h4>
                  <span className="text-[10px] text-eucalipto font-bold bg-eucalipto/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Información Oficial
                  </span>
                </div>

                <p className="text-xs text-black/60 leading-relaxed">
                  Completa tu información para agilizar tus pedidos y reservas. Usamos estos datos únicamente para atención al cliente y sorpresas especiales.
                </p>

                {profileMessage && (
                  <div
                    className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                      profileMessage.type === "success"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                  >
                    {profileMessage.type === "success" && <Check size={16} />}
                    <span>{profileMessage.text}</span>
                  </div>
                )}

                {/* Nombre Completo */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-black/70 mb-1">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Ej: Luis Llocclla"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 text-xs focus:outline-none focus:ring-2 focus:ring-eucalipto/30 focus:border-eucalipto bg-white font-medium text-ink"
                  />
                </div>

                {/* Teléfono / WhatsApp */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-black/70 mb-1">
                    Teléfono / WhatsApp de Contacto
                  </label>
                  <input
                    type="tel"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    placeholder="Ej: 987654321"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 text-xs focus:outline-none focus:ring-2 focus:ring-eucalipto/30 focus:border-eucalipto bg-white font-medium text-ink"
                  />
                  <span className="text-[10px] text-black/45 mt-1 block">
                    Para enviarte confirmaciones de reserva o actualizaciones de delivery.
                  </span>
                </div>

                {/* Fecha de Nacimiento con 3 Dropdowns ultra fáciles */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-black/70 mb-1">
                    Fecha de Nacimiento
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {/* Día */}
                    <select
                      value={birthDay}
                      onChange={(e) => handleDateChange(e.target.value, birthMonth, birthYear)}
                      className="w-full px-2.5 py-2.5 rounded-xl border border-black/15 text-xs focus:outline-none focus:ring-2 focus:ring-eucalipto/30 focus:border-eucalipto bg-white font-medium text-ink cursor-pointer"
                    >
                      <option value="">Día</option>
                      {DAYS.map((d) => (
                        <option key={d.value} value={d.value}>
                          {d.label}
                        </option>
                      ))}
                    </select>

                    {/* Mes */}
                    <select
                      value={birthMonth}
                      onChange={(e) => handleDateChange(birthDay, e.target.value, birthYear)}
                      className="w-full px-2.5 py-2.5 rounded-xl border border-black/15 text-xs focus:outline-none focus:ring-2 focus:ring-eucalipto/30 focus:border-eucalipto bg-white font-medium text-ink cursor-pointer"
                    >
                      <option value="">Mes</option>
                      {MONTHS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>

                    {/* Año */}
                    <select
                      value={birthYear}
                      onChange={(e) => handleDateChange(birthDay, birthMonth, e.target.value)}
                      className="w-full px-2.5 py-2.5 rounded-xl border border-black/15 text-xs focus:outline-none focus:ring-2 focus:ring-eucalipto/30 focus:border-eucalipto bg-white font-medium text-ink cursor-pointer"
                    >
                      <option value="">Año</option>
                      {YEARS.map((y) => (
                        <option key={y.value} value={y.value}>
                          {y.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <span className="text-[10px] text-eucalipto font-medium mt-1.5 block">
                    ¡Te prepararemos una cortesía especial en el día de tu cumpleaños!
                  </span>
                </div>

                {/* Correo Electrónico (No editable) */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-black/45 mb-1">
                    Correo Electrónico (Asociado a tu cuenta)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user.email || ""}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 text-xs bg-black/5 text-black/50 cursor-not-allowed font-medium"
                  />
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer con opción de cerrar sesión y acción dinámicas (Aceptar / Guardar Cambios) */}
        <div className="p-4 bg-white border-t border-black/5 flex items-center justify-between">
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-2 py-2.5 px-4 rounded-xl border border-red-200 text-red-700 bg-red-50/50 hover:bg-red-100/70 text-xs font-bold uppercase tracking-wider transition-all shadow-xs"
          >
            <LogOut size={14} />
            <span>Cerrar sesión</span>
          </button>

          {hasChanges ? (
            <button
              type="button"
              onClick={() => handleSaveProfile()}
              disabled={savingProfile}
              className="py-2.5 px-5 rounded-xl bg-eucalipto text-cream text-xs font-bold uppercase tracking-wider hover:bg-eucalipto/90 transition-all shadow-xs flex items-center gap-2 disabled:opacity-50"
            >
              {savingProfile ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Check size={14} />
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-5 rounded-xl bg-eucalipto text-cream text-xs font-bold uppercase tracking-wider hover:bg-eucalipto/90 transition-all shadow-xs"
            >
              Aceptar
            </button>
          )}
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
