import { useState, useRef, useMemo, useEffect } from "react";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const DEFAULT_CENTER = {
  lat: -13.1628496,
  lng: -74.2178801,
};

interface LocationSelectorProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialLocation?: { lat: number; lng: number } | null;
}

export function LocationSelector({ onLocationSelect, initialLocation }: LocationSelectorProps) {
  const [MapComponents, setMapComponents] = useState<any>(null);
  const position = initialLocation || DEFAULT_CENTER;
  
  useEffect(() => {
    let mounted = true;
    Promise.all([
      import("react-leaflet"),
      import("leaflet")
    ]).then(([rl, L]) => {
      if (!mounted) return;
      
      delete (L.default.Icon.Default.prototype as any)._getIconUrl;
      L.default.Icon.Default.mergeOptions({
        iconUrl: markerIcon,
        iconRetinaUrl: markerIcon2x,
        shadowUrl: markerShadow,
      });

      setMapComponents(rl);
    });
    return () => { mounted = false; };
  }, []);

  if (!MapComponents) {
    return <div className="w-full h-[250px] rounded-xl border-2 border-black/10 bg-black/5 animate-pulse" />;
  }

  const { MapContainer, TileLayer, Marker, useMapEvents } = MapComponents;

  function MapEvents() {
    useMapEvents({
      click(e: any) {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  }

  function DraggableMarker() {
    const markerRef = useRef<any>(null);
    const eventHandlers = useMemo(
      () => ({
        dragend() {
          const marker = markerRef.current;
          if (marker != null) {
            const newPos = marker.getLatLng();
            onLocationSelect(newPos.lat, newPos.lng);
          }
        },
      }),
      []
    );

    return (
      <Marker
        draggable={true}
        eventHandlers={eventHandlers}
        position={position}
        ref={markerRef}
      />
    );
  }

  return (
    <div className="w-full h-[250px] rounded-xl overflow-hidden border-2 border-black/10 relative z-0">
      <MapContainer
        center={position}
        zoom={15}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEvents />
        <DraggableMarker />
      </MapContainer>
    </div>
  );
}
