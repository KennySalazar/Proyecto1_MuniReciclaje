import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import {
  crearDenunciaCiudadana,
  getCatalogosDenuncia,
  getMisDenuncias,
} from "../services/reciclaje.service";

const selectedIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width:36px;height:36px;
      background:rgba(239,68,68,0.95);
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

function colorEstado(estado) {
  const e = String(estado || "").toUpperCase();
  if (e === "RECIBIDA") return "#3b82f6";
  if (e === "EN_REVISION") return "#f59e0b";
  if (e === "ASIGNADA") return "#8b5cf6";
  if (e === "EN_ATENCION") return "#f97316";
  if (e === "ATENDIDA") return "#22c55e";
  if (e === "CERRADA") return "#94a3b8";
  return "#64748b";
}

function textoTamano(valor) {
  const v = String(valor || "").toUpperCase();
  if (v === "PEQUENO") return "PEQUEÑO";
  if (v === "MEDIANO") return "MEDIANO";
  if (v === "GRANDE") return "GRANDE";
  return valor || "N/D";
}

function fotoUrl(path) {
  if (!path) return null;
  return `http://127.0.0.1:8000/storage/${path}`;
}

function ClickMap({ onPick }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onPick({
        latitud: lat.toFixed(6),
        longitud: lng.toFixed(6),
      });
    },
  });
  return null;
}

export default function DenunciaCiudadana() {
  const navigate = useNavigate();

  const [catalogos, setCatalogos] = useState({ tamanos: [], zonas: [] });
  const [misDenuncias, setMisDenuncias] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    descripcion: "",
    id_tamano_basurero: "",
    id_zona: "",
    latitud: "",
    longitud: "",
    foto: null,
  });

  const fotoPreview = useMemo(() => {
    if (!form.foto) return null;
    return URL.createObjectURL(form.foto);
  }, [form.foto]);

  useEffect(() => {
    return () => {
      if (fotoPreview) URL.revokeObjectURL(fotoPreview);
    };
  }, [fotoPreview]);

  const load = async () => {
    try {
      const [r1, r2] = await Promise.all([
        getCatalogosDenuncia(),
        getMisDenuncias(),
      ]);

      setCatalogos(r1.data || { tamanos: [], zonas: [] });
      setMisDenuncias(r2.data?.data ?? r2.data ?? []);
      setMsg("");
    } catch (err) {
      setMsg(err?.response?.data?.message || "No se pudo cargar la información");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("descripcion", form.descripcion);
      fd.append("id_tamano_basurero", form.id_tamano_basurero);
      fd.append("id_zona", form.id_zona);
      fd.append("latitud", form.latitud);
      fd.append("longitud", form.longitud);

      if (form.foto) {
        fd.append("foto", form.foto);
      }

      await crearDenunciaCiudadana(fd);

      setForm({
        descripcion: "",
        id_tamano_basurero: "",
        id_zona: "",
        latitud: "",
        longitud: "",
        foto: null,
      });

      await load();
      setMsg("Denuncia registrada correctamente");
    } catch (err) {
      setMsg(err?.response?.data?.message || "No se pudo registrar la denuncia");
    } finally {
      setLoading(false);
    }
  };

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
            <h1 style={{ margin: 0 }}>Denuncias Ciudadanas</h1>
            <p style={{ opacity: 0.85, marginTop: 8 }}>
              Registrá basureros clandestinos y consultá el estado de tus denuncias.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/ciudadano/dashboard")}
            style={btnSecondary}
          >
            Volver al panel ciudadano
          </button>
        </div>

        {msg && <div style={msgBox}>{msg}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "430px 1fr", gap: 16 }}>
          <div style={card}>
            <h3 style={{ marginTop: 0 }}>Nueva denuncia</h3>

            <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
              <textarea
                style={{ ...inp, minHeight: 110, resize: "vertical" }}
                placeholder="Descripción del problema"
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                required
              />

              <select
                style={inp}
                value={form.id_tamano_basurero}
                onChange={(e) => setForm({ ...form, id_tamano_basurero: e.target.value })}
                required
              >
                <option value="">Seleccione tamaño del basurero</option>
                {catalogos.tamanos?.map((t) => (
                  <option key={t.id} value={t.id}>
                    {textoTamano(t.tipo_nombre)}
                  </option>
                ))}
              </select>

              <select
                style={inp}
                value={form.id_zona}
                onChange={(e) => setForm({ ...form, id_zona: e.target.value })}
                required
              >
                <option value="">Seleccione la zona</option>
                {catalogos.zonas?.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.nombre}
                  </option>
                ))}
              </select>

              <div style={mapHelpBox}>
                Hacé clic en el mapa para seleccionar la ubicación del basurero clandestino.
              </div>

              <input
                style={inp}
                type="number"
                step="0.000001"
                placeholder="Latitud"
                value={form.latitud}
                onChange={(e) => setForm({ ...form, latitud: e.target.value })}
                required
              />

              <input
                style={inp}
                type="number"
                step="0.000001"
                placeholder="Longitud"
                value={form.longitud}
                onChange={(e) => setForm({ ...form, longitud: e.target.value })}
                required
              />

              <input
                style={inp}
                type="file"
                accept="image/*"
                onChange={(e) => setForm({ ...form, foto: e.target.files?.[0] || null })}
              />

              {fotoPreview && (
                <div style={previewWrap}>
                  <img src={fotoPreview} alt="Vista previa" style={previewImg} />
                </div>
              )}

              <button style={btn} disabled={loading}>
                {loading ? "Guardando..." : "Enviar denuncia"}
              </button>
            </form>
          </div>

          <div style={card}>
            <h3 style={{ marginTop: 0 }}>Ubicación del basurero</h3>

            <div style={{ height: 360, borderRadius: 14, overflow: "hidden" }}>
              <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />

                <ClickMap
                  onPick={({ latitud, longitud }) =>
                    setForm((prev) => ({ ...prev, latitud, longitud }))
                  }
                />

                {form.latitud && form.longitud && (
                  <Marker
                    position={[Number(form.latitud), Number(form.longitud)]}
                    icon={selectedIcon}
                  >
                    <Popup>
                      Ubicación seleccionada
                      <br />
                      {form.latitud}, {form.longitud}
                    </Popup>
                  </Marker>
                )}
              </MapContainer>
            </div>

            {form.latitud && form.longitud && (
              <div style={{ marginTop: 12, fontSize: 13, opacity: 0.9 }}>
                Coordenadas seleccionadas: <b>{form.latitud}, {form.longitud}</b>
              </div>
            )}

            {form.id_zona && (
              <div style={{ marginTop: 8, fontSize: 13, opacity: 0.9 }}>
                Zona seleccionada:{" "}
                <b>
                  {catalogos.zonas?.find((z) => String(z.id) === String(form.id_zona))?.nombre || "N/D"}
                </b>
              </div>
            )}

            <div style={{ marginTop: 18 }}>
              <h3 style={{ marginTop: 0 }}>Mis denuncias</h3>

              <div style={{ display: "grid", gap: 10 }}>
                {misDenuncias.map((d) => (
                  <div key={d.id} style={item}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 900, fontSize: 17 }}>
                          Denuncia #{d.id}
                        </div>

                        <div style={{ marginTop: 6, opacity: 0.9 }}>
                          Tamaño: <b>{textoTamano(d.tamano) || "N/D"}</b>
                        </div>

                        <div style={{ opacity: 0.9 }}>
                          Fecha: <b>{d.fecha_denuncia}</b>
                        </div>

                        <div style={{ opacity: 0.9 }}>
                          Ubicación: <b>{d.latitud}, {d.longitud}</b>
                        </div>

                        <div style={{ opacity: 0.9 }}>
                          Cuadrilla asignada: <b>{d.cuadrilla || "Sin asignar"}</b>
                        </div>

                        <div style={{ opacity: 0.9 }}>
                          Fecha programada: <b>{d.fecha_programada || "No programada"}</b>
                        </div>
                      </div>

                      <div
                        style={{
                          background: colorEstado(d.nombre_estado),
                          color: "white",
                          padding: "8px 12px",
                          borderRadius: 999,
                          fontWeight: 800,
                          fontSize: 12,
                        }}
                      >
                        {d.nombre_estado}
                      </div>
                    </div>

                    {d.foto_evidencia && (
                      <div style={{ marginTop: 10 }}>
                        <div style={fotoTitle}>Foto reportada</div>
                        <img
                          src={fotoUrl(d.foto_evidencia)}
                          alt="Foto evidencia"
                          style={previewImg}
                        />
                      </div>
                    )}

                    <div style={{ marginTop: 10, opacity: 0.95 }}>
                      {d.descripcion}
                    </div>
                  </div>
                ))}

                {misDenuncias.length === 0 && (
                  <div style={emptyBox}>
                    No tienes denuncias registradas.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const card = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(221, 12, 12, 0.82)",
  borderRadius: 16,
  padding: 16,
};

const item = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(202, 240, 12, 0.89)",
  borderRadius: 12,
  padding: 12,
};

const emptyBox = {
  background: "rgba(255,255,255,0.04)",
  border: "1px dashed rgba(133, 225, 12, 0.12)",
  borderRadius: 12,
  padding: 14,
  opacity: 0.9,
};

const msgBox = {
  marginBottom: 14,
  padding: "12px 14px",
  borderRadius: 12,
  background: "rgba(34,197,94,0.12)",
  border: "1px solid rgba(34,197,94,0.30)",
};

const mapHelpBox = {
  padding: "10px 12px",
  borderRadius: 10,
  background: "rgba(59,130,246,0.12)",
  border: "1px solid rgba(59, 131, 246, 0.84)",
  fontSize: 13,
};

const previewWrap = {
  padding: 8,
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(181, 230, 20, 0.92)",
};

const previewImg = {
  width: "100%",
  maxHeight: 220,
  objectFit: "cover",
  borderRadius: 10,
  display: "block",
};

const fotoTitle = {
  fontWeight: 700,
  marginBottom: 6,
};

const inp = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.15)",
  background: "#ee4b0a",
  color: "white",
  outline: "none",
};

const btn = {
  padding: "12px 14px",
  borderRadius: 12,
  border: "none",
  background: "#22c55e",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
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