"use client";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

// Leaflet default marker icon fix for Next.js
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Component to handle map clicks
function LocationMarker({ position, setPosition }: { position: [number, number] | null, setPosition: (pos: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={customIcon} />
  );
}

export default function MapPicker({ onSelectLocation, initialLat, initialLng }: { 
  onSelectLocation: (lat: number, lng: number) => void,
  initialLat?: number,
  initialLng?: number
}) {
  const [position, setPosition] = useState<[number, number] | null>(
    initialLat && initialLng ? [initialLat, initialLng] : [23.8103, 90.4125] // Default: Dhaka Center
  );

  const handlePositionChange = (pos: [number, number]) => {
    setPosition(pos);
    onSelectLocation(pos[0], pos[1]);
  };

  return (
    <MapContainer 
      center={position || [23.8103, 90.4125]} 
      zoom={13} 
      style={{ height: "350px", width: "100%", borderRadius: "12px" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker position={position} setPosition={handlePositionChange} />
    </MapContainer>
  );
}