import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Navigation, CheckCircle2, Navigation2, XCircle, Package, MapPin, ExternalLink, Loader2, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/d/$orderId")({
  component: DriverMagicLink,
  head: () => ({
    meta: [{ title: "Ruta de Entrega | Motorizado" }],
  }),
});

interface OrderData {
  id: string;
  order_number: string;
  client_name: string;
  client_phone: string;
  address: string;
  reference: string;
  latitude: number | null;
  longitude: number | null;
  total: number;
  status: string;
  payment_method: string;
  order_items?: { quantity: number; product_name: string; subtotal: number }[];
}

function DriverMagicLink() {
  const { orderId } = Route.useParams();
  
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [deliveryPhase, setDeliveryPhase] = useState<'pending' | 'to_restaurant' | 'to_customer' | 'delivered'>('pending');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const watchIdRef = useRef<number | null>(null);
  const channelRef = useRef<any>(null);

  // Cargar datos reales del pedido desde Supabase
  useEffect(() => {
    const fetchOrder = async () => {
      setLoadingOrder(true);
      try {
        const { data: order, error: fetchErr } = await supabase
          .from("orders")
          .select("*, order_items(*)")
          .eq("id", orderId)
          .single();

        if (fetchErr || !order) {
          setOrderError("Pedido no encontrado. Verifica el enlace.");
          return;
        }

        // Si el pedido ya fue entregado, mostrar pantalla de completado
        const normalizedStatus = (order.status || "").toLowerCase();
        if (normalizedStatus.includes("entregad") || normalizedStatus.includes("delivered") || normalizedStatus.includes("complet")) {
          setDeliveryPhase('delivered');
        }

        setOrderData(order);
      } catch (err) {
        console.error(err);
        setOrderError("Error de conexión. Intenta recargar la página.");
      } finally {
        setLoadingOrder(false);
      }
    };

    fetchOrder();
    return () => stopBroadcasting();
  }, [orderId]);

  // Datos del destino de entrega
  const customerLocation = orderData?.latitude && orderData?.longitude 
    ? { lat: orderData.latitude, lng: orderData.longitude }
    : null;

  const startBroadcasting = async () => {
    setError(null);
    if (!navigator.geolocation) {
      setError("Error: Tu navegador no soporta geolocalización.");
      return;
    }

    try {
      const channelName = `delivery_tracking_${orderId}`;
      const channel = supabase.channel(channelName, {
        config: { broadcast: { self: true, ack: false } },
      });

      channelRef.current = channel;
      
      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              setIsBroadcasting(true);
              channel.send({
                type: "broadcast",
                event: "location_update",
                payload: { lat: pos.coords.latitude, lng: pos.coords.longitude, timestamp: Date.now() },
              });
              
              channel.send({
                type: "broadcast",
                event: "status_update",
                payload: { status: 'to_restaurant', timestamp: Date.now() }
              });

              setDeliveryPhase('to_restaurant');

              watchIdRef.current = navigator.geolocation.watchPosition(
                (position) => {
                  const { latitude, longitude } = position.coords;
                  channel.send({
                    type: "broadcast",
                    event: "location_update",
                    payload: { lat: latitude, lng: longitude, timestamp: Date.now() },
                  });
                },
                (err) => {
                  console.error("GPS Watch Error:", err);
                },
                { enableHighAccuracy: true, maximumAge: 5000, timeout: 5000 }
              );
            },
            (err) => {
              setError(`Error GPS: ${err.message}. (Si estás en PC, tu equipo podría no tener sensor GPS activo).`);
              console.error(err);
            },
            { enableHighAccuracy: false, timeout: 15000, maximumAge: Infinity }
          );
        }
      });
    } catch (err: any) {
      setError(`Error interno: ${err.message}`);
      console.error(err);
    }
  };

  const stopBroadcasting = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    setIsBroadcasting(false);
  };

  const markPickedUp = async () => {
    setDeliveryPhase('to_customer');
    if (channelRef.current) {
      channelRef.current.send({
        type: "broadcast",
        event: "status_update",
        payload: { status: 'to_customer', timestamp: Date.now() }
      });
    }

    // Actualizar estado del pedido en Supabase DB a 'en_camino'
    try {
      await supabase
        .from("orders")
        .update({ status: "en_camino" })
        .eq("id", orderId);
    } catch (err) {
      console.error("Error al actualizar estado en DB:", err);
    }
  };

  const markDelivered = async () => {
    // Emitir estado antes de desconectar
    if (channelRef.current) {
      channelRef.current.send({
        type: "broadcast",
        event: "status_update",
        payload: { status: 'delivered', timestamp: Date.now() }
      });
    }

    stopBroadcasting();
    setDeliveryPhase('delivered');

    // Actualizar estado del pedido en Supabase
    try {
      await supabase
        .from("orders")
        .update({ status: "entregado" })
        .eq("id", orderId);
    } catch (err) {
      console.error("Error al actualizar estado en DB:", err);
    }
  };

  // Estado: Cargando datos del pedido
  if (loadingOrder) {
    return (
      <div className="min-h-screen bg-[#f8f4e6] flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <Loader2 size={40} className="animate-spin text-eucalipto mx-auto" />
          <p className="text-sm font-bold text-nogal/60 uppercase tracking-widest">Cargando pedido...</p>
        </div>
      </div>
    );
  }

  // Estado: Error (pedido no encontrado)
  if (orderError || !orderData) {
    return (
      <div className="min-h-screen bg-[#f8f4e6] flex items-center justify-center p-6">
        <div className="max-w-sm bg-white rounded-3xl p-8 text-center shadow-xl border border-nogal/10 space-y-4">
          <AlertTriangle size={40} className="text-amber-500 mx-auto" />
          <h2 className="font-serif text-xl font-bold text-nogal">Enlace no válido</h2>
          <p className="text-sm text-nogal/60">{orderError || "No se pudo cargar el pedido."}</p>
        </div>
      </div>
    );
  }

  // Estado: Entregado
  if (deliveryPhase === 'delivered') {
    return (
      <div className="min-h-screen bg-eucalipto flex flex-col items-center justify-center p-6 text-center text-piedra animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={48} className="text-chilca" />
        </div>
        <h1 className="text-3xl font-serif mb-2">Mision Cumplida</h1>
        <p className="text-piedra/70 text-sm max-w-xs mx-auto">
          El pedido #{orderData.order_number} ha sido marcado como entregado. La transmision GPS se ha cerrado de forma segura.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f4e6] font-sans flex flex-col p-4 md:p-6 justify-center">
      <div className="max-w-md w-full mx-auto bg-white rounded-3xl shadow-xl shadow-nogal/5 overflow-hidden border border-nogal/10">
        {/* Cabecera */}
        <div className="bg-nogal text-piedra p-6 text-center">
          <div className="w-16 h-16 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-4">
            <Navigation2 size={32} className={isBroadcasting ? "animate-pulse text-eucalipto" : "text-piedra/60"} />
          </div>
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-chilca mb-1 block">
            Ruta Asignada
          </span>
          <h2 className="text-2xl font-serif font-bold">#{orderData.order_number}</h2>
        </div>

        {/* Cuerpo */}
        <div className="p-6 md:p-8 flex flex-col gap-5 text-center">
          {/* Información del Cliente */}
          <div className="bg-piedra/30 rounded-2xl p-4 text-left border border-nogal/5 space-y-3">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
                <MapPin className="text-nogal" size={20} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-nogal/50 mb-1">Entregar en:</p>
                <p className="font-bold text-sm text-nogal">{orderData.address || "Sin direccion especificada"}</p>
                {orderData.reference && (
                  <p className="text-xs text-nogal/60 mt-0.5">Ref: {orderData.reference}</p>
                )}
              </div>
            </div>
            
            {/* Resumen del pedido */}
            <div className="border-t border-nogal/10 pt-3 space-y-1.5">
              <p className="text-[10px] uppercase font-bold tracking-widest text-nogal/50">Detalle del pedido:</p>
              {orderData.order_items?.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs">
                  <span className="text-nogal/80">{item.quantity}x {item.product_name}</span>
                  <span className="font-bold text-nogal">S/ {Number(item.subtotal).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-bold border-t border-nogal/10 pt-2 mt-2">
                <span className="text-nogal">Total a cobrar:</span>
                <span className="text-eucalipto">S/ {Number(orderData.total).toFixed(2)}</span>
              </div>
              <p className="text-[10px] text-nogal/50 uppercase font-bold">Pago: {orderData.payment_method || "Yape / Plin"}</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-medium border border-red-100 flex gap-3 text-left items-start">
              <XCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {deliveryPhase === 'pending' && (
            <>
              <p className="text-nogal/70 text-sm leading-relaxed">
                Abre este enlace unicamente cuando estes listo para salir hacia el restaurante a recoger el pedido.
              </p>
              <button 
                onClick={startBroadcasting}
                className="w-full py-4 bg-eucalipto hover:bg-[#2c4a3e] text-piedra rounded-2xl font-bold text-sm uppercase tracking-widest transition-all shadow-md active:scale-95"
              >
                Ir a Recoger Pedido
              </button>
            </>
          )}

          {deliveryPhase === 'to_restaurant' && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-300">
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl">
                <p className="text-xs font-bold text-amber-600 uppercase tracking-widest flex items-center justify-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  En camino a recoger
                </p>
                <p className="text-[11px] text-nogal/60 mt-2">
                  Dirigete al restaurante. Tu ubicacion ya esta siendo transmitida.
                </p>
              </div>

              <button 
                onClick={markPickedUp}
                className="w-full py-4 mt-2 bg-nogal hover:bg-nogal/90 text-piedra rounded-2xl font-bold text-sm uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
              >
                <Package size={20} />
                Pedido Recogido
              </button>
            </div>
          )}

          {deliveryPhase === 'to_customer' && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-300">
              <div className="bg-eucalipto/10 border border-eucalipto/20 p-4 rounded-2xl">
                <p className="text-xs font-bold text-eucalipto uppercase tracking-widest flex items-center justify-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-eucalipto animate-pulse" />
                  En camino al destino
                </p>
                <p className="text-[11px] text-nogal/60 mt-2">
                  El cliente esta viendo tu progreso. Dirigete a la direccion de entrega.
                </p>
              </div>

              {customerLocation && (
                <div className="flex gap-2">
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${customerLocation.lat},${customerLocation.lng}`}
                    target="_blank" rel="noreferrer"
                    className="flex-1 py-3 bg-white border border-nogal/10 hover:bg-piedra text-nogal rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-sm active:scale-95 flex flex-col items-center justify-center gap-1"
                  >
                    <ExternalLink size={16} className="mb-1" />
                    Google Maps
                  </a>
                  <a 
                    href={`https://waze.com/ul?ll=${customerLocation.lat},${customerLocation.lng}&navigate=yes`}
                    target="_blank" rel="noreferrer"
                    className="flex-1 py-3 bg-white border border-nogal/10 hover:bg-piedra text-nogal rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-sm active:scale-95 flex flex-col items-center justify-center gap-1"
                  >
                    <ExternalLink size={16} className="mb-1" />
                    Waze
                  </a>
                </div>
              )}

              <button 
                onClick={markDelivered}
                className="w-full py-4 mt-2 bg-pacay hover:bg-pacay/90 text-white rounded-2xl font-bold text-sm uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={20} />
                Confirmar Entrega
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8 text-center text-nogal/40 text-[10px] uppercase font-bold tracking-widest flex items-center justify-center gap-2">
        <img src="/images.png" className="h-4 brightness-0 opacity-40 grayscale" alt="Logo" />
        Sistema de Tracking Seguro
      </div>
    </div>
  );
}
