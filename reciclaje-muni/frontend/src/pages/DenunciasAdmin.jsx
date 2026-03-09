import { useEffect, useState } from "react";
import {
  asignarCuadrillaDenuncia,
  cambiarEstadoDenuncia,
  getCatalogosDenuncia,
  getDenuncias,
} from "../services/reciclaje.service";

export default function DenunciasAdmin() {
  const [denuncias, setDenuncias] = useState([]);
  const [catalogos, setCatalogos] = useState({ estados: [], cuadrillas: [] });
  const [msg, setMsg] = useState("");

  const [formAsignacion, setFormAsignacion] = useState({
    id_formulario: "",
    id_cuadrilla: "",
    fecha_programada: "",
    recursos_estimados: "",
    observacion: "",
  });

  const load = async () => {
    try {
      const [r1, r2] = await Promise.all([
        getDenuncias(),
        getCatalogosDenuncia(),
      ]);

      setDenuncias(r1.data?.data ?? r1.data ?? []);
      setCatalogos(r2.data || { estados: [], cuadrillas: [] });
    } catch (err) {
      setMsg(err?.response?.data?.message || "No se pudo cargar la información");
    }
  };

  useEffect(() => {
  const t = setInterval(() => load(true), 3000);
    return () => clearInterval(t);
  }, []);

  const cambiarEstado = async (id, idEstado) => {
    try {
      await cambiarEstadoDenuncia(id, { id_estado_denuncia: Number(idEstado) });
      await load();
      setMsg("***Estado actualizado***");
    } catch (err) {
      setMsg(err?.response?.data?.message || "No se pudo actualizar el estado");
    }
  };

  const asignar = async (e) => {
    e.preventDefault();

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

      await load();
      setMsg("****Cuadrilla asignada****");
    } catch (err) {
      setMsg(err?.response?.data?.message || "No se pudo asignar la cuadrilla");
    }
  };

  return (
    <div style={{ padding: 24, color: "white" }}>
      <h1>Gestión de Denuncias</h1>
      {msg && <div style={{ marginBottom: 12 }}>{msg}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "420px 1fr", gap: 16 }}>
        <div style={card}>
          <h3>Asignar cuadrilla</h3>

          <form onSubmit={asignar} style={{ display: "grid", gap: 10 }}>
            <select
              style={inp}
              value={formAsignacion.id_formulario}
              onChange={(e) => setFormAsignacion({ ...formAsignacion, id_formulario: e.target.value })}
              required
            >
              <option value="">Seleccione denuncia</option>
              {denuncias.map((d) => (
                <option key={d.id} value={d.id}>
                  Denuncia #{d.id}
                </option>
              ))}
            </select>

            <select
              style={inp}
              value={formAsignacion.id_cuadrilla}
              onChange={(e) => setFormAsignacion({ ...formAsignacion, id_cuadrilla: e.target.value })}
              required
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
              onChange={(e) => setFormAsignacion({ ...formAsignacion, fecha_programada: e.target.value })}
            />

            <input
              style={inp}
              placeholder="Recursos estimados"
              value={formAsignacion.recursos_estimados}
              onChange={(e) => setFormAsignacion({ ...formAsignacion, recursos_estimados: e.target.value })}
            />

            <input
              style={inp}
              placeholder="Observación"
              value={formAsignacion.observacion}
              onChange={(e) => setFormAsignacion({ ...formAsignacion, observacion: e.target.value })}
            />

            <button style={btn}>Asignar cuadrilla</button>
          </form>
        </div>

        <div style={card}>
          <h3>Denuncias registradas</h3>

          <div style={{ display: "grid", gap: 10 }}>
            {denuncias.map((d) => (
              <div key={d.id} style={item}>
                <div><b>Denuncia #{d.id}</b></div>
                <div>Estado actual: {d.nombre_estado}</div>
                <div>Ciudadano: {d.nombre || "N/D"} {d.apellido || ""}</div>
                <div>Email: {d.email || "N/D"}</div>
                <div>Teléfono: {d.telefono || "N/D"}</div>
                <div>Tamaño: {d.tamano || "N/D"}</div>
                <div>Fecha: {d.fecha_denuncia}</div>
                <div>Descripción: {d.descripcion}</div>
                <div>Cuadrilla asignada: {d.cuadrilla || "Sin asignar"}</div>
                <div>Fecha programada: {d.fecha_programada || "No programada"}</div>
                <div>Recursos estimados: {d.recursos_estimados || "N/D"}</div>
                <div>Observación: {d.observacion || "N/D"}</div>

                <div style={{ marginTop: 10 }}>
                  <select
                    style={inp}
                    value={d.nombre_estado || ""}
                    onChange={(e) => {
                      if (e.target.value) cambiarEstado(d.id, e.target.value);
                    }}
                  >
                    <option value="">Cambiar estado</option>
                    {catalogos.estados?.map((es) => (
                      <option key={es.id} value={es.id}>
                        {es.nombre_estado}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}

            {denuncias.length === 0 && <div>No hay denuncias registradas.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

const card = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: 14,
  padding: 14,
};

const item = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 10,
  padding: 10,
};

const inp = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.15)",
  background: "rgba(0,0,0,0.22)",
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