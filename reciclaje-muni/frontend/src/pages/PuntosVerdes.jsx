import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import api from "../api/axios";

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

const pickIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width:32px;height:32px;
      background:rgba(59,130,246,0.95);
      border:2px solid rgba(255,255,255,0.85);
      border-radius:999px;
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 6px 18px rgba(0,0,0,0.35);
      font-size:16px;
    ">📍</div>
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

function ClickMap({ onPick }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onPick({ latitud: lat, longitud: lng });
    },
  });
  return null;
}

function FitToPoints({ puntos, picked }) {
  const map = useMap();

  useEffect(() => {
    const coords = [];

    for (const p of puntos || []) {
      const lat = Number(p.latitud);
      const lng = Number(p.longitud);
      if (isValidCoord(lat, lng)) coords.push([lat, lng]);
    }

    if (picked && isValidCoord(picked.latitud, picked.longitud)) {
      coords.push([Number(picked.latitud), Number(picked.longitud)]);
    }

    if (coords.length === 0) return;

    if (coords.length === 1) {
      map.setView(coords[0], 16);
      return;
    }

    const bounds = L.latLngBounds(coords);
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [puntos, picked, map]);

  return null;
}

export default function PuntosVerdes() {
  const [loading, setLoading] = useState(true);
  const [loadingOperadores, setLoadingOperadores] = useState(false);
  const [msg, setMsg] = useState("");

  const [puntos, setPuntos] = useState([]);
  const [operadores, setOperadores] = useState([]);
  const [picked, setPicked] = useState(null);

  const [form, setForm] = useState({
    nombre: "",
    direccion: "",
    capacidad_total_m3: "",
    horario: "",
    encargado: "",
  });

  const loadPuntos = async () => {
    setLoading(true);
    setMsg("");

    try {
      const r = await api.get("/puntos-verdes");
      const data = r.data?.data ?? r.data ?? [];
      setPuntos(Array.isArray(data) ? data : []);
    } catch (err) {
      setMsg(err?.response?.data?.message || "No se pudieron cargar los puntos verdes");
    } finally {
      setLoading(false);
    }
  };

  const loadOperadores = async () => {
    setLoadingOperadores(true);

    try {
      const r = await api.get("/usuarios/operadores");
      const data = r.data?.data ?? r.data ?? [];
      setOperadores(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando operadores:", err);
      setOperadores([]);
    } finally {
      setLoadingOperadores(false);
    }
  };

  const loadAll = async () => {
    await Promise.all([loadPuntos(), loadOperadores()]);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!picked || !isValidCoord(picked.latitud, picked.longitud)) {
      return setMsg("Tenes que seleccionar una ubicación valida en el mapa (GPS obligatorio).");
    }

    if (!form.encargado) {
      return setMsg("Tenes que seleccionar un operador encargado.");
    }

    try {
      await api.post("/puntos-verdes", {
        ...form,
        encargado: Number(form.encargado),
        capacidad_total_m3: Number(form.capacidad_total_m3),
        latitud: Number(picked.latitud),
        longitud: Number(picked.longitud),
      });

      setForm({
        nombre: "",
        direccion: "",
        capacidad_total_m3: "",
        horario: "",
        encargado: "",
      });
      setPicked(null);

      await loadPuntos();
      setMsg("Punto verde registrado");
      setTimeout(() => setMsg(""), 1500);
    } catch (err) {
      setMsg(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "No se pudo guardar el punto verde"
      );
    }
  };

  const center = useMemo(() => {
    return [14.834, -91.518];
  }, []);

  return (
    <div style={{ padding: 24, color: "white" }}>
      <h1 style={{ marginTop: 0 }}>Puntos Verdes</h1>
      <p style={{ opacity: 0.85 }}>
        Registrá puntos verdes y visualizá todos en el mapa general.
      </p>

      {msg && <div style={{ marginBottom: 12, opacity: 0.95 }}>{msg}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 16 }}>
        <div style={card}>
          <h3 style={{ marginTop: 0 }}>Registrar Punto Verde</h3>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input
              style={inp}
              placeholder="Nombre del punto"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              required
            />

            <input
              style={inp}
              placeholder="Dirección completa"
              value={form.direccion}
              onChange={(e) => setForm({ ...form, direccion: e.target.value })}
              required
            />

            <input
              style={inp}
              placeholder="Capacidad total (m³)"
              type="number"
              step="0.01"
              value={form.capacidad_total_m3}
              onChange={(e) => setForm({ ...form, capacidad_total_m3: e.target.value })}
              required
            />

            <input
              style={inp}
              placeholder="Horario de atención (ej: 08:00-16:00)"
              value={form.horario}
              onChange={(e) => setForm({ ...form, horario: e.target.value })}
              required
            />

            <select
              style={inp}
              value={form.encargado}
              onChange={(e) => setForm({ ...form, encargado: e.target.value })}
              required
            >
              <option value="">
                {loadingOperadores ? "Cargando operadores..." : "Seleccione un operador"}
              </option>

              {operadores.map((op) => (
                <option key={op.id} value={op.id}>
                  {op.nombre}{op.email ? ` - ${op.email}` : ""}
                </option>
              ))}
            </select>

            <div style={{ fontSize: 12, opacity: 0.85, lineHeight: 1.4 }}>
              <b>GPS</b>
              <div>Lat: {picked ? Number(picked.latitud).toFixed(6) : "—"}</div>
              <div>Lng: {picked ? Number(picked.longitud).toFixed(6) : "—"}</div>
              <div style={{ marginTop: 6, opacity: 0.8 }}>
                Haz click en el mapa para seleccionar la ubicacion
              </div>
            </div>

            <button style={btn} disabled={loading || loadingOperadores}>
              {loading || loadingOperadores ? "Cargando..." : "Guardar Punto"}
            </button>

            <button
              type="button"
              style={btn2}
              onClick={loadAll}
              disabled={loading || loadingOperadores}
            >
              Refrescar lista
            </button>
          </form>

          <div style={{ marginTop: 14, opacity: 0.85, fontSize: 12 }}>
            Total registrados: <b>{puntos.length}</b>
          </div>
        </div>

        <div style={card}>
          <h3 style={{ marginTop: 0 }}>Mapa general</h3>

          <div style={{ height: 560, borderRadius: 14, overflow: "hidden" }}>
            <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />

              <ClickMap onPick={setPicked} />
              <FitToPoints puntos={puntos} picked={picked} />

              {picked && isValidCoord(picked.latitud, picked.longitud) && (
                <Marker
                  position={[Number(picked.latitud), Number(picked.longitud)]}
                  icon={pickIcon}
                >
                  <Popup>
                    <b>Ubicación seleccionada</b>
                    <div style={{ fontSize: 12, opacity: 0.85 }}>
                      {Number(picked.latitud).toFixed(6)}, {Number(picked.longitud).toFixed(6)}
                    </div>
                  </Popup>
                </Marker>
              )}

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
                      Capacidad: <b>{p.capacidad_m3}</b> m³
                    </div>

                    <div style={{ fontSize: 12, opacity: 0.85 }}>
                      Horario: <b>{p.horario_atencion}</b>
                    </div>

                    <div style={{ fontSize: 12, opacity: 0.85 }}>
                      Encargado: <b>{p.nombre_encargado || "Sin encargado"}</b>
                    </div>
                  </Popup>
                  </Marker>
                ))}
            </MapContainer>
          </div>

          {loading && <div style={{ marginTop: 10, opacity: 0.85 }}>Cargando puntos...</div>}

          {!loading && puntos.length === 0 && (
            <div style={{ marginTop: 10, opacity: 0.85 }}>
              Aún no hay puntos verdes registrados.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const card = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(239, 6, 6, 0.84)",
  borderRadius: 14,
  padding: 14,
};

const inp = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgb(241, 236, 236)",
  background: "#ee4b0a",
  color: "white",
  outline: "none",
};

const btn = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(34,197,94,0.55)",
  background: "rgba(34,197,94,0.18)",
  color: "white",
  cursor: "pointer",
  fontWeight: 900,
};

const btn2 = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.2)",
  background: "transparent",
  color: "white",
  cursor: "pointer",
  fontWeight: 800,
};