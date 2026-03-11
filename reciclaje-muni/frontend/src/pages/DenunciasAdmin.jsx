import { useEffect, useMemo, useState } from "react";
import {
  asignarCuadrillaDenuncia,
  cambiarEstadoDenuncia,
  getCatalogosDenuncia,
  getDenuncias,
  subirFotoDenuncia,
} from "../services/reciclaje.service";

function fotoUrl(path) {
  if (!path) return null;
  return `http://127.0.0.1:8000/storage/${path}`;
}

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


export default function DenunciasAdmin() {
  const [denuncias, setDenuncias] = useState([]);
  const [catalogos, setCatalogos] = useState({ estados: [], cuadrillas: [] });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploadingFoto, setUploadingFoto] = useState(false);

  const [filtroEstado, setFiltroEstado] = useState("TODAS");


  const [formAsignacion, setFormAsignacion] = useState({
    id_formulario: "",
    id_cuadrilla: "",
    fecha_programada: "",
    recursos_estimados: "",
    observacion: "",
  });

  const denunciaSeleccionada = useMemo(() => {
    return denuncias.find((d) => String(d.id) === String(formAsignacion.id_formulario)) || null;
  }, [denuncias, formAsignacion.id_formulario]);

  const denunciaCerrada = String(denunciaSeleccionada?.nombre_estado || "").toUpperCase() === "CERRADA";

  const load = async (silent = false) => {
    try {
      if (!silent) setLoading(true);

      const [r1, r2] = await Promise.all([
        getDenuncias(),
        getCatalogosDenuncia(),
      ]);

      setDenuncias(r1.data?.data ?? r1.data ?? []);
      setCatalogos(r2.data || { estados: [], cuadrillas: [] });

      if (!silent) setMsg("");
    } catch (err) {
      setMsg(err?.response?.data?.message || "No se pudo cargar la información");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(() => load(true), 5000);
    return () => clearInterval(t);
  }, []);

  const cambiarEstado = async (id, idEstado) => {
    const denuncia = denuncias.find((d) => d.id === id);
    if (String(denuncia?.nombre_estado || "").toUpperCase() === "CERRADA") {
      setMsg("La denuncia está cerrada y ya no puede cambiar de estado.");
      return;
    }

    try {
      await cambiarEstadoDenuncia(id, { id_estado_denuncia: Number(idEstado) });
      await load(true);
      setMsg("Estado actualizado");
    } catch (err) {
      setMsg(err?.response?.data?.message || "No se pudo actualizar el estado");
    }
  };

  const asignar = async (e) => {
    e.preventDefault();

    if (denunciaCerrada) {
      setMsg("No se puede asignar cuadrilla a una denuncia cerrada.");
      return;
    }

    try {
      await asignarCuadrillaDenuncia({
        ...formAsignacion,
        id_formulario: Number(formAsignacion.id_formulario),
        id_cuadrilla: Number(formAsignacion.id_cuadrilla),
      });

      setFormAsignacion({
        id_formulario: "",
        id_cuadrilla: "",
        fecha_programada: "",
        recursos_estimados: "",
        observacion: "",
      });

      await load(true);
      setMsg("Cuadrilla asignada");
    } catch (err) {
      setMsg(err?.response?.data?.message || "No se pudo asignar la cuadrilla");
    }
  };

  const handleSubirFoto = async (idFormulario, tipoFoto, file, estadoActual) => {
    if (!file) return;

    if (String(estadoActual || "").toUpperCase() === "CERRADA") {
      setMsg("La denuncia está cerrada y ya no permite subir nuevas fotos.");
      return;
    }

    try {
      setUploadingFoto(true);
      setMsg("");

      const fd = new FormData();
      fd.append("tipo_foto", tipoFoto);
      fd.append("foto", file);

      await subirFotoDenuncia(idFormulario, fd);
      await load(true);
      setMsg(`Foto ${tipoFoto.toLowerCase()} subida correctamente`);
    } catch (err) {
      setMsg(err?.response?.data?.message || "No se pudo subir la foto");
    } finally {
      setUploadingFoto(false);
    }
  };

  const denunciasFiltradas = useMemo(() => {
    let data = [...denuncias];

    if (filtroEstado !== "TODAS") {
      data = data.filter(
        (d) => String(d.nombre_estado || "").toUpperCase() === filtroEstado
      );
    }



    data.sort((a, b) => Number(b.id) - Number(a.id));
    return data;
  }, [denuncias, filtroEstado]);

  const resumenEstados = useMemo(() => {
    const base = {
      TOTAL: denuncias.length,
      RECIBIDA: 0,
      EN_REVISION: 0,
      ASIGNADA: 0,
      EN_ATENCION: 0,
      ATENDIDA: 0,
      CERRADA: 0,
    };

    denuncias.forEach((d) => {
      const e = String(d.nombre_estado || "").toUpperCase();
      if (base[e] !== undefined) base[e] += 1;
    });

    return base;
  }, [denuncias]);

  return (
    <div style={{ padding: 24, color: "white" }}>
      <div style={headerRow}>
        <div>
          <h1 style={{ marginTop: 0, marginBottom: 8 }}>Gestión de Denuncias</h1>
          <p style={{ opacity: 0.85, margin: 0 }}>
            Administrá estados, asignaciones de cuadrilla y evidencia fotográfica.
          </p>
        </div>

        <button onClick={() => load()} style={btnSecondary}>
          Refrescar
        </button>
      </div>

      {msg && <div style={msgBox}>{msg}</div>}
      {loading && <div style={{ marginBottom: 12 }}>Cargando denuncias...</div>}

      <div style={kpiGrid}>
        <KPI label="Total" value={resumenEstados.TOTAL} />
        <KPI label="Recibidas" value={resumenEstados.RECIBIDA} color="#3b82f6" />
        <KPI label="En revisión" value={resumenEstados.EN_REVISION} color="#f59e0b" />
        <KPI label="Asignadas" value={resumenEstados.ASIGNADA} color="#8b5cf6" />
        <KPI label="En atención" value={resumenEstados.EN_ATENCION} color="#f97316" />
        <KPI label="Atendidas" value={resumenEstados.ATENDIDA} color="#22c55e" />
        <KPI label="Cerradas" value={resumenEstados.CERRADA} color="#94a3b8" />
      </div>

      <div style={filterBar}>
        <select
          style={inpDark}
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <option value="TODAS">Todas las denuncias</option>
          <option value="RECIBIDA">Recibidas</option>
          <option value="EN_REVISION">En revisión</option>
          <option value="ASIGNADA">Asignadas</option>
          <option value="EN_ATENCION">En atención</option>
          <option value="ATENDIDA">Atendidas</option>
          <option value="CERRADA">Cerradas</option>
        </select>

      
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "420px 1fr", gap: 16 }}>
        <div style={card}>
          <h3 style={{ marginTop: 0 }}>Asignar cuadrilla</h3>

          <form onSubmit={asignar} style={{ display: "grid", gap: 10 }}>
            <select
              style={inp}
              value={formAsignacion.id_formulario}
              onChange={(e) =>
                setFormAsignacion({ ...formAsignacion, id_formulario: e.target.value })
              }
              required
            >
              <option value="">Seleccione denuncia</option>
              {denuncias
                .filter((d) => String(d.nombre_estado || "").toUpperCase() !== "CERRADA")
                .map((d) => (
                  <option key={d.id} value={d.id}>
                    Denuncia #{d.id} - {d.nombre_estado}
                  </option>
                ))}
            </select>

            <select
              style={inp}
              value={formAsignacion.id_cuadrilla}
              onChange={(e) =>
                setFormAsignacion({ ...formAsignacion, id_cuadrilla: e.target.value })
              }
              required
              disabled={denunciaCerrada}
            >
              <option value="">Seleccione cuadrilla</option>
              {catalogos.cuadrillas?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>

            <input
              style={inp}
              type="date"
              value={formAsignacion.fecha_programada}
              onChange={(e) =>
                setFormAsignacion({ ...formAsignacion, fecha_programada: e.target.value })
              }
              disabled={denunciaCerrada}
            />

            <input
              style={inp}
              placeholder="Recursos estimados"
              value={formAsignacion.recursos_estimados}
              onChange={(e) =>
                setFormAsignacion({ ...formAsignacion, recursos_estimados: e.target.value })
              }
              disabled={denunciaCerrada}
            />

            <input
              style={inp}
              placeholder="Observación"
              value={formAsignacion.observacion}
              onChange={(e) =>
                setFormAsignacion({ ...formAsignacion, observacion: e.target.value })
              }
              disabled={denunciaCerrada}
            />

            {denunciaSeleccionada && (
              <div style={infoMini}>
                <div><b>Denuncia:</b> #{denunciaSeleccionada.id}</div>
                <div><b>Estado actual:</b> {denunciaSeleccionada.nombre_estado}</div>
                {denunciaCerrada && (
                  <div style={{ color: "#fca5a5", marginTop: 6 }}>
                    Esta denuncia está cerrada y ya no admite asignaciones.
                  </div>
                )}
              </div>
            )}

            <button style={btn} disabled={denunciaCerrada}>
              Asignar cuadrilla
            </button>
          </form>
        </div>

        <div style={card}>
          <h3 style={{ marginTop: 0 }}>
            Denuncias registradas ({denunciasFiltradas.length})
          </h3>

          <div style={{ display: "grid", gap: 14 }}>
            {denunciasFiltradas.map((d) => {
              const cerrada = String(d.nombre_estado || "").toUpperCase() === "CERRADA";

              return (
                <div key={d.id} style={item}>
                  <div style={topDenuncia}>
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 900 }}>
                        Denuncia #{d.id}
                      </div>
                      <div style={{ opacity: 0.82, marginTop: 4 }}>
                        {d.fecha_denuncia}
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

                  <div style={detailGrid}>
                    <Info label="Ciudadano" value={`${d.nombre || "N/D"} ${d.apellido || ""}`} />
                    <Info label="Email" value={d.email || "N/D"} />
                    <Info label="Teléfono" value={d.telefono || "N/D"} />
                    <Info label="Tamaño" value={d.tamano || "N/D"} />
                    <Info label="Cuadrilla" value={d.cuadrilla || "Sin asignar"} />
                    <Info label="Fecha programada" value={d.fecha_programada || "No programada"} />
                    <Info label="Recursos" value={d.recursos_estimados || "N/D"} />
                    <Info label="Observación" value={d.observacion || "N/D"} />
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <b>Descripción</b>
                    <div style={descBox}>{d.descripcion || "Sin descripción"}</div>
                  </div>

                  <div style={photoGrid}>
                    <PhotoBlock title="Foto reportada por ciudadano" src={fotoUrl(d.foto_evidencia)} empty="Sin foto de evidencia" />
                    <PhotoUploadBlock
                      title="Foto antes"
                      src={fotoUrl(d.foto_antes)}
                      empty="Sin foto antes"
                      disabled={uploadingFoto || cerrada}
                      onChange={(file) => handleSubirFoto(d.id, "ANTES", file, d.nombre_estado)}
                    />
                    <PhotoUploadBlock
                      title="Foto después"
                      src={fotoUrl(d.foto_despues)}
                      empty="Sin foto después"
                      disabled={uploadingFoto || cerrada}
                      onChange={(file) => handleSubirFoto(d.id, "DESPUES", file, d.nombre_estado)}
                    />
                  </div>

                  <div style={{ marginTop: 14 }}>
                    <select
                      style={cerrada ? inpDisabled : inp}
                      defaultValue=""
                      disabled={cerrada}
                      onChange={(e) => {
                        if (e.target.value) cambiarEstado(d.id, e.target.value);
                      }}
                    >
                      <option value="">
                        {cerrada ? "Denuncia cerrada" : "Cambiar estado"}
                      </option>
                      {catalogos.estados
                        ?.filter((es) => String(es.nombre_estado || "").toUpperCase() !== "CERRADA" || !cerrada)
                        .map((es) => (
                          <option key={es.id} value={es.id}>
                            {es.nombre_estado}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              );
            })}

            {!loading && denunciasFiltradas.length === 0 && (
              <div style={emptyMini}>No hay denuncias para este filtro.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function KPI({ label, value, color = "#334155" }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.10)",
        borderTop: `4px solid ${color}`,
        borderRadius: 14,
        padding: 14,
      }}
    >
      <div style={{ opacity: 0.82, fontSize: 13 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 900, marginTop: 6 }}>{value}</div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div style={infoBox}>
      <div style={{ opacity: 0.7, fontSize: 12 }}>{label}</div>
      <div style={{ marginTop: 4, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function PhotoBlock({ title, src, empty }) {
  return (
    <div style={photoCard}>
      <b>{title}</b>
      {src ? (
        <img src={src} alt={title} style={imgStyle} />
      ) : (
        <div style={emptyMini}>{empty}</div>
      )}
    </div>
  );
}

function PhotoUploadBlock({ title, src, empty, disabled, onChange }) {
  return (
    <div style={photoCard}>
      <b>{title}</b>
      {src ? (
        <img src={src} alt={title} style={imgStyle} />
      ) : (
        <div style={emptyMini}>{empty}</div>
      )}

      <input
        type="file"
        accept="image/*"
        style={{ marginTop: 8 }}
        onChange={(e) => onChange(e.target.files?.[0] || null)}
        disabled={disabled}
      />
    </div>
  );
}

const headerRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
  marginBottom: 16,
};

const kpiGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(7, minmax(120px, 1fr))",
  gap: 12,
  marginBottom: 16,
};

const filterBar = {
  display: "grid",
  gridTemplateColumns: "260px 1fr",
  gap: 12,
  marginBottom: 16,
};

const card = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(221, 16, 16, 0.87)",
  borderRadius: 14,
  padding: 14,
};

const item = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(131, 238, 16, 0.94)",
  borderRadius: 14,
  padding: 16,
};

