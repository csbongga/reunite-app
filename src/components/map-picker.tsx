"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet icon issue in Next.js
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface MapPickerProps {
  location: { lat: number; lng: number } | null;
  onChange?: (location: { lat: number; lng: number }) => void;
  readonly?: boolean;
}

function LocationMarker({ location, onChange, readonly }: MapPickerProps) {
  useMapEvents({
    click(e) {
      if (!readonly && onChange) {
        onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
  });

  return location ? <Marker position={location} icon={icon} /> : null;
}

export default function MapPicker({ location, onChange, readonly = false }: MapPickerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const defaultCenter = { lat: 13.7563, lng: 100.5018 }; // Bangkok

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="h-[250px] bg-muted animate-pulse rounded-xl" />;

  return (
    <div className="h-[250px] w-full rounded-xl overflow-hidden border border-border relative z-0">
      <MapContainer
        center={location || defaultCenter}
        zoom={location ? 16 : 11}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker location={location} onChange={onChange} readonly={readonly} />
      </MapContainer>
    </div>
  );
}
