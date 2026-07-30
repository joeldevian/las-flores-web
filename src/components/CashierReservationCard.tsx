import { useState } from "react";
import {
  Calendar,
  Clock,
  Users,
  MessageCircle,
  CheckCircle2,
  XCircle,
  MapPin,
  Utensils,
  BellRing,
  Phone,
  Mail,
  User,
  Sparkles,
} from "lucide-react";

interface CashierReservationCardProps {
  reservation: any;
  onStatusChange: (reservationId: string, newStatus: string) => Promise<void>;
}

export function CashierReservationCard({
  reservation,
  onStatusChange,
}: CashierReservationCardProps) {
  const [updating, setUpdating] = useState(false);

  const normStatus = (reservation.status || "pending").toLowerCase().trim();
  const isConfirmed = normStatus === "confirmed" || normStatus === "confirmada";
  const isCompleted = normStatus === "completed" || normStatus === "completada" || normStatus === "asistio";
  const isCancelled = normStatus === "cancelled" || normStatus === "cancelada";

  // Formatear Fecha (YYYY-MM-DD -> DD/MM/YYYY)
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Sin fecha";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  // Comprobar si la reserva es de HOY
  const todayStr = new Date().toISOString().split("T")[0];
  const isToday = reservation.reservation_date === todayStr;

  // 1. Mensaje de Confirmación por WhatsApp
  const handleSendWhatsAppConfirmation = () => {
    const rawPhone = (reservation.client_phone || "").replace(/\D/g, "");
    const formattedPhone = rawPhone.startsWith("51") ? rawPhone : `51${rawPhone}`;

    const text = `Hola *${reservation.client_name || "Cliente"}*! 🌿
Confirmamos tu reserva en *Restaurante Las Flores*:

📅 *Fecha:* ${formatDate(reservation.reservation_date)}
⏰ *Hora:* ${reservation.reservation_time || "Por confirmar"} (${(reservation.service_type || "almuerzo").toUpperCase()})
👥 *Personas:* ${reservation.guest_count || 1} personas
${reservation.zone_id ? `📍 *Zona:* ${reservation.zone_id}` : ""}
${reservation.notes ? `📝 *Nota:* ${reservation.notes}` : ""}

¡Te esperamos para brindarte la mejor experiencia gastronómica de Ayacucho! 🌺`;

    const encodedText = encodeURIComponent(text);
    const url = `https://wa.me/${formattedPhone}?text=${encodedText}`;
    window.open(url, "_blank");
  };

  // 2. Mensaje de Recordatorio de Hoy por WhatsApp
  const handleSendWhatsAppReminder = () => {
    const rawPhone = (reservation.client_phone || "").replace(/\D/g, "");
    const formattedPhone = rawPhone.startsWith("51") ? rawPhone : `51${rawPhone}`;

    const text = `¡Hola *${reservation.client_name || "Cliente"}*! 🌸
Te recordamos que *HOY* tienes una reserva en *Restaurante Las Flores*:

⏰ *Hora:* ${reservation.reservation_time || "Por confirmar"} (${(reservation.service_type || "almuerzo").toUpperCase()})
👥 *Personas:* ${reservation.guest_count || 1} personas
${reservation.zone_id ? `📍 *Zona:* ${reservation.zone_id}` : ""}

Si deseas realizar algún ajuste en tu reserva, no dudes en escribirnos por aquí. ¡Te esperamos! ✨`;

    const encodedText = encodeURIComponent(text);
    const url = `https://wa.me/${formattedPhone}?text=${encodedText}`;
    window.open(url, "_blank");
  };

  const handleUpdateStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      await onStatusChange(reservation.id, newStatus);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div
      className={`bg-white rounded-2xl overflow-hidden border transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between ${
        isToday ? "border-emerald-500/60 ring-2 ring-emerald-500/20" : "border-gray-200"
      }`}
    >
      {/* Header Verde Eucalipto para Reservas */}
      <div className="bg-emerald-900 text-white p-4 flex items-center justify-between relative overflow-hidden">
        <div className="flex items-center gap-2.5 z-10">
          <div className="w-9 h-9 rounded-xl bg-emerald-800/80 border border-emerald-700/50 flex items-center justify-center text-emerald-300 font-bold shrink-0">
            <Calendar size={18} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300 flex items-center gap-1">
              {isToday ? (
                <span className="bg-emerald-400 text-emerald-950 px-2 py-0.5 rounded-full font-black animate-pulse">
                  🌿 HOY
                </span>
              ) : (
                "RESERVA"
              )}
              • {(reservation.service_type || "almuerzo").toUpperCase()}
            </span>
            <h3 className="font-serif font-bold text-base text-white leading-tight">
              {formatDate(reservation.reservation_date)} — {reservation.reservation_time || "Hora sin fijar"}
            </h3>
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider z-10 border ${
            isConfirmed
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
              : isCompleted
              ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
              : isCancelled
              ? "bg-red-500/20 text-red-300 border-red-500/40"
              : "bg-amber-500/20 text-amber-300 border-amber-500/40"
          }`}
        >
          {isConfirmed
            ? "Confirmada"
            : isCompleted
            ? "Cliente Llegó"
            : isCancelled
            ? "Cancelada"
            : "Pendiente"}
        </span>
      </div>

      {/* Details */}
      <div className="p-4 space-y-3.5 flex-1">
        {/* Client info */}
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
          <div>
            <h4 className="font-serif font-bold text-base text-gray-900 flex items-center gap-1.5">
              <User size={15} className="text-emerald-700" />
              {reservation.client_name || "Cliente Reserva"}
            </h4>
            {reservation.client_phone && (
              <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5 font-medium">
                <Phone size={13} className="text-gray-400" />
                {reservation.client_phone}
              </p>
            )}
            {reservation.client_email && (
              <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                <Mail size={12} className="text-gray-400" />
                {reservation.client_email}
              </p>
            )}
          </div>

          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-3 py-2 rounded-xl text-center shrink-0">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 block">
              Personas
            </span>
            <span className="font-serif text-lg font-black text-emerald-950 flex items-center justify-center gap-1">
              <Users size={16} /> {reservation.guest_count || 1}
            </span>
          </div>
        </div>

        {/* Zone & Notes */}
        {(reservation.zone_id || reservation.notes) && (
          <div className="space-y-1.5 text-xs bg-gray-50 p-2.5 rounded-xl border border-gray-100">
            {reservation.zone_id && (
              <div className="flex items-center gap-1.5 text-gray-700 font-semibold">
                <MapPin size={13} className="text-emerald-700" />
                <span>Zona / Mesa: {reservation.zone_id}</span>
              </div>
            )}
            {reservation.notes && (
              <p className="text-gray-500 italic">"{reservation.notes}"</p>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 bg-gray-50/80 border-t border-gray-100 space-y-2">
        {/* WhatsApp Actions Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleSendWhatsAppConfirmation}
            className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-98"
          >
            <MessageCircle size={14} />
            <span>Confirmar WhatsApp</span>
          </button>

          <button
            onClick={handleSendWhatsAppReminder}
            className="w-full py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-950 rounded-xl text-xs font-bold transition-all border border-emerald-300 flex items-center justify-center gap-1.5"
          >
            <BellRing size={14} className="text-emerald-700" />
            <span>Recordatorio Hoy</span>
          </button>
        </div>

        {/* Status update buttons (send valid constraint values: confirmed, completed, cancelled) */}
        <div className="flex items-center justify-between gap-2 pt-1">
          {!isConfirmed && (
            <button
              onClick={() => handleUpdateStatus("confirmed")}
              disabled={updating}
              className="flex-1 py-1.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
            >
              <CheckCircle2 size={13} /> Confirmar
            </button>
          )}

          {!isCompleted && (
            <button
              onClick={() => handleUpdateStatus("completed")}
              disabled={updating}
              className="flex-1 py-1.5 bg-white hover:bg-blue-50 text-blue-800 border border-blue-300 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
            >
              <Utensils size={13} /> Cliente Llegó
            </button>
          )}

          {!isCancelled && (
            <button
              onClick={() => handleUpdateStatus("cancelled")}
              disabled={updating}
              className="py-1.5 px-3 bg-white hover:bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
            >
              <XCircle size={13} /> Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
