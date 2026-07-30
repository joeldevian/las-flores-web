import { useState, useEffect } from "react";
import { Clock, Phone, MapPin, Truck, Store, CheckCircle2, ChevronRight, Eye, AlertCircle, Utensils, MessageSquare, ExternalLink } from "lucide-react";
import { openWhatsAppDispatch, generateDeliveryGoogleMapsUrl } from "../utils/whatsappDispatch";

interface CashierOrderCardProps {
  order: any;
  orderItems: any[];
  onStatusChange: (orderId: string, newStatus: string) => Promise<void>;
  onViewDetail: (order: any) => void;
}

export function CashierOrderCard({
  order,
  orderItems,
  onStatusChange,
  onViewDetail,
}: CashierOrderCardProps) {
  const [updating, setUpdating] = useState(false);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  useEffect(() => {
    const calculateElapsed = () => {
      if (!order.created_at) return;
      const created = new Date(order.created_at).getTime();
      const now = Date.now();
      const mins = Math.max(0, Math.floor((now - created) / (1000 * 60)));
      setElapsedMinutes(mins);
    };

    calculateElapsed();
    const interval = setInterval(calculateElapsed, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, [order.created_at]);

  const items = orderItems.filter((item) => item.order_id === order.id);

  const handleNextStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      await onStatusChange(order.id, newStatus);
    } finally {
      setUpdating(false);
    }
  };

  // Status configuration - Luxury Hospitality Muted Tone Palette
  const statusConfig = {
    pendiente: {
      border: "border-gray-200/80 bg-white",
      badge: "bg-amber-50 text-amber-800 border-amber-300",
      label: "Pendiente de Confirmación",
      nextAction: "en_preparacion",
      btnLabel: "Aceptar y Enviar a Cocina",
      btnClass: "bg-[#5F8575] hover:bg-[#4d7061] text-white shadow-2xs font-bold",
    },
    en_preparacion: {
      border: "border-gray-200/80 bg-white",
      badge: "bg-blue-50 text-blue-800 border-blue-300",
      label: "En Cocina / Preparación",
      nextAction: "en_camino",
      btnLabel: order.order_type === "delivery" ? "Marcar En Camino" : "Marcar Listo para Recojo",
      btnClass: "bg-[#2D473C] hover:bg-[#243B31] text-white shadow-2xs font-bold",
    },
    en_camino: {
      border: "border-gray-200/80 bg-white",
      badge: "bg-purple-50 text-purple-800 border-purple-300",
      label: order.order_type === "delivery" ? "En Camino (Delivery)" : "Listo en Barra / Recojo",
      nextAction: "entregado",
      btnLabel: "Marcar Entregado",
      btnClass: "bg-purple-700 hover:bg-purple-800 text-white shadow-2xs font-bold",
    },
    entregado: {
      border: "border-gray-200/80 bg-white opacity-85",
      badge: "bg-emerald-50 text-emerald-800 border-emerald-300",
      label: "Entregado y Completado",
      nextAction: null,
      btnLabel: null,
      btnClass: "",
    },
    cancelado: {
      border: "border-gray-200/60 bg-gray-50/60 opacity-60",
      badge: "bg-red-50 text-red-800 border-red-200",
      label: "Cancelado",
      nextAction: null,
      btnLabel: null,
      btnClass: "",
    },
  };

  const normalizedStatus = (() => {
    const raw = (order.status || "").toLowerCase().trim();
    if (raw.includes("cocina") || raw.includes("preparac") || raw.includes("kitchen")) return "en_preparacion";
    if (raw.includes("camino") || raw.includes("listo") || raw.includes("way") || raw.includes("pickup")) return "en_camino";
    if (raw.includes("entregad") || raw.includes("complet") || raw.includes("delivered")) return "entregado";
    if (raw.includes("cancel") || raw.includes("rechaz")) return "cancelado";
    return "pendiente";
  })();

  const currentStatus = statusConfig[normalizedStatus as keyof typeof statusConfig] || statusConfig.pendiente;

  return (
    <div
      className={`rounded-2xl border p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between font-sans ${currentStatus.border}`}
    >
      {/* Header Info */}
      <div>
        <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-sans font-black text-base text-[#2A4237] tracking-tight tabular-nums">
              #{order.order_number || order.id?.slice(0, 8)}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${currentStatus.badge}`}>
              {currentStatus.label}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-bold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200">
            <Clock size={12} className={elapsedMinutes > 20 ? "text-red-600 animate-pulse" : "text-gray-400"} />
            <span className={elapsedMinutes > 20 ? "text-red-700 font-extrabold" : ""}>
              Hace {elapsedMinutes} min
            </span>
          </div>
        </div>

        {/* Customer & Modality */}
        <div className="py-3 space-y-1.5 border-b border-gray-100 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-sans font-extrabold text-sm text-gray-900">
              {order.client_name || "Cliente General"}
            </span>

            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 ${
              order.order_type === "delivery"
                ? "bg-[#5F8575]/10 text-[#2A4237] border border-[#5F8575]/30"
                : "bg-[#D4AF37]/15 text-[#2A4237] border border-[#D4AF37]/30"
            }`}>
              {order.order_type === "delivery" ? <Truck size={11} /> : <Store size={11} />}
              {order.order_type === "delivery" ? "Delivery" : "Recojo en Tienda"}
            </span>
          </div>

          {order.client_phone && (
            <div className="flex items-center gap-2 text-gray-600">
              <Phone size={12} className="text-[#5F8575]" />
              <a
                href={`https://wa.me/51${order.client_phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="hover:underline font-semibold text-[#2A4237]"
              >
                {order.client_phone} (WhatsApp)
              </a>
            </div>
          )}

          {order.order_type === "delivery" && (order.address || order.latitude) && (
            <div className="flex items-center justify-between gap-1 text-[11px] text-gray-700 bg-gray-50/80 p-2 rounded-xl border border-gray-200 shadow-2xs mt-1">
              <div className="flex items-start gap-1 min-w-0 pr-2">
                <MapPin size={13} className="shrink-0 mt-0.5 text-[#5F8575]" />
                <span className="truncate font-semibold">{order.address || "Ubicación Georeferenciada"} {order.reference ? `(${order.reference})` : ""}</span>
              </div>
              <a
                href={generateDeliveryGoogleMapsUrl(order.latitude, order.longitude, order.address)}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg font-bold text-[10px] flex items-center gap-1 transition-colors"
                title="Abrir ubicación en Google Maps GPS"
              >
                <span>GPS</span>
                <ExternalLink size={10} />
              </a>
            </div>
          )}
        </div>

        {/* Items List Summary */}
        <div className="py-3 space-y-2">
          <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-gray-500 block">
            Comanda ({items.length} ítems):
          </span>
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {items.length === 0 ? (
              <p className="text-xs italic text-gray-400">Sin detalles de platos</p>
            ) : (
              items.map((item, idx) => (
                <div key={idx} className="flex items-start justify-between text-xs bg-gray-50 p-2 rounded-lg border border-gray-200/70">
                  <div className="pr-2">
                    <span className="font-bold text-gray-900">{item.quantity}x</span>{" "}
                    <span className="font-semibold text-gray-800">{item.product_name}</span>
                  </div>
                  <span className="font-sans font-black tracking-tight tabular-nums text-[#2A4237] shrink-0">
                    S/ {Number(item.subtotal || item.unit_price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer & Fast 1-Click Action */}
      <div className="pt-3 border-t border-gray-100 space-y-3">
        
        {/* Total & Payment Method */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Total a Cobrar</span>
            <span className="font-sans text-lg font-black tracking-tight tabular-nums text-[#2A4237]">
              S/ {Number(order.total || 0).toFixed(2)}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-gray-500 block uppercase">Pago</span>
            <span className="text-xs font-bold text-emerald-800 uppercase px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded-md inline-block">
              {order.payment_method || "Yape / Plin"}
            </span>
          </div>
        </div>

        {/* 1-Click Status Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewDetail(order)}
            className="p-2.5 rounded-xl bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 transition-colors shadow-2xs"
            title="Ver Detalle de Comanda / Imprimir Ticket"
          >
            <Eye size={16} />
          </button>

          {order.order_type === "delivery" &&
            normalizedStatus === "en_preparacion" &&
            order.status !== "pendiente" &&
            order.status !== "entregado" &&
            order.status !== "cancelado" && (
              <button
                onClick={() => openWhatsAppDispatch(order, items)}
                className="p-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-gray-950 font-sans font-extrabold text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
                title="Enviar Comanda Completa con GPS a WhatsApp Motorizado"
              >
                <MessageSquare size={15} />
                <span>Pedir Motorizado</span>
              </button>
            )}

          {currentStatus.nextAction && (
            <button
              onClick={() => handleNextStatus(currentStatus.nextAction!)}
              disabled={updating}
              className={`flex-1 py-2.5 px-3 rounded-xl font-sans font-bold text-xs shadow-2xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 ${currentStatus.btnClass}`}
            >
              <span>{updating ? "Actualizando..." : currentStatus.btnLabel}</span>
              <ChevronRight size={14} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
