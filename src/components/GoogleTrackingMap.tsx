import { useState, useEffect, useCallback } from "react";
import { GoogleMap, useJsApiLoader, Marker, Polyline } from "@react-google-maps/api";
import { supabase } from "@/lib/supabase";

// Estilo Premium "Andean Editorial"
const customMapStyles = [
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#f5f5f5" }]
  },
  {
    "elementType": "labels.icon",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#616161" }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#f5f5f5" }]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#bdbdbd" }]
  },
  {
    "featureType": "landscape.man_made",
    "elementType": "geometry.fill",
    "stylers": [{ "color": "#e9e4d6" }] // Tono piedra claro
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [{ "color": "#eeeeee" }]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [{ "color": "#e5e5e5" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#9e9e9e" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{ "color": "#ffffff" }]
  },
  {
    "featureType": "road.arterial",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{ "color": "#dadada" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#616161" }]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#9e9e9e" }]
  },
  {
    "featureType": "transit.line",
    "elementType": "geometry",
    "stylers": [{ "color": "#e5e5e5" }]
  },
  {
    "featureType": "transit.station",
    "elementType": "geometry",
    "stylers": [{ "color": "#eeeeee" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#c9c6c8" }]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#9e9e9e" }]
  }
];

const containerStyle = {
  width: "100%",
  height: "100%"
};

// Coordenadas aproximadas de Ayacucho por defecto
const defaultCenter = {
  lat: -13.1611,
  lng: -74.2255
};

interface GoogleTrackingMapProps {
  orderId: string;
  restaurantLocation?: { lat: number; lng: number };
  customerLocation?: { lat: number; lng: number };
}

export function GoogleTrackingMap({ 
  orderId, 
  restaurantLocation = defaultCenter, 
  customerLocation 
}: GoogleTrackingMapProps) {
  
  // ¡ATENCIÓN! Reemplazar con tu API Key real de Google Cloud Console
  // Al estar en local, funcionará si la key no tiene restricciones estrictas.
  // En producción, asegúrate de restringir la clave a tu dominio exacto.
  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""; 
  
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: API_KEY,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);

  const onLoad = useCallback(function callback(mapInstance: google.maps.Map) {
    // Si queremos ajustar el zoom inicial a los puntos
    if (customerLocation) {
      const bounds = new window.google.maps.LatLngBounds(restaurantLocation);
      bounds.extend(customerLocation);
      mapInstance.fitBounds(bounds);
    }
    setMap(mapInstance);
  }, [restaurantLocation, customerLocation]);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  // Efecto para escuchar la geolocalización desde Supabase Realtime
  useEffect(() => {
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
        
        // Auto-centrar suavemente el mapa si el repartidor se mueve (opcional, puede deshabilitarse para que el usuario navegue libremente)
        // if (map) {
        //   map.panTo({ lat: payload.payload.lat, lng: payload.payload.lng });
        // }
      }
    ).subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, map]);

  if (loadError) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-red-50 text-red-500 rounded-2xl border border-red-100">
        <p className="text-sm font-bold">Error al cargar Google Maps</p>
      </div>
    );
  }

  if (!isLoaded || !API_KEY) {
    return (
      <div className="w-full h-[400px] flex flex-col items-center justify-center bg-piedra/50 rounded-2xl border border-nogal/10">
        <div className="w-8 h-8 border-[3px] border-nogal border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-bold text-nogal/50 uppercase tracking-widest">
          {!API_KEY ? "Falta API Key de Google Maps" : "Cargando Mapa..."}
        </p>
        {!API_KEY && (
          <p className="text-[10px] text-nogal/40 mt-2 text-center max-w-xs">
            Añade VITE_GOOGLE_MAPS_API_KEY a tu archivo .env
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] rounded-2xl overflow-hidden border border-nogal/10 relative z-0 shadow-inner">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={driverLocation || restaurantLocation}
        zoom={14}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          styles: customMapStyles,
          disableDefaultUI: true, // Quita controles invasivos
          zoomControl: true, // Mantiene el control de zoom para el usuario
        }}
      >
        {/* Marcador del Restaurante */}
        <Marker 
          position={restaurantLocation}
          title="Restaurante Las Flores"
          icon={{
            url: "https://cdn-icons-png.flaticon.com/512/3703/3703217.png", // Icono tienda local
            scaledSize: new window.google.maps.Size(40, 40),
            anchor: new window.google.maps.Point(20, 20)
          }}
        />

        {/* Marcador del Cliente (Destino) */}
        {customerLocation && (
          <Marker 
            position={customerLocation}
            title="Dirección de Entrega"
            icon={{
              url: "https://cdn-icons-png.flaticon.com/512/2555/2555572.png", // Icono casa
              scaledSize: new window.google.maps.Size(35, 35),
              anchor: new window.google.maps.Point(17.5, 35)
            }}
          />
        )}

        {/* Línea simple que conecta origen y destino */}
        {customerLocation && (
          <Polyline
            path={[restaurantLocation, customerLocation]}
            options={{
              strokeColor: "#2c4a3e", // Eucalipto
              strokeOpacity: 0.5,
              strokeWeight: 3,
              icons: [{
                icon: { path: window.google.maps.SymbolPath.CIRCLE, fillOpacity: 1, scale: 3 },
                offset: '0',
                repeat: '20px'
              }],
            }}
          />
        )}

        {/* Marcador del Repartidor (Dinámico) */}
        {driverLocation && (
          <Marker 
            position={driverLocation} 
            title="Repartidor en camino"
            options={{ optimized: false }} // Previene recargas raras de renderizado en actualizaciones rápidas
            icon={{
              url: "https://cdn-icons-png.flaticon.com/512/3204/3204121.png", // Icono motorizado
              scaledSize: new window.google.maps.Size(45, 45),
              anchor: new window.google.maps.Point(22.5, 22.5)
            }}
          />
        )}
      </GoogleMap>

      {/* Overlay Status (Premium UI) */}
      <div className="absolute top-4 left-4 right-4 md:right-auto z-10">
        <div className="bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl shadow-nogal/5 border border-white flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
          <div>
            <h4 className="font-bold text-[10px] text-nogal/50 uppercase tracking-[0.2em] mb-0.5">Estado</h4>
            <div className="flex items-center gap-2">
              {driverLocation ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-eucalipto animate-pulse" />
                  <span className="text-sm font-bold text-eucalipto leading-none">En movimiento</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-sm font-bold text-amber-600 leading-none">Esperando ubicación GPS</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
