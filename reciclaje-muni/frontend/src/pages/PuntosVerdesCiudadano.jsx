import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { getPuntosVerdesPublicos } from "../services/reciclaje.service";
import { useNavigate } from "react-router-dom";

const greenIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width:32px;height:32px;
      background:rgba(34,197,94,0.95);
      border:2px solid rgba(255,255,255,0.85);
      border-radius:999px;
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 6px 18px rgba(0,0,0,0.35);
      font-size:16px;
    ">♻️</div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -28],
});

function isValidCoord(lat, lng) {
  const a = Number(lat);
  const b = Number(lng);
  return Number.isFinite(a) && Number.isFinite(b) && Math.abs(a) <= 90 && Math.abs(b) <= 180;
}

function FitToPoints({ puntos }) {
  const map = useMap();

  useEffect(() => {
    const coords = [];

    for (const p of puntos || []) {
      const lat = Number(p.latitud);
      const lng = Number(p.longitud);
      if (isValidCoord(lat, lng)) coords.push([lat, lng]);
    }

    if (coords.length === 0) return;

    if (coords.length === 1) {
      map.setView(coords[0], 16);
      return;
    }

    const bounds = L.latLngBounds(coords);
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [puntos, map]);

  return null;
}

export default function PuntosVerdesCiudadano() {
  const navigate = useNavigate();
  const [puntos, setPuntos] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const r = await getPuntosVerdesPublicos();
      const data = r.data?.data ?? r.data ?? [];
      setPuntos(Array.isArray(data) ? data : []);
      setMsg("");
    } catch (err) {
      setMsg(err?.response?.data?.message || "No se pudieron cargar los puntos verdes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const center = useMemo(() => [14.834, -91.518], []);

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "white", padding: 24 }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 18,
          }}
        >
          <div>
            <h1 style={{ margin: 0 }}>Puntos Verdes</h1>
            <p style={{ opacity: 0.85, marginTop: 8 }}>
              Consultá los puntos verdes disponibles para reciclaje en el municipio.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => navigate("/ciudadano/dashboard")}
              style={btnSecondary}
            >
              Volver al panel ciudadano
            </button>

            <button
              type="button"
              onClick={() => navigate("/")}
              style={btnSecondary}
            >
              Portal público
            </button>
          </div>
        </div>

        {msg && <div style={msgBox}>{msg}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 16 }}>
          <div style={card}>
            <h3 style={{ marginTop: 0 }}>Listado de puntos verdes</h3>

            <div style={{ display: "grid", gap: 10 }}>
              {puntos.map((p) => (
                <div key={p.id} style={item}>
                  <div style={{ fontWeight: 900, fontSize: 16 }}>{p.nombre}</div>
                  <div style={{ opacity: 0.9, marginTop: 4 }}>
                    Dirección: <b>{p.direccion || "Sin dirección"}</b>
                  </div>
                  <div style={{ opacity: 0.9 }}>
                    Horario: <b>{p.horario_atencion || p.horario || "N/D"}</b>
                  </div>
                  <div style={{ opacity: 0.9 }}>
                    Encargado: <b>{p.nombre_encargado || p.encargado || "N/D"}</b>
                  </div>
                  <div style={{ opacity: 0.9 }}>
                    Capacidad: <b>{p.capacidad_m3 || p.capacidad_total_m3 || "N/D"}</b> m³
                  </div>
                </div>
              ))}

              {!loading && puntos.length === 0 && (
                <div style={emptyBox}>No hay puntos verdes registrados.</div>
              )}
            </div>
          </div>

          <div style={card}>
            <h3 style={{ marginTop: 0 }}>Mapa de puntos verdes</h3>

            <div style={{ height: 620, borderRadius: 14, overflow: "hidden" }}>
              <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />

                <FitToPoints puntos={puntos} />

                {puntos
                  .filter((p) => isValidCoord(p.latitud, p.longitud))
                  .map((p) => (
                    <Marker
                      key={p.id}
                      position={[Number(p.latitud), Number(p.longitud)]}
                      icon={greenIcon}
                    >
                      <Popup>
                        <div style={{ fontWeight: 900 }}>{p.nombre}</div>
                        <div style={{ fontSize: 12, opacity: 0.9 }}>
                          {p.direccion || "Sin dirección"}
                        </div>
                        <div style={{ fontSize: 12, opacity: 0.85, marginTop: 6 }}>
                          Capacidad: <b>{p.capacidad_m3 || p.capacidad_total_m3 || "N/D"}</b> m³
                        </div>
                        <div style={{ fontSize: 12, opacity: 0.85 }}>
                          Horario: <b>{p.horario_atencion || p.horario || "N/D"}</b>
                        </div>
                        <div style={{ fontSize: 12, opacity: 0.85 }}>
                          Encargado: <b>{p.nombre_encargado || p.encargado || "N/D"}</b>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
              </MapContainer>
            </div>

            {loading && <div style={{ marginTop: 10, opacity: 0.85 }}>Cargando puntos verdes...</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

const card = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(232, 11, 11, 0.87)",
  borderRadius: 16,
  padding: 16,
};

const item = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 12,
  padding: 12,
};

const emptyBox = {
  background: "rgba(255,255,255,0.04)",
  border: "1px dashed rgba(255,255,255,0.12)",
  borderRadius: 12,
  padding: 14,
  opacity: 0.9,
};

const msgBox = {
  marginBottom: 14,
  padding: "12px 14px",
  borderRadius: 12,
  background: "rgba(59,130,246,0.12)",
  border: "1px solid rgba(59,130,246,0.30)",
};

const btnSecondary = {
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(255,255,255,0.06)",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};