import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import api from "../api/axios";

const routeColors = [
  "#22c55e",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#a855f7",
  "#06b6d4",
  "#eab308",
  "#ec4899",
];

const truckIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width:28px;height:28px;
      background:#22c55e;
      color:white;
      border:2px solid white;
      border-radius:999px;
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:14px;
      box-shadow:0 4px 12px rgba(0,0,0,.35);
    ">🛻</div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -24],
});

function FitRoute({ route }) {
  const map = useMap();

  useEffect(() => {
    if (!route?.coordenadas?.length) return;

    const coords = route.coordenadas
      .map((p) => [Number(p.lat), Number(p.lng)])
      .filter(([lat, lng]) => Number.isFinite(lat) && Number.isFinite(lng));

    if (!coords.length) return;

    const bounds = L.latLngBounds(coords);
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [route, map]);

  return null;
}

export default function ConsultaPortal() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const [rutas, setRutas] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [colonias, setColonias] = useState([]);

  const [zonaId, setZonaId] = useState("");
  const [coloniaId, setColoniaId] = useState("");
  const [direccionBusqueda, setDireccionBusqueda] = useState("");
  const [selectedRuta, setSelectedRuta] = useState(null);

  const loadFiltros = async () => {
    try {
      const r = await api.get("/portal-publico/filtros");
      const data = r.data?.data ?? r.data ?? {};
      setZonas(Array.isArray(data.zonas) ? data.zonas : []);
      setColonias(Array.isArray(data.colonias) ? data.colonias : []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadRutas = async () => {
    setLoading(true);
    setMsg("");
    try {
      const params = {};
      if (zonaId) params.zona = zonaId;
      if (coloniaId) params.colonia = coloniaId;

      const r = await api.get("/portal-publico/rutas", { params });
      const data = r.data?.data ?? r.data ?? [];
      const arr = Array.isArray(data) ? data : [];

      setRutas(arr);

      setSelectedRuta((prev) => {
        if (!arr.length) return null;
        if (!prev) return arr[0];
        const found = arr.find((x) => x.id === prev.id);
        return found || arr[0];
      });
    } catch (err) {
      setMsg(err?.response?.data?.message || "No se pudieron cargar las rutas públicas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiltros();
  }, []);

  useEffect(() => {
    loadRutas();
  }, [zonaId, coloniaId]);

  const coloniasFiltradas = useMemo(() => {
    if (!zonaId) return colonias;
    return colonias.filter((c) => String(c.id_zona) === String(zonaId));
  }, [colonias, zonaId]);

  const rutasFiltradasPorDireccion = useMemo(() => {
    const txt = direccionBusqueda.trim().toLowerCase();
    if (!txt) return rutas;

    return rutas.filter((r) => {
      const nombreRuta = String(r.nombre || "").toLowerCase();
      const zonasTxt = (r.zonas || []).map((z) => String(z.nombre || "").toLowerCase()).join(" ");
      const coloniasTxt = (r.colonias || []).map((c) => String(c.nombre || "").toLowerCase()).join(" ");

      return (
        nombreRuta.includes(txt) ||
        zonasTxt.includes(txt) ||
        coloniasTxt.includes(txt)
      );
    });
  }, [rutas, direccionBusqueda]);

  useEffect(() => {
    if (!rutasFiltradasPorDireccion.length) {
      setSelectedRuta(null);
      return;
    }

    if (!selectedRuta) {
      setSelectedRuta(rutasFiltradasPorDireccion[0]);
      return;
    }

    const found = rutasFiltradasPorDireccion.find((r) => r.id === selectedRuta.id);
    if (!found) setSelectedRuta(rutasFiltradasPorDireccion[0]);
  }, [rutasFiltradasPorDireccion]);

  const center = [14.8347, -91.5180];

  return (
    <div style={{ minHeight: "100vh", background: "#0b1220", color: "white", padding: 24 }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
          <div>
            <h1 style={{ marginTop: 0, marginBottom: 8 }}>Consulta Pública de Rutas</h1>
            <p style={{ opacity: 0.85, margin: 0 }}>
              Consultá rutas de recolección, colonias, zonas, días y horarios aproximados.
            </p>
          </div>

          <button style={btnBack} onClick={() => navigate("/")}>
            Regresar
          </button>
        </div>

        {msg && <div style={{ marginTop: 12 }}>{msg}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 16, marginTop: 18 }}>
          <div style={card}>
            <h3 style={{ marginTop: 0 }}>Filtros y búsqueda</h3>

            <label>Zona</label>
            <select
              style={inp}
              value={zonaId}
              onChange={(e) => {
                setZonaId(e.target.value);
                setColoniaId("");
              }}
            >
              <option value="">Todas las zonas</option>
              {zonas.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.nombre}
                </option>
              ))}
            </select>

            <label>Colonia</label>
            <select
              style={inp}
              value={coloniaId}
              onChange={(e) => setColoniaId(e.target.value)}
            >
              <option value="">Todas las colonias</option>
              {coloniasFiltradas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>

            <button
              style={btn2}
              onClick={() => {
                setZonaId("");
                setColoniaId("");
                setDireccionBusqueda("");
              }}
            >
              Limpiar filtros
            </button>

            <div style={{ marginTop: 18 }}>
              <h3 style={{ marginBottom: 10 }}>Rutas encontradas</h3>

              {loading ? (
                <div style={{ opacity: 0.8 }}>Cargando...</div>
              ) : rutasFiltradasPorDireccion.length === 0 ? (
                <div style={{ opacity: 0.8 }}>
                  No se encontraron rutas para ese filtro o dirección.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {rutasFiltradasPorDireccion.map((r, idx) => (
                    <button
                      key={r.id}
                      style={{
                        ...routeBtn,
                        border:
                          selectedRuta?.id === r.id
                            ? `2px solid ${routeColors[idx % routeColors.length]}`
                            : "1px solid rgba(255,255,255,0.12)",
                      }}
                      onClick={() => setSelectedRuta(r)}
                    >
                      <div style={{ fontWeight: 900, marginBottom: 4 }}>{r.nombre}</div>
                      <div style={{ opacity: 0.82, fontSize: 12 }}>
                        {r.dias_asignados} • {r.horario}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedRuta && (
              <div style={{ marginTop: 18 }}>
                <h3 style={{ marginBottom: 10 }}>Detalle de ruta</h3>

                <div><b>Ruta:</b> {selectedRuta.nombre}</div>
                <div><b>Días:</b> {selectedRuta.dias_asignados}</div>
                <div><b>Horario:</b> {selectedRuta.horario}</div>
                <div><b>Tipo de residuo:</b> {selectedRuta.tipo_residuo}</div>
                <div><b>Distancia:</b> {selectedRuta.distancia ?? 0} km</div>

                <div style={{ marginTop: 10 }}>
                  <b>Zonas:</b>{" "}
                  {selectedRuta.zonas?.length
                    ? selectedRuta.zonas.map((z) => z.nombre).join(", ")
                    : "No asignadas"}
                </div>

                <div style={{ marginTop: 8 }}>
                  <b>Colonias:</b>{" "}
                  {selectedRuta.colonias?.length
                    ? selectedRuta.colonias.map((c) => c.nombre).join(", ")
                    : "No asignadas"}
                </div>

                <div style={{ marginTop: 12, fontSize: 13, opacity: 0.9 }}>
                  <b>Hora aproximada de paso de camión:</b> {selectedRuta.horario}
                </div>

              </div>
            )}
          </div>

          <div style={card}>
            <h3 style={{ marginTop: 0 }}>Mapa interactivo de rutas</h3>

            <div style={{ height: 620, borderRadius: 14, overflow: "hidden" }}>
              <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />

                {rutasFiltradasPorDireccion.map((r, idx) => {
                  const positions = (r.coordenadas ?? [])
                    .map((p) => [Number(p.lat), Number(p.lng)])
                    .filter(([lat, lng]) => Number.isFinite(lat) && Number.isFinite(lng));

                  if (!positions.length) return null;

                  const color = routeColors[idx % routeColors.length];
                  const first = positions[0];

                  return (
                    <div key={r.id}>
                      <Polyline
                        positions={positions}
                        pathOptions={{
                          color,
                          weight: selectedRuta?.id === r.id ? 6 : 4,
                          opacity: selectedRuta?.id === r.id ? 0.95 : 0.55,
                        }}
                        eventHandlers={{
                          click: () => setSelectedRuta(r),
                        }}
                      />

                      <Marker position={first} icon={truckIcon}>
                        <Popup>
                          <div style={{ fontWeight: 900 }}>{r.nombre}</div>
                          <div>Días: {r.dias_asignados}</div>
                          <div>Horario: {r.horario}</div>
                          <div style={{ marginTop: 6, fontSize: 12 }}>
                            Zonas: {r.zonas?.map((z) => z.nombre).join(", ") || "No asignadas"}
                          </div>
                        </Popup>
                      </Marker>
                    </div>
                  );
                })}

                <FitRoute route={selectedRuta} />
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const card = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(236, 23, 23, 0.96)",
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
  background: "#ee4b0a",
  color: "white",
  outline: "none",
};

const btn2 = {
  width: "100%",
  marginTop: 6,
  padding: 12,
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.2)",
  background: "transparent",
  color: "white",
  cursor: "pointer",
  fontWeight: 800,
};

const btnBack = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.2)",
  background: "transparent",
  color: "white",
  cursor: "pointer",
  fontWeight: 800,
};

const routeBtn = {
  width: "100%",
  textAlign: "left",
  padding: 12,
  borderRadius: 12,
  background: "rgba(255,255,255,0.04)",
  color: "white",
  cursor: "pointer",
};