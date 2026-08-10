import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { CheckCircle2, Navigation2, Package, MapPin, ExternalLink, Loader2, AlertTriangle, ShieldCheck, MapPinOff, Navigation, Info, Check, Settings, RefreshCw } from "lucide-react";
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
  const [gpsBlocked, setGpsBlocked] = useState(false);
  const [gpsSuccess, setGpsSuccess] = useState(false);
  const [testingGps, setTestingGps] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(false);

  const watchIdRef = useRef<number | null>(null);
  const channelRef = useRef<any>(null);

  // Detectar tipo de dispositivo (iPhone vs Android)
  useEffect(() => {
    if (typeof window !== "undefined" && window.navigator) {
      const isIOS = /iPhone|iPad|iPod/i.test(window.navigator.userAgent);
      setIsIOSDevice(isIOS);
    }
  }, []);

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
          setOrderError("Pedido no encontrado o enlace caducado.");
          return;
        }

        // Si el pedido ya fue entregado o cancelado, el enlace colapsa
        const normalizedStatus = (order.status || "").toLowerCase().trim();
        if (["entregado", "delivered", "completado", "cancelado", "cancelled"].includes(normalizedStatus)) {
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

  // Coordenadas de entrega del cliente
  const customerLocation = orderData?.latitude && orderData?.longitude 
    ? { lat: orderData.latitude, lng: orderData.longitude }
    : null;

  const requestGPSPermission = () => {
    setTestingGps(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Tu dispositivo o navegador no soporta geolocalización por GPS.");
      setGpsBlocked(true);
      setTestingGps(false);
      return;
    }

    // Solicitar posición síncrona
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsBlocked(false);
        setTestingGps(false);
        setError(null);
        setGpsSuccess(true);
        const { latitude: lat, longitude: lng } = pos.coords;
        
        if (channelRef.current) {
          channelRef.current.send({
            type: "broadcast",
            event: "location_update",
            payload: { lat, lng, timestamp: Date.now() },
          });
        }

        if (watchIdRef.current === null) {
          watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              if (channelRef.current) {
                channelRef.current.send({
                  type: "broadcast",
                  event: "location_update",
                  payload: { lat: latitude, lng: longitude, timestamp: Date.now() },
                });
              }
            },
            (err) => console.warn("GPS Watch warning:", err.message),
            { enableHighAccuracy: true, maximumAge: 5000, timeout: 5000 }
          );
        }
      },
      (err) => {
        console.warn("GPS Permission error:", err);
        setGpsBlocked(true);
        setTestingGps(false);
      },
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
    );
  };

  const startBroadcasting = async () => {
    setError(null);
    setDeliveryPhase('to_restaurant');

    try {
      const channelName = `delivery_tracking_${orderId}`;
      const channel = supabase.channel(channelName, {
        config: { broadcast: { self: true, ack: false } },
      });

      channelRef.current = channel;
      
      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsBroadcasting(true);
          channel.send({
            type: "broadcast",
            event: "status_update",
            payload: { status: 'to_restaurant', timestamp: Date.now() }
          });
        }
      });
    } catch (e) {
      console.warn("Realtime error:", e);
    }

    // Solicitar GPS sin bloquear el avance
    requestGPSPermission();
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
    if (channelRef.current) {
      channelRef.current.send({
        type: "broadcast",
        event: "status_update",
        payload: { status: 'delivered', timestamp: Date.now() }
      });
    }

    stopBroadcasting();
    setDeliveryPhase('delivered');

    // Actualizar estado del pedido en Supabase a 'entregado'
    try {
      await supabase
        .from("orders")
        .update({ status: "entregado" })
        .eq("id", orderId);
    } catch (err) {
      console.error("Error al actualizar estado en DB:", err);
    }
  };

  // Estado 1: Cargando datos del pedido
  if (loadingOrder) {
    return (
      <div className="min-h-screen bg-[#f8f4e6] flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <Loader2 size={40} className="animate-spin text-eucalipto mx-auto" />
          <p className="text-sm font-bold text-nogal/60 uppercase tracking-widest">Cargando datos de entrega...</p>
        </div>
      </div>
    );
  }

  // Estado 2: Error (pedido no encontrado o id erróneo)
  if (orderError || !orderData) {
    return (
      <div className="min-h-screen bg-[#f8f4e6] flex items-center justify-center p-6 font-sans">
        <div className="max-w-sm w-full bg-white rounded-3xl p-8 text-center shadow-xl border border-nogal/10 space-y-4">
          <AlertTriangle size={40} className="text-amber-500 mx-auto" />
          <h2 className="font-serif text-xl font-bold text-nogal">Enlace No Válido</h2>
          <p className="text-xs text-nogal/60">{orderError || "No se pudo cargar el pedido especificado."}</p>
        </div>
      </div>
    );
  }

  // Estado 3: Enlace Colapsado / Pedido Completado o Cancelado
  if (deliveryPhase === 'delivered' || ["entregado", "delivered", "completado", "cancelado", "cancelled"].includes((orderData.status || "").toLowerCase().trim())) {
    return (
      <div className="min-h-screen bg-[#f8f4e6] flex flex-col items-center justify-center p-6 text-center text-nogal font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-nogal/10 text-center space-y-5">
          <div className="w-20 h-20 bg-eucalipto/10 text-eucalipto rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={44} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-eucalipto bg-eucalipto/10 px-3 py-1 rounded-full">
              Enlace Finalizado
            </span>
            <h1 className="font-serif text-2xl font-bold text-nogal mt-3">Misión Cumplida</h1>
            <p className="text-xs text-nogal/60 mt-2 leading-relaxed">
              El pedido <strong>#{orderData.order_number || orderId}</strong> ya fue entregado y completado.
            </p>
          </div>
          <div className="bg-piedra p-4 rounded-2xl border border-nogal/5 text-left text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-nogal text-xs mb-1">
              <ShieldCheck size={16} className="text-eucalipto" />
              <span>Conexión Cerrada</span>
            </div>
            <p className="text-[11px] text-nogal/60">
              Este enlace de despacho ha caducado automáticamente para proteger recursos y liberar memoria del servidor.
            </p>
          </div>
          <a
            href="/"
            className="block w-full py-3.5 bg-nogal text-piedra rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-nogal/90 transition-all shadow-md"
          >
            Volver a Las Flores
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f4e6] font-sans flex flex-col p-4 md:p-6 justify-center">
      <div className="max-w-md w-full mx-auto bg-white rounded-3xl shadow-xl shadow-nogal/5 overflow-hidden border border-nogal/10">
        {/* Cabecera corporativa */}
        <div className="bg-nogal text-piedra p-6 text-center">
          <div className="w-16 h-16 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-4">
            <Navigation2 size={32} className={isBroadcasting ? "animate-pulse text-eucalipto" : "text-piedra/60"} />
          </div>
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-chilca mb-1 block">
            Ruta de Despacho
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
                <p className="font-bold text-sm text-nogal">{orderData.address || "Dirección no especificada"}</p>
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

          {/* Confirmación verde cuando el GPS se conecta exitosamente */}
          {gpsSuccess && (
            <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-2xl text-left flex items-center gap-2.5 text-emerald-900 text-xs font-bold shadow-xs">
              <Check size={18} className="text-emerald-600 shrink-0" />
              <span>Ubicación GPS conectada exitosamente.</span>
            </div>
          )}

          {/* Panel interactivo de permisos GPS para iPhone o Android */}
          {gpsBlocked && (
            <div className="bg-amber-50 border-2 border-amber-300 p-4 rounded-2xl text-left space-y-3 animate-in fade-in duration-300 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-amber-950 text-xs">
                  <MapPinOff size={18} className="text-amber-600 shrink-0" />
                  <span>Permiso de Ubicación Requerido</span>
                </div>
                <span className="text-[9px] uppercase font-extrabold px-2.5 py-0.5 bg-amber-200 text-amber-900 rounded-full">
                  {isIOSDevice ? "iPhone / iOS" : "Android"}
                </span>
              </div>

              <p className="text-[11px] text-amber-950 leading-relaxed font-medium">
                {isIOSDevice
                  ? "Safari en iPhone requiere permitir la ubicación del sitio web para mostrar tu movimiento en el mapa al cliente."
                  : "Tu navegador no ha concedido el permiso de ubicación para esta página."}
              </p>

              <button
                type="button"
                onClick={requestGPSPermission}
                disabled={testingGps}
                className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {testingGps ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Solicitando Permiso...</span>
                  </>
                ) : (
                  <>
                    <Navigation size={15} />
                    <span>Reintentar Permiso de GPS</span>
                  </>
                )}
              </button>

              {/* Guía visual paso a paso para iPhone y Android */}
              <div className="pt-3 border-t border-amber-200 space-y-2 text-[11px] text-amber-950 bg-amber-100/70 p-3 rounded-xl">
                <p className="font-bold uppercase tracking-wider text-[10px] text-amber-900 flex items-center gap-1.5">
                  <Settings size={14} className="text-amber-700 shrink-0" />
                  <span>Cómo activar en {isIOSDevice ? "iPhone (Safari)" : "Android (Chrome)"}:</span>
                </p>
                {isIOSDevice ? (
                  <ol className="list-decimal list-inside space-y-1.5 text-amber-950 font-medium leading-relaxed">
                    <li>Arriba a la izquierda de la URL, toca el botón de configuración del navegador.</li>
                    <li>Ingresa a <strong>Configuración del sitio web</strong>.</li>
                    <li>Cambia <strong>Ubicación</strong> de <i>Preguntar</i> a <strong>Permitir</strong>.</li>
                    <li>Presiona el botón de arriba o recarga la página.</li>
                  </ol>
                ) : (
                  <ol className="list-decimal list-inside space-y-1.5 text-amber-950 font-medium leading-relaxed">
                    <li>Toca el candado o ícono de ajustes a la izquierda de la URL arriba.</li>
                    <li>Selecciona <strong>Permisos del sitio</strong> → <strong>Ubicación</strong>.</li>
                    <li>Elige <strong>Permitir</strong> y presiona Reintentar.</li>
                  </ol>
                )}
              </div>
            </div>
          )}

          {error && !gpsBlocked && (
            <div className="bg-amber-50 text-amber-800 p-3.5 rounded-2xl text-xs font-medium border border-amber-200 flex gap-2.5 text-left items-start">
              <AlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-600" />
              <span>{error}</span>
            </div>
          )}

          {deliveryPhase === 'pending' && (
            <>
              <p className="text-nogal/70 text-sm leading-relaxed font-serif italic">
                Presiona el botón cuando inicies el viaje hacia el restaurante para preparar el pedido.
              </p>
              <button 
                onClick={startBroadcasting}
                className="w-full py-4 bg-eucalipto hover:bg-[#2c4a3e] text-piedra rounded-2xl font-bold text-sm uppercase tracking-widest transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Ir a Recoger Pedido
              </button>
            </>
          )}

          {deliveryPhase === 'to_restaurant' && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-300">
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl">
                <p className="text-xs font-bold text-amber-700 uppercase tracking-widest flex items-center justify-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  En camino a recoger
                </p>
                <p className="text-[11px] text-nogal/60 mt-1">
                  Dirígete al local. Al retirar el paquete de cocina, presiona el botón.
                </p>
              </div>

              <button 
                onClick={markPickedUp}
                className="w-full py-4 mt-2 bg-nogal hover:bg-nogal/90 text-piedra rounded-2xl font-bold text-sm uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Package size={20} />
                Pedido Recogido (Ir al cliente)
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
                <p className="text-[11px] text-nogal/60 mt-1">
                  Dirígete a la ubicación del cliente. Puedes abrir las aplicaciones de mapas.
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
                className="w-full py-4 mt-2 bg-pacay hover:bg-pacay/90 text-white rounded-2xl font-bold text-sm uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
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
        Sistema de Tracking Corporativo
      </div>
    </div>
  );
}
