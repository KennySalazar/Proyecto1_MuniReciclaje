import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

export default function Generacion() {
  const [asignaciones, setAsignaciones] = useState([]);
  const [gen, setGen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const [idAsignacion, setIdAsignacion] = useState("");

  const loadAsignaciones = async () => {
    setLoading(true);
    setMsg("");
    try {
      const a = await api.get("/asignaciones");
      const data = a.data?.data ?? a.data;
      setAsignaciones(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setMsg("No se pudieron cargar asignaciones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAsignaciones();
  }, []);

  const canGen = useMemo(() => !!idAsignacion, [idAsignacion]);

  const handleGenerar = async () => {
    if (!canGen) return;
    setMsg("");
    try {
      const res = await api.post("/generaciones/generar", {
        id_asignacion_camion_ruta: Number(idAsignacion),
      });
      setGen(res.data?.data ?? res.data);
      setMsg("Generación creada");
    } catch (err) {
      console.error(err);
      setMsg(err?.response?.data?.message || "Error generando");
    }
  };

const puntos = gen?.puntos ?? [];
const center = puntos.length
  ? [Number(puntos[0].lat), Number(puntos[0].lng)]
  : [14.8347, -91.5180];

  return (
    <div style={{ padding: 24, color: "white" }}>
      <h1 style={{ marginTop: 0 }}>Generación Dinámica</h1>
      <p style={{ opacity: 0.85 }}>
        Genera puntos (15-30) y kilos estimados, y los muestra en el mapa.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "420px 1fr", gap: 16 }}>
        <div style={card}>
          <h3 style={{ marginTop: 0 }}>Generar</h3>

          <label>Asignación</label>
          <select
            style={inp}
            value={idAsignacion}
            onChange={(e) => setIdAsignacion(e.target.value)}
          >
            <option value="">-- Seleccioná --</option>
            {asignaciones.map((x) => (
              <option key={x.id} value={x.id}>
                #{x.id} — Ruta:{x.id_ruta} — Camión:{x.id_camion} — {x.fecha}
              </option>
            ))}
          </select>

          <button onClick={handleGenerar} disabled={!canGen} style={btn}>
            Generar ahora
          </button>

          {gen && (
            <div style={{ marginTop: 12, opacity: 0.95 }}>
              <div><b>Puntos:</b> {gen.cantidad_puntos}</div>
              <div><b>Total (kg):</b> {gen.total_basura}</div>
              <div><b>Densidad:</b> {gen.tipo_densidad}</div>
              <div><b>Fecha:</b> {gen.fecha_generacion} ({gen.fecha_dia_semana})</div>
            </div>
          )}

          {msg && <div style={{ marginTop: 10, opacity: 0.95 }}>{msg}</div>}
        </div>

        <div style={{ ...card, padding: 0, overflow: "hidden" }}>
          <div style={{ padding: 14, borderBottom: "1px solid rgba(255,255,255,0.10)" }}>
            <h3 style={{ margin: 0 }}>Mapa de puntos</h3>
          </div>

          <MapContainer center={center} zoom={13} style={{ height: 520, width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {puntos.map((p) => (
            <Marker key={p.id} position={[Number(p.lat), Number(p.lng)]}>
                <Popup>
                <b>Punto #{p.orden}</b><br />
                {p.peso_kg} kg
                </Popup>
            </Marker>
            ))}

          </MapContainer>
        </div>
      </div>

      {loading && <div style={{ marginTop: 12, opacity: 0.85 }}>Cargando...</div>}
    </div>
  );
}

const card = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: 14,
  padding: 14,
};

const inp = {
  width: "100%",
  marginTop: 6,
  marginBottom: 10,
  padding: 10,
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.15)",
  background: "rgba(0,0,0,0.25)",
  color: "white",
  outline: "none",
};

const btn = {
  width: "100%",
  marginTop: 10,
  padding: 12,
  borderRadius: 12,
  border: "none",
  background: "#22c55e",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
};