import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMapEvents } from "react-leaflet";
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

// normaliza coordenadas venga como venga (lat/lng o latitud/longitud)
function normalizeCoords(arr) {
  const safe = Array.isArray(arr) ? arr : [];
  return safe
    .map((c) => {
      const lat = Number(c.lat ?? c.latitud);
      const lng = Number(c.lng ?? c.longitud);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
      return [lat, lng];
    })
    .filter(Boolean);
}

export default function MapEditor({ points, setPoints, setDistanceKm, routes = [] }) {
  const positions = points.map((p) => [p.lat, p.lng]);

  useEffect(() => {
    if (points.length >= 2) setDistanceKm(calcKm(points));
    else setDistanceKm(0);
  }, [points, setDistanceKm]);

  // rutas guardadas -> polylines
  const savedLines = routes
    .map((r) => ({
      id: r.id ?? r.nombre,
      nombre: r.nombre ?? "Ruta",
      coords: normalizeCoords(r.coordenadas ?? r.puntos ?? r.route_points),
    }))
    .filter((r) => r.coords.length >= 2); 

  return (
    <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.10)" }}>
      <MapContainer center={[14.8347, -91.5180]} zoom={13} style={{ height: 520, width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* capturar clicks ruta actual */}
        <ClickCapture points={points} setPoints={setPoints} />

        {/* markers de la ruta actual */}
        {positions
          .filter((p) => Number.isFinite(p[0]) && Number.isFinite(p[1]))
          .map((pos, i) => (
            <Marker key={`cur-${i}`} position={pos} />
          ))}

        {/* polyline de la ruta actual */}
        {positions.length >= 2 && <Polyline positions={positions} />}

        {/* polylines de rutas guardadas */}
        {savedLines.map((r) => (
          <Polyline key={`saved-${r.id}`} positions={r.coords}>
            <Popup>{r.nombre}</Popup>
          </Polyline>
        ))}
      </MapContainer>
    </div>
  );
}