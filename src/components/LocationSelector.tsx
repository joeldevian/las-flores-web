import { useState, useRef, useMemo, useEffect } from "react";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import type { LeafletMouseEvent, Marker as LeafletMarker } from "leaflet";

const DEFAULT_CENTER = {
  lat: -13.1628496,
  lng: -74.2178801,
};

interface LocationSelectorProps {
  onLocationSelect: (lat: number, lng: number) => void;
  onAddressResolve?: (address: string) => void;
  initialLocation?: { lat: number; lng: number } | null;
}

export function LocationSelector({ onLocationSelect, onAddressResolve, initialLocation }: LocationSelectorProps) {
  const [MapComponents, setMapComponents] = useState<typeof import("react-leaflet") | null>(null);
  const position = initialLocation || DEFAULT_CENTER;

  const reverseGeocode = async (lat: number, lng: number) => {
    if (!onAddressResolve) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=es`,
        { headers: { "Accept-Language": "es" } }
      );
      if (!res.ok) return;
      const data = await res.json();
      if (data?.display_name) {
        onAddressResolve(data.display_name);
      }
    } catch (e) {
      console.error("Reverse geocoding error:", e);
    }
  };


  useEffect(() => {
    let mounted = true;
    Promise.all([import("react-leaflet"), import("leaflet")]).then(([rl, L]) => {
      if (!mounted) return;

      delete (L.default.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
      L.default.Icon.Default.mergeOptions({
        iconUrl: markerIcon,
        iconRetinaUrl: markerIcon2x,
        shadowUrl: markerShadow,
      });

      setMapComponents(rl);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!MapComponents) {
    return (
      <div className="w-full h-[250px] rounded-xl border-2 border-black/10 bg-black/5 animate-pulse" />
    );
  }

  const { MapContainer, TileLayer, Marker, useMapEvents } = MapComponents;

  function MapEvents() {
    useMapEvents({
      click(e: LeafletMouseEvent) {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
        reverseGeocode(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  }

  function DraggableMarker() {
    const markerRef = useRef<LeafletMarker | null>(null);
    const eventHandlers = useMemo(
      () => ({
        dragend() {
          const marker = markerRef.current;
          if (marker != null) {
            const newPos = marker.getLatLng();
            onLocationSelect(newPos.lat, newPos.lng);
            reverseGeocode(newPos.lat, newPos.lng);
          }
        },
      }),
      [],
    );

    return (
      <Marker draggable={true} eventHandlers={eventHandlers} position={position} ref={markerRef} />
    );
  }

  const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_API_KEY;

  return (
    <div className="w-full h-[250px] rounded-xl overflow-hidden border-2 border-black/10 relative z-0">
      <MapContainer
        center={position}
        zoom={15}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={`https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`}
        />
        <MapEvents />
        <DraggableMarker />
      </MapContainer>
    </div>
  );
}