const topDenuncia = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 12,
  flexWrap: "wrap",
};

const detailGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 10,
  marginTop: 14,
};

const infoBox = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(232, 217, 13, 0.89)",
  borderRadius: 10,
  padding: 10,
};

const photoGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 12,
  marginTop: 14,
};

const photoCard = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 12,
  padding: 10,
};

const descBox = {
  marginTop: 8,
  padding: 12,
  borderRadius: 10,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.06)",
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

const inpDark = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255, 255, 255, 0.99)",
   background: "#ee4b0a",
  color: "white",
  outline: "none",
};

const inpDisabled = {
  ...inp,
  background: "rgba(148,163,184,0.30)",
  cursor: "not-allowed",
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

const msgBox = {
  marginBottom: 12,
  padding: "10px 12px",
  borderRadius: 10,
  background: "rgba(34,197,94,0.12)",
  border: "1px solid rgba(34,197,94,0.30)",
};

const imgStyle = {
  width: "100%",
  maxHeight: 220,
  objectFit: "cover",
  borderRadius: 10,
  marginTop: 8,
  display: "block",
};

const emptyMini = {
  marginTop: 8,
  padding: 10,
  borderRadius: 10,
  background: "rgba(255,255,255,0.04)",
  border: "1px dashed rgba(255,255,255,0.10)",
  opacity: 0.85,
};

const infoMini = {
  padding: 10,
  borderRadius: 10,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
};