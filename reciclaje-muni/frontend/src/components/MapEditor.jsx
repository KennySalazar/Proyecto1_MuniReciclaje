import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from "react-leaflet";
import haversine from "haversine-distance";

function ClickCapture({ points, setPoints }) {
  useMapEvents({
    click(e) {
      const next = {
        lat: e.latlng.lat,
        lng: e.latlng.lng,
        orden: points.length + 1,
      };
      setPoints([...points, next]);
    },
  });
  return null;
}

function calcKm(points) {
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    total += haversine(
      { lat: points[i].lat, lng: points[i].lng },
      { lat: points[i + 1].lat, lng: points[i + 1].lng }
    );
  }
  return total / 1000;
}

export default function MapEditor({ points, setPoints, setDistanceKm }) {
  const positions = points.map((p) => [p.lat, p.lng]);

  useEffect(() => {
    if (points.length >= 2) {
      const km = calcKm(points);
      setDistanceKm(km);
    } else {
      setDistanceKm(0);
    }
  }, [points, setDistanceKm]);

  return (
    <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.10)" }}>
      <MapContainer center={[14.8347, -91.5180]} zoom={13} style={{ height: 520, width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <ClickCapture points={points} setPoints={setPoints} />

        {positions.map((pos, i) => (
          <Marker key={i} position={pos} />
        ))}

        {positions.length >= 2 && <Polyline positions={positions} />}
      </MapContainer>
    </div>
  );
}