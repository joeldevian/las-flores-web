import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { DeliveryTrackingMap } from "@/components/DeliveryTrackingMap";
import { Package, MapPin, Navigation2, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/rastreo/$orderId")({
  head: () => ({
    meta: [{ title: "Rastreo de Pedido en Vivo | Las Flores" }],
  }),
  component: ClientTrackingLink,
});

interface OrderDetails {
  id: string;
  order_number: string;
  address: string;
  reference: string;
  latitude: number | null;
  longitude: number | null;
  status: string;
}

function ClientTrackingLink() {
  const { orderId } = Route.useParams();

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const restaurantLocation = { lat: -13.1611, lng: -74.2255 }; // Centro Ayacucho (Restaurante Las Flores)

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      try {
        const { data, error: err } = await supabase
          .from("orders")
          .select("id, order_number, address, reference, latitude, longitude, status")
          .eq("id", orderId)
          .single();

        if (err || !data) {
          setError("No pudimos encontrar la orden de compra especificada.");
          return;
        }

        setOrder(data);
      } catch (e) {
        console.error("Error al cargar orden de rastreo:", e);
        setError("Ocurrió un error al cargar la información del rastreo.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f4e6] flex flex-col items-center justify-center p-6 text-nogal">
        <Loader2 size={40} className="animate-spin text-eucalipto mb-4" />
        <p className="font-bold text-xs uppercase tracking-widest text-nogal/60">Cargando mapa de rastreo...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#f8f4e6] flex flex-col items-center justify-center p-6 text-nogal">
        <div className="bg-white p-8 rounded-3xl border border-nogal/10 shadow-xl max-w-sm text-center space-y-4">
          <AlertTriangle size={40} className="text-amber-500 mx-auto" />
          <h2 className="font-serif font-bold text-xl">Pedido No Encontrado</h2>
          <p className="text-xs text-nogal/60 leading-relaxed">{error}</p>
        </div>
      </div>
    );
  }

  const isDelivered = (order.status || "").toLowerCase().includes("entregad") || (order.status || "").toLowerCase().includes("delivered");

  const customerLocation = order.latitude && order.longitude
    ? { lat: order.latitude, lng: order.longitude }
    : { lat: -13.165, lng: -74.220 }; // Coordenada por defecto cerca al centro

  return (
    <div className="min-h-screen bg-[#f8f4e6] text-[#2c2a29] font-sans flex flex-col pt-12 pb-12 px-4 md:px-10 selection:bg-chilca/20">
      
      <div className="max-w-4xl mx-auto w-full flex flex-col gap-6 md:gap-8">
        
        {/* Cabecera Editorial */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative">
          <div className="absolute -top-10 -left-6 text-[150px] font-serif italic text-nogal/5 pointer-events-none select-none z-0">
            03
          </div>
          <div className="relative z-10">
            <span className="text-[10px] md:text-xs uppercase tracking-[0.4em] font-extrabold text-chilca block mb-3">
              Experiencia Las Flores
            </span>
            <h1 className="font-serif italic text-4xl md:text-6xl text-nogal tracking-tight leading-[1.1]">
              {isDelivered ? "Pedido Entregado." : "Tu pedido está en camino."}
            </h1>
          </div>
          
          <div className="relative z-10 bg-white/80 backdrop-blur-md px-5 py-3.5 rounded-2xl shadow-xl shadow-nogal/5 border border-white flex items-center gap-4">
            <div className="w-10 h-10 bg-eucalipto/10 rounded-full flex items-center justify-center shrink-0">
              <Package className="text-eucalipto" size={20} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[9px] uppercase font-bold text-nogal/40 tracking-[0.2em] mb-0.5">Orden de Compra</p>
              <p className="text-sm font-bold text-nogal tracking-wide">#{order.order_number || orderId}</p>
            </div>
          </div>
        </header>

        {/* Mapa Leaflet */}
        <section className="bg-white p-2 rounded-[2rem] shadow-2xl shadow-nogal/5 border border-nogal/5 relative z-10">
          <div className="relative rounded-[1.5rem] overflow-hidden bg-piedra">
            <DeliveryTrackingMap 
              orderId={orderId}
              restaurantLocation={restaurantLocation}
              customerLocation={customerLocation}
            />
          </div>
        </section>

        {/* Info Box Abajo */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 relative z-10">
          <div className="bg-white/80 backdrop-blur-sm p-6 md:p-8 rounded-3xl border border-nogal/10 flex items-start gap-5 shadow-sm">
            <div className="w-12 h-12 bg-piedra rounded-2xl flex items-center justify-center shrink-0 border border-nogal/5">
              <MapPin className="text-nogal" size={22} />
            </div>
            <div>
              <h3 className="font-bold text-xs uppercase tracking-[0.15em] text-nogal/50 mb-2">Destino Registrado</h3>
              <p className="text-nogal text-sm font-medium leading-relaxed">{order.address || "Dirección no especificada"}</p>
              {order.reference && (
                <p className="text-nogal/50 text-[11px] mt-1 italic">Ref: {order.reference}</p>
              )}
            </div>
          </div>

          <div className="bg-nogal p-6 md:p-8 rounded-3xl border border-nogal/10 flex flex-col justify-center items-center text-center text-piedra shadow-xl">
             <Navigation2 className="text-chilca opacity-50 mb-3" size={24} />
             <h3 className="font-serif italic text-xl mb-1">¿Algún inconveniente?</h3>
             <p className="text-[11px] text-piedra/60 mb-5 max-w-[200px] leading-relaxed">Nuestro equipo de soporte está listo para ayudarte con tu orden.</p>
             <a href="https://wa.me/51980723422" target="_blank" rel="noreferrer" className="w-full max-w-[200px] py-3.5 bg-pacay text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-pacay/90 transition-all shadow-md active:scale-95">
               Contactar Soporte
             </a>
          </div>
        </section>
        
      </div>
    </div>
  );
}
