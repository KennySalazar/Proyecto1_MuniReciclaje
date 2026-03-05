import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import api from "../api/axios";

// ======================
// ICONOS (sin imágenes)
// ======================
const makeDivIcon = (emoji, bg) =>
  L.divIcon({
    className: "custom-div-icon",
    html: `
      <div style="
        width: 34px; height: 34px;
        border-radius: 999px;
        display:flex; align-items:center; justify-content:center;
        background:${bg};
        border: 2px solid rgba(255,255,255,0.75);
        box-shadow: 0 8px 20px rgba(0,0,0,0.35);
        font-size: 18px;
      ">${emoji}</div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -34],
  });

const ICON_TRUCK = makeDivIcon("🚚", "rgba(59,130,246,0.70)");
const ICON_BAG = makeDivIcon("♻️", "rgba(245,158,11,0.70)");
const ICON_DONE = makeDivIcon("✅", "rgba(34,197,94,0.70)");

export default function Monitoreo() {
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);

  // para “Auto Simular”
  const [auto, setAuto] = useState(false);
  const autoRef = useRef(null);

  const load = async (keepSelected = true) => {
    setMsg("");
    try {
      const r = await api.get("/monitoreo/activas");
      const data = r.data?.data ?? r.data ?? [];
      const arr = Array.isArray(data) ? data : [];
      setItems(arr);

      // refrescar el selected con data nueva (para que cambie lat/lng y progreso)
      if (keepSelected && selected) {
        const fresh = arr.find((x) => x.id_recoleccion === selected.id_recoleccion);
        if (fresh) setSelected(fresh);
      }
    } catch (err) {
      setMsg(err?.response?.data?.message || "No se pudo cargar el monitoreo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(false);
    const t = setInterval(() => load(true), 3000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // auto-simulación
  useEffect(() => {
    if (!auto || !selected) {
      if (autoRef.current) clearInterval(autoRef.current);
      autoRef.current = null;
      return;
    }

    autoRef.current = setInterval(async () => {
      try {
        await api.post(`/monitoreo/${selected.id_recoleccion}/simular`);
        await load(true);
      } catch (err) {
        setMsg(err?.response?.data?.message || "No se pudo simular");
        setAuto(false);
      }
    }, 2000);

    return () => {
      if (autoRef.current) clearInterval(autoRef.current);
      autoRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, selected]);

  const rows = useMemo(() => {
    const out = [...items];
    out.sort((a, b) => String(b.estado || "").localeCompare(String(a.estado || "")));
    return out;
  }, [items]);

  const center = useMemo(() => {
    const def = [14.6349, -90.5069]; // Guate City
    const lat = Number(selected?.ubicacion?.lat);
    const lng = Number(selected?.ubicacion?.lng);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng];

    // fallback: si no hay ubicación del camión, centramos por primer punto
    const p0 = selected?.puntos?.[0];
    const plat = Number(p0?.lat);
    const plng = Number(p0?.lng);
    if (Number.isFinite(plat) && Number.isFinite(plng)) return [plat, plng];

    return def;
  }, [selected]);



  return (
    <div style={{ padding: 24, color: "white" }}>
      <h1 style={{ marginTop: 0 }}>Monitoreo</h1>
      <p style={{ opacity: 0.85 }}>
        Recolecciones en tiempo real (estado, progreso, puntos de basura y ubicación del camión).
      </p>

      {msg && <div style={{ marginBottom: 12, opacity: 0.95 }}>{msg}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "520px 1fr", gap: 16 }}>
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
            <h3 style={{ marginTop: 0, marginBottom: 0 }}>Recolecciones activas</h3>
            <button onClick={() => load(true)} style={btn2}>Refrescar</button>
          </div>

          {loading ? (
            <div style={{ opacity: 0.85, marginTop: 10 }}>Cargando...</div>
          ) : rows.length === 0 ? (
            <div style={{ opacity: 0.85, marginTop: 10 }}>No hay recolecciones activas.</div>
          ) : (
            <div style={{ overflowX: "auto", marginTop: 10 }}>
              <table style={table}>
                <thead>
                  <tr>
                    <th style={th}>Estado</th>
                    <th style={th}>Ruta</th>
                    <th style={th}>Camión</th>
                    <th style={th}>Progreso</th>
                    <th style={th}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((x) => (
                    <tr key={x.id_recoleccion}>
                      <td style={td}><EstadoBadge estado={x.estado} /></td>
                      <td style={td}>
                        <div style={{ fontWeight: 800 }}>{x.ruta?.nombre || "—"}</div>
                        <div style={{ opacity: 0.75, fontSize: 12 }}>
                          {x.asignacion?.fecha || ""}
                        </div>
                      </td>
                      <td style={td}>{x.camion?.placa || "—"}</td>
                      <td style={td}>{renderProgreso(x)}</td>
                      <td style={td}>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <button
                            style={miniBtn}
                            onClick={() => {
                              setSelected(x);
                              setAuto(false);
                            }}
                          >
                            Ver en mapa
                          </button>

                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ marginTop: 10, opacity: 0.75, fontSize: 12 }}>
                Actualiza cada 3 segundos.
              </div>
            </div>
          )}
        </div>

        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ marginTop: 0, marginBottom: 0 }}>Mapa</h3>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ opacity: 0.8, fontSize: 12 }}>
                Camión: 🚚 | Punto: ♻️ | Recolectado: ✅
              </span>

              <button
                style={miniBtn}
                disabled={!selected}
                onClick={() => setAuto((v) => !v)}
              >
                {auto ? "Auto: ON" : "Auto: OFF"}
              </button>
            </div>
          </div>

          <div style={{ height: 520, borderRadius: 14, overflow: "hidden", marginTop: 12 }}>
            <MapContainer center={center} zoom={15} style={{ height: "100%", width: "100%" }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />

              {/* 1) PUNTOS DE BASURA */}
              {selected?.puntos?.map((p) => {
                const done = Number(p.orden) <= Number(selected?.progreso?.punto_actual ?? 0);
                const icon = done ? ICON_DONE : ICON_BAG;

                return (
                  <Marker
                    key={p.id}
                    position={[Number(p.lat), Number(p.lng)]}
                    icon={icon}
                  >
                    <Popup>
                      <b>Punto #{p.orden}</b>
                      <br />
                      {p.peso_kg} kg
                      <br />
                      {done ? "✅ Recolectado" : "⏳ Pendiente"}
                    </Popup>
                  </Marker>
                );
              })}

              {/* 2) CAMIÓN */}
              {selected && isValidCoord(selected?.ubicacion?.lat, selected?.ubicacion?.lng) && (
                <Marker
                  position={[
                    Number(selected.ubicacion.lat),
                    Number(selected.ubicacion.lng),
                  ]}
                  icon={ICON_TRUCK}
                >
                  <Popup>
                    <div style={{ fontWeight: 800 }}>{selected.camion?.placa || "—"}</div>
                    <div>{selected.ruta?.nombre || "—"}</div>
                    <div style={{ fontSize: 12, opacity: 0.85 }}>
                      Estado: {String(selected.estado || "").toUpperCase()}
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.85 }}>
                      Progreso: {renderProgreso(selected)}
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.9 }}>
                        Inicio: {selected.hora_inicio || "—"}<br/>
                        Fin: {selected.hora_fin || "—"}<br/>
                        Toneladas: {selected.toneladas_reales ?? "—"}<br/>
                        Obs: {selected.observaciones || "—"}<br/>
                        Incidencias: {selected.incidencias_count ?? 0}
                    </div>
                  </Popup>
                </Marker>
              )}
            </MapContainer>
          </div>

          {!selected && (
            <div style={{ marginTop: 10, opacity: 0.85 }}>
              Seleccioná una recolección para verla en el mapa.
            </div>
          )}

          {selected && !isValidCoord(selected?.ubicacion?.lat, selected?.ubicacion?.lng) && (
            <div style={{ marginTop: 10, opacity: 0.85 }}>
              Esta recolección aún no tiene ubicación del camión (lat/lng). <br />
              Tip: usá <b>Simular +1</b> o <b>Auto</b> para que empiece a moverse.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function renderProgreso(x) {
  const p = Number(x.progreso?.punto_actual ?? 0);
  const t = Number(x.progreso?.total_puntos ?? 0);
  if (!t) return "—";
  const pct = Math.min(100, Math.max(0, Math.round((p / t) * 100)));
  return `${p}/${t} (${pct}%)`;
}

function isValidCoord(lat, lng) {
  const a = Number(lat);
  const b = Number(lng);
  return Number.isFinite(a) && Number.isFinite(b) && Math.abs(a) <= 90 && Math.abs(b) <= 180;
}

function EstadoBadge({ estado }) {
  const e = String(estado || "").toUpperCase();
  const bg =
    e === "EN_PROCESO"
      ? "rgba(59,130,246,0.18)"
      : e === "PROGRAMADA"
      ? "rgba(245,158,11,0.18)"
      : e === "FINALIZADA"
      ? "rgba(34,197,94,0.18)"
      : "rgba(239,68,68,0.18)";

  const br =
    e === "EN_PROCESO"
      ? "rgba(59,130,246,0.45)"
      : e === "PROGRAMADA"
      ? "rgba(245,158,11,0.45)"
      : e === "FINALIZADA"
      ? "rgba(34,197,94,0.45)"
      : "rgba(239,68,68,0.45)";

  return (
    <span
      style={{
        padding: "4px 10px",
        borderRadius: 999,
        border: `1px solid ${br}`,
        background: bg,
        fontWeight: 900,
        fontSize: 12,
      }}
    >
      {e || "—"}
    </span>
  );
}

const card = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: 14,
  padding: 14,
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: 8,
};

const th = {
  textAlign: "left",
  padding: "10px 8px",
  borderBottom: "1px solid rgba(255,255,255,0.12)",
  fontSize: 13,
  opacity: 0.9,
};

const td = {
  padding: "10px 8px",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  fontSize: 13,
  verticalAlign: "top",
};

const btn2 = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.2)",
  background: "transparent",
  color: "white",
  cursor: "pointer",
};

const miniBtn = {
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.2)",
  background: "transparent",
  color: "white",
  cursor: "pointer",
  fontWeight: 800,
};