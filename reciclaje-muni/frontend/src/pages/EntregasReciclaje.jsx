import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import {
  createEntregaReciclaje,
  getContenedores,
  getEntregasReciclaje,
  getPuntosVerdes,
  getTiposMaterial,
} from "../services/reciclaje.service";

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

const selectedIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width:36px;height:36px;
      background:rgba(59,130,246,0.95);
      border:3px solid rgba(255,255,255,0.95);
      border-radius:999px;
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 8px 20px rgba(0,0,0,0.35);
      font-size:18px;
    ">📍</div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -30],
});

function isValidCoord(lat, lng) {
  const a = Number(lat);
  const b = Number(lng);
  return Number.isFinite(a) && Number.isFinite(b) && Math.abs(a) <= 90 && Math.abs(b) <= 180;
}

function FocusMap({ punto }) {
  const map = useMap();

  useEffect(() => {
    if (!punto) return;
    if (!isValidCoord(punto.latitud, punto.longitud)) return;

    map.setView([Number(punto.latitud), Number(punto.longitud)], 16);
  }, [punto, map]);

  return null;
}

function colorPorcentaje(p) {
  const n = Number(p || 0);
  if (n >= 100) return "#ef4444";
  if (n >= 90) return "#f97316";
  if (n >= 75) return "#eab308";
  return "#22c55e";
}

function textoEstado(p) {
  const n = Number(p || 0);
  if (n >= 100) return "Lleno";
  if (n >= 90) return "Urgente";
  if (n >= 75) return "Alerta";
  return "Disponible";
}

