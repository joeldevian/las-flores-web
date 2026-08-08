import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Navigation, CheckCircle2, Navigation2, XCircle, Package, MapPin, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/d/$orderId")({
  component: DriverMagicLink,
  head: () => ({
    meta: [{ title: "Ruta de Entrega | Motorizado" }],
  }),
});

function DriverMagicLink() {
  const { orderId } = Route.useParams();
  
  // En producción, esto vendría de Supabase filtrando por orderId
  const mockCustomerData = {
    address: "Jr. Asamblea 123, Ayacucho",
    reference: "Cerca a la Plaza Sucre",
    location: { lat: -13.165, lng: -74.220 }
  };
  const [deliveryPhase, setDeliveryPhase] = useState<'pending' | 'to_restaurant' | 'to_customer' | 'delivered'>('pending');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const watchIdRef = useRef<number | null>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    return () => stopBroadcasting();
  }, []);

  const startBroadcasting = async () => {
    setError(null);
    if (!navigator.geolocation) {
      setError("Error: Tu navegador no soporta geolocalización.");
      return;
    }

    try {
      // 1. Inicializar canal primero
      const channelName = `delivery_tracking_${orderId}`;
      const channel = supabase.channel(channelName, {
        config: { broadcast: { self: true, ack: false } },
      });

      channelRef.current = channel;
      
      // Suscribirse y esperar a estar conectado
      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // 2. Intentar pedir GPS solo cuando el canal esté listo
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              setIsBroadcasting(true);
              // Emitir la primera posición
              channel.send({
                type: "broadcast",
                event: "location_update",
                payload: { lat: pos.coords.latitude, lng: pos.coords.longitude, timestamp: Date.now() },
              });
              
              // Emitir nuevo estado
              channel.send({
                type: "broadcast",
                event: "status_update",
                payload: { status: 'to_restaurant', timestamp: Date.now() }
              });

              setDeliveryPhase('to_restaurant');

              // Activar seguimiento continuo
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

  const markPickedUp = () => {
    setDeliveryPhase('to_customer');
    if (channelRef.current) {
      channelRef.current.send({
        type: "broadcast",
        event: "status_update",
        payload: { status: 'to_customer', timestamp: Date.now() }
      });
    }
  };

  const markDelivered = () => {
    stopBroadcasting();
    setDeliveryPhase('delivered');
    if (channelRef.current) {
      channelRef.current.send({
        type: "broadcast",
        event: "status_update",
        payload: { status: 'delivered', timestamp: Date.now() }
      });
    }
    // TODO: Llamada a la DB real
  };

  if (deliveryPhase === 'delivered') {
    return (
      <div className="min-h-screen bg-eucalipto flex flex-col items-center justify-center p-6 text-center text-piedra animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={48} className="text-chilca" />
        </div>
        <h1 className="text-3xl font-serif mb-2">¡Misión Cumplida!</h1>
        <p className="text-piedra/70 text-sm max-w-xs mx-auto">
          El pedido ha sido marcado como entregado. La transmisión GPS se ha cerrado de forma segura.
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
          <h2 className="text-2xl font-serif font-bold">{orderId}</h2>
        </div>

        {/* Cuerpo */}
        <div className="p-6 md:p-8 flex flex-col gap-6 text-center">
          {/* Información del Cliente */}
          <div className="bg-piedra/30 rounded-2xl p-4 text-left border border-nogal/5 flex gap-4">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
              <MapPin className="text-nogal" size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-nogal/50 mb-1">Entregar en:</p>
              <p className="font-bold text-sm text-nogal">{mockCustomerData.address}</p>
              <p className="text-xs text-nogal/60 mt-0.5">{mockCustomerData.reference}</p>
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
                Abre este enlace únicamente cuando estés listo para salir hacia el restaurante a recoger el pedido.
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
                  Dirígete al restaurante. Tu ubicación ya está siendo transmitida.
                </p>
              </div>

              <button 
                onClick={markPickedUp}
                className="w-full py-4 mt-2 bg-nogal hover:bg-nogal/90 text-piedra rounded-2xl font-bold text-sm uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
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
                <p className="text-[11px] text-nogal/60 mt-2">
                  El cliente está viendo tu progreso. Dirígete a la dirección de entrega.
                </p>
              </div>

              <div className="flex gap-2">
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${mockCustomerData.location.lat},${mockCustomerData.location.lng}`}
                  target="_blank" rel="noreferrer"
                  className="flex-1 py-3 bg-white border border-nogal/10 hover:bg-piedra text-nogal rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-sm active:scale-95 flex flex-col items-center justify-center gap-1"
                >
                  <ExternalLink size={16} className="mb-1" />
                  Google Maps
                </a>
                <a 
                  href={`https://waze.com/ul?ll=${mockCustomerData.location.lat},${mockCustomerData.location.lng}&navigate=yes`}
                  target="_blank" rel="noreferrer"
                  className="flex-1 py-3 bg-white border border-nogal/10 hover:bg-piedra text-nogal rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-sm active:scale-95 flex flex-col items-center justify-center gap-1"
                >
                  <ExternalLink size={16} className="mb-1" />
                  Waze
                </a>
              </div>

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
