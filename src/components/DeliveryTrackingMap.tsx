import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/lib/supabase";

// Fix para los íconos por defecto de Leaflet en React
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

// Ícono personalizado para la moto del repartidor
const motoIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3204/3204121.png", // Icono genérico de moto
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

// Ícono para el restaurante
const storeIcon = new L.Icon({
  iconUrl: "/images.png",
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

// Ícono para el destino
const homeIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/2555/2555572.png",
  iconSize: [35, 35],
  iconAnchor: [17.5, 35],
  popupAnchor: [0, -35],
});

interface DeliveryTrackingMapProps {
  orderId: string;
  restaurantLocation?: { lat: number; lng: number };
  customerLocation?: { lat: number; lng: number };
}

export function DeliveryTrackingMap({ 
  orderId, 
  restaurantLocation = { lat: -13.1611, lng: -74.2255 }, // Centro de Ayacucho
  customerLocation 
}: DeliveryTrackingMapProps) {
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [deliveryStatus, setDeliveryStatus] = useState<'pending' | 'to_restaurant' | 'to_customer' | 'delivered'>('pending');

  useEffect(() => {
    // Escuchar actualizaciones de ubicación del repartidor vía Supabase Realtime
    const channelName = `delivery_tracking_${orderId}`;
    const channel = supabase.channel(channelName);

    channel.on(
      "broadcast",
      { event: "location_update" },
      (payload) => {
        setDriverLocation({
          lat: payload.payload.lat,
          lng: payload.payload.lng,
        });
      }
    );
    
    channel.on(
      "broadcast",
      { event: "status_update" },
      (payload) => {
        setDeliveryStatus(payload.payload.status);
      }
    ).subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  return (
    <div className="w-full h-[400px] rounded-[1.5rem] overflow-hidden relative z-0">
      <MapContainer 
        center={driverLocation || restaurantLocation} 
        zoom={15} 
        style={{ width: "100%", height: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          // Utilizamos CartoDB Voyager, que tiene colores más pasteles y limpios que el default de OSM
        />

        {/* Marcador del Restaurante */}
        <Marker position={restaurantLocation} icon={storeIcon}>
          <Popup>Restaurante Las Flores</Popup>
        </Marker>

        {/* Marcador del Cliente (Destino) */}
        {customerLocation && (
          <Marker position={customerLocation} icon={homeIcon}>
            <Popup>Tu dirección de entrega</Popup>
          </Marker>
        )}

        {/* Línea conectando origen y destino */}
        {customerLocation && (
          <Polyline 
            positions={[restaurantLocation, customerLocation]} 
            color="#2c4a3e" 
            weight={4} 
            dashArray="10, 10" 
            opacity={0.6}
          />
        )}

        {/* Marcador del Repartidor (Dinámico) */}
        {driverLocation && (
          <Marker position={driverLocation} icon={motoIcon}>
            <Popup>Tu pedido está en camino</Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Overlay Status */}
      <div className="absolute top-4 left-4 right-4 md:right-auto z-[1000]">
        <div className="bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl shadow-nogal/5 border border-white flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
          <div>
            <h4 className="font-bold text-[10px] text-nogal/50 uppercase tracking-[0.2em] mb-0.5">Estado del Repartidor</h4>
            <div className="flex items-center gap-2">
              {deliveryStatus === 'delivered' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-sm font-bold text-blue-600 leading-none">Pedido Entregado</span>
                </>
              ) : deliveryStatus === 'to_customer' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-eucalipto animate-pulse" />
                  <span className="text-sm font-bold text-eucalipto leading-none">En camino a tu dirección</span>
                </>
              ) : deliveryStatus === 'to_restaurant' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-sm font-bold text-amber-600 leading-none">Yendo a recoger al restaurante</span>
                </>
              ) : driverLocation ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-sm font-bold text-amber-600 leading-none">Conectando...</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-gray-400" />
                  <span className="text-sm font-bold text-gray-500 leading-none">Esperando ubicación GPS</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