export default function EntregasReciclaje() {
  const [puntos, setPuntos] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [entregas, setEntregas] = useState([]);
  const [contenedores, setContenedores] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    id_punto_reciclaje: "",
    id_tipo_material: "",
    cantidad: "",
    fecha_entrega: new Date().toISOString().slice(0, 10),
    hora_entrega: new Date().toTimeString().slice(0, 5),
    nombre_ciudadano: "",
  });

  const load = async () => {
    try {
      const [r1, r2, r3, r4] = await Promise.all([
        getPuntosVerdes(),
        getTiposMaterial(),
        getEntregasReciclaje(),
        getContenedores(),
      ]);

      setPuntos(r1.data?.data ?? r1.data ?? []);
      setTipos(r2.data?.data ?? r2.data ?? []);
      setEntregas(r3.data?.data ?? r3.data ?? []);
      setContenedores(r4.data?.data ?? r4.data ?? []);
    } catch (err) {
      setMsg(err?.response?.data?.message || "No se pudo cargar la información");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const puntoSeleccionado = useMemo(() => {
    return puntos.find((p) => Number(p.id) === Number(form.id_punto_reciclaje)) || null;
  }, [puntos, form.id_punto_reciclaje]);

  const contenedorSeleccionado = useMemo(() => {
    return (
      contenedores.find(
        (c) =>
          Number(c.id_punto_reciclaje) === Number(form.id_punto_reciclaje) &&
          Number(c.id_tipo_material) === Number(form.id_tipo_material)
      ) || null
    );
  }, [contenedores, form.id_punto_reciclaje, form.id_tipo_material]);

  const contenedorLleno = useMemo(() => {
    return Number(contenedorSeleccionado?.porcentaje || 0) >= 100;
  }, [contenedorSeleccionado]);

  const espacioDisponibleM3 = useMemo(() => {
    if (!contenedorSeleccionado) return 0;

    return Math.max(
      Number(contenedorSeleccionado.capacidad_m3 || 0) -
        Number(contenedorSeleccionado.nivel_actual || 0),
      0
    );
  }, [contenedorSeleccionado]);

  const maxKgPermitido = useMemo(() => {
    if (!contenedorSeleccionado) return 0;

    const factor = Number(contenedorSeleccionado.factor_kg_m3 || 0);
    if (factor <= 0) return 0;

    return espacioDisponibleM3 / factor;
  }, [contenedorSeleccionado, espacioDisponibleM3]);

  const cantidadIngresada = Number(form.cantidad || 0);

  const excedeCapacidad = useMemo(() => {
    if (!contenedorSeleccionado || !cantidadIngresada) return false;
    return cantidadIngresada > maxKgPermitido;
  }, [contenedorSeleccionado, cantidadIngresada, maxKgPermitido]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    if (!contenedorSeleccionado) {
      setLoading(false);
      return setMsg("No existe contenedor configurado para ese punto verde y tipo de material.");
    }

    if (contenedorLleno) {
      setLoading(false);
      return setMsg("Ese contenedor ya está lleno. Debe vaciarse antes de registrar más material.");
    }

    if (excedeCapacidad) {
      setLoading(false);
      return setMsg(
        `La cantidad ingresada supera la capacidad del contenedor. Máximo permitido: ${maxKgPermitido.toFixed(2)} kg.`
      );
    }

    try {
      await createEntregaReciclaje({
        ...form,
        id_punto_reciclaje: Number(form.id_punto_reciclaje),
        id_tipo_material: Number(form.id_tipo_material),
        cantidad: Number(form.cantidad),
      });

      setForm({
        id_punto_reciclaje: "",
        id_tipo_material: "",
        cantidad: "",
        fecha_entrega: new Date().toISOString().slice(0, 10),
        hora_entrega: new Date().toTimeString().slice(0, 5),
        nombre_ciudadano: "",
      });

      await load();
      setMsg("Entrega registrada correctamente");
    } catch (err) {
      setMsg(err?.response?.data?.message || "No se pudo registrar la entrega");
    } finally {
      setLoading(false);
    }
  };

  const center = useMemo(() => [14.834, -91.518], []);

  return (
    <div style={{ padding: 24, color: "white" }}>
      <h1 style={{ marginTop: 0 }}>Registro de Entregas</h1>
      <p style={{ opacity: 0.85 }}>
        Registrá entregas de material reciclable y visualizá el punto verde seleccionado.
      </p>

      {msg && <div style={{ marginBottom: 12 }}>{msg}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 16 }}>
        <div style={card}>
          <h3 style={{ marginTop: 0 }}>Registrar entrega</h3>

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <select
              style={inp}
              value={form.id_punto_reciclaje}
              onChange={(e) =>
                setForm({
                  ...form,
                  id_punto_reciclaje: e.target.value,
                  id_tipo_material: "",
                  cantidad: "",
                })
              }
              required
            >
              <option value="">Seleccione punto verde</option>
              {puntos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>

            <select
              style={inp}
              value={form.id_tipo_material}
              onChange={(e) =>
                setForm({
                  ...form,
                  id_tipo_material: e.target.value,
                  cantidad: "",
                })
              }
              required
            >
              <option value="">Seleccione tipo de material</option>
              {tipos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre_tipo}
                </option>
              ))}
            </select>

            {form.id_punto_reciclaje && form.id_tipo_material && (
              <div
                style={{
                  ...estadoBox,
                  borderColor: contenedorSeleccionado
                    ? colorPorcentaje(contenedorSeleccionado?.porcentaje)
                    : "rgba(255,255,255,0.12)",
                }}
              >
                {!contenedorSeleccionado ? (
                  <div>No existe contenedor para ese punto y material.</div>
                ) : (
                  <>
                    <div>
                      Estado del contenedor:{" "}
                      <b style={{ color: colorPorcentaje(contenedorSeleccionado?.porcentaje) }}>
                        {textoEstado(contenedorSeleccionado?.porcentaje)}
                      </b>
                    </div>

                    <div>
                      Nivel actual:{" "}
                      <b>{Number(contenedorSeleccionado?.nivel_actual || 0).toFixed(2)}</b> m³
                    </div>

                    <div>
                      Capacidad:{" "}
                      <b>{Number(contenedorSeleccionado?.capacidad_m3 || 0).toFixed(2)}</b> m³
                    </div>

                    <div>
                      Porcentaje:{" "}
                      <b>{Number(contenedorSeleccionado?.porcentaje || 0).toFixed(2)}%</b>
                    </div>

                    <div>
                      Espacio disponible: <b>{espacioDisponibleM3.toFixed(2)}</b> m³
                    </div>

                    <div>
                      Máximo permitido para este material:{" "}
                      <b>{maxKgPermitido.toFixed(2)}</b> kg
                    </div>

                    {contenedorLleno && (
                      <div style={{ marginTop: 6, color: "#fca5a5", fontWeight: 700 }}>
                        Este contenedor ya está lleno. Debe vaciarse antes de registrar más material.
                      </div>
                    )}

                    {excedeCapacidad && !contenedorLleno && (
                      <div style={{ marginTop: 6, color: "#fca5a5", fontWeight: 700 }}>
                        La cantidad ingresada supera lo que el contenedor puede almacenar.
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            <input
              style={{
                ...inp,
                opacity: contenedorLleno ? 0.6 : 1,
              }}
              type="number"
              step="0.01"
              placeholder="Cantidad (kg)"
              value={form.cantidad}
              onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
              required
              disabled={contenedorLleno || !contenedorSeleccionado}
            />

            <input
              style={inp}
              type="date"
              value={form.fecha_entrega}
              onChange={(e) => setForm({ ...form, fecha_entrega: e.target.value })}
              required
            />

            <input
              style={inp}
              type="time"
              value={form.hora_entrega}
              onChange={(e) => setForm({ ...form, hora_entrega: e.target.value })}
            />

            <input
              style={{
                ...inp,
                opacity: contenedorLleno ? 0.6 : 1,
              }}
              placeholder="Nombre del ciudadano"
              value={form.nombre_ciudadano}
              onChange={(e) => setForm({ ...form, nombre_ciudadano: e.target.value })}
              required
              disabled={contenedorLleno || !contenedorSeleccionado}
            />

            <button
              style={{
                ...btn,
                opacity:
                  contenedorLleno || !contenedorSeleccionado || excedeCapacidad ? 0.6 : 1,
                cursor:
                  contenedorLleno || !contenedorSeleccionado || excedeCapacidad
                    ? "not-allowed"
                    : "pointer",
              }}
              disabled={loading || contenedorLleno || !contenedorSeleccionado || excedeCapacidad}
            >
              {loading ? "Guardando..." : "Registrar entrega"}
            </button>
          </form>
        </div>

        <div style={card}>
          <h3 style={{ marginTop: 0 }}>Mapa del punto verde</h3>

          <div style={{ height: 360, borderRadius: 14, overflow: "hidden" }}>
            <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />

              <FocusMap punto={puntoSeleccionado} />

              {puntos
                .filter((p) => isValidCoord(p.latitud, p.longitud))
                .map((p) => {
                  const selected = Number(p.id) === Number(form.id_punto_reciclaje);

                  return (
                    <Marker
                      key={p.id}
                      position={[Number(p.latitud), Number(p.longitud)]}
                      icon={selected ? selectedIcon : greenIcon}
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
                  );
                })}
            </MapContainer>
          </div>

          {puntoSeleccionado && (
            <div style={{ marginTop: 12, fontSize: 13, opacity: 0.9 }}>
              Punto seleccionado: <b>{puntoSeleccionado.nombre}</b>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 16, ...card }}>
        <h3 style={{ marginTop: 0 }}>Historial de entregas</h3>

        <div style={{ display: "grid", gap: 10 }}>
          {entregas.map((e) => (
            <div key={e.id} style={item}>
              <div><b>{e.nombre_ciudadano}</b></div>
              <div>Punto verde: {e.punto_verde}</div>
              <div>Tipo de material: {e.nombre_tipo}</div>
              <div>Cantidad: {e.cantidad} kg</div>
              <div>Fecha: {e.fecha_entrega} {e.hora_entrega || ""}</div>
              <div>Operador: {e.operador || "N/D"}</div>
            </div>
          ))}

          {entregas.length === 0 && <div>No hay entregas registradas.</div>}
        </div>
      </div>
    </div>
  );
}

const card = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(237, 13, 13, 0.92)",
  borderRadius: 14,
  padding: 14,
};

const item = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(165, 245, 17, 0.85)",
  borderRadius: 10,
  padding: 10,
};

const estadoBox = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.15)",
  background: "rgba(255,255,255,0.04)",
  fontSize: 13,
  lineHeight: 1.5,
};

const inp = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.15)",
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
  fontWeight: 900,
};