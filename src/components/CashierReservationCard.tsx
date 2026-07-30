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
      {/* Header Banner con Colores Ricos y Vibrantes por Estado */}
      <div
        className={`p-4 text-white flex items-center justify-between relative overflow-hidden shadow-xs ${
          isConfirmed
            ? "bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900"
            : isCompleted
            ? "bg-gradient-to-r from-[#2D473C] via-[#243B31] to-[#1B2C24]"
            : isCancelled
            ? "bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900"
            : "bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800"
        }`}
      >
        <div className="flex items-center gap-2.5 z-10">
          <div className="w-9 h-9 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white font-bold shrink-0">
            <Calendar size={18} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-white/90 flex items-center gap-1.5 font-sans">
              {isToday ? (
                <span className="bg-[#D4AF37] text-[#2A4237] px-2 py-0.5 rounded-full font-black animate-pulse shadow-xs">
                  HOY
                </span>
              ) : (
                "RESERVA"
              )}
              • {(reservation.service_type || "almuerzo").toUpperCase()}
            </span>
            <h3 className="font-sans font-bold text-base text-white leading-tight mt-0.5">
              {formatDate(reservation.reservation_date)} — {reservation.reservation_time || "Hora sin fijar"}
            </h3>
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={`text-[11px] font-sans font-extrabold px-3 py-1 rounded-full uppercase tracking-wider z-10 border shadow-xs ${
            isConfirmed
              ? "bg-blue-500/30 text-blue-100 border-blue-400/50"
              : isCompleted
              ? "bg-emerald-500/30 text-emerald-100 border-emerald-400/50"
              : isCancelled
              ? "bg-red-500/30 text-red-200 border-red-400/50"
              : "bg-amber-400/30 text-amber-100 border-amber-300/50"
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
      <div className="p-4 space-y-3.5 flex-1 font-sans">
        {/* Client info */}
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
          <div>
            <h4 className="font-sans font-extrabold text-base text-gray-900 flex items-center gap-1.5">
              <User size={16} className="text-[#5F8575]" />
              {reservation.client_name || "Cliente Reserva"}
            </h4>
            {reservation.client_phone && (
              <p className="text-xs text-gray-700 flex items-center gap-1 mt-1 font-semibold">
                <Phone size={13} className="text-gray-400" />
                {reservation.client_phone}
              </p>
            )}
            {reservation.client_email && (
              <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5 font-medium">
                <Mail size={12} className="text-gray-400" />
                {reservation.client_email}
              </p>
            )}
          </div>

          <div className="bg-[#5F8575]/10 border border-[#5F8575]/20 text-[#2A4237] px-3 py-2 rounded-xl text-center shrink-0">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#5F8575] block">
              Personas
            </span>
            <span className="font-sans text-lg font-black tracking-tight tabular-nums text-[#2A4237] flex items-center justify-center gap-1">
              <Users size={16} /> {reservation.guest_count || 1}
            </span>
          </div>
        </div>

        {/* Zone & Notes */}
        {(reservation.zone_id || reservation.notes) && (
          <div className="space-y-1.5 text-xs bg-gray-50 p-2.5 rounded-xl border border-gray-200">
            {reservation.zone_id && (
              <div className="flex items-center gap-1.5 text-gray-800 font-bold">
                <MapPin size={13} className="text-[#5F8575]" />
                <span>Zona / Mesa: {reservation.zone_id}</span>
              </div>
            )}
            {reservation.notes && (
              <p className="text-gray-600 italic">"{reservation.notes}"</p>
            )}
          </div>
        )}
      </div>

      {/* Actions Bar - High Contrast & Vibrant Action Buttons */}
      <div className="p-4 bg-gray-50/90 border-t border-gray-200 space-y-2 font-sans">
        {/* WhatsApp Actions Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleSendWhatsAppConfirmation}
            className="w-full py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-gray-950 rounded-xl text-xs font-black transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-98"
          >
            <MessageCircle size={15} />
            <span>Confirmar WhatsApp</span>
          </button>

          <button
            onClick={handleSendWhatsAppReminder}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-98"
          >
            <BellRing size={15} />
            <span>Recordatorio Hoy</span>
          </button>
        </div>

        {/* Status update buttons */}
        <div className="flex items-center justify-between gap-2 pt-1">
          {!isConfirmed && (
            <button
              onClick={() => handleUpdateStatus("confirmed")}
              disabled={updating}
              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1 active:scale-98"
            >
              <CheckCircle2 size={14} /> Confirmar
            </button>
          )}

          {!isCompleted && (
            <button
              onClick={() => handleUpdateStatus("completed")}
              disabled={updating}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1 active:scale-98"
            >
              <Utensils size={14} /> Cliente Llegó
            </button>
          )}

          {!isCancelled && (
            <button
              onClick={() => handleUpdateStatus("cancelled")}
              disabled={updating}
              className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1"
            >
              <XCircle size={14} /> Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
