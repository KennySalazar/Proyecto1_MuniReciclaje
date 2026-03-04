import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";

const ESTADOS_ASIGNACION = ["PROGRAMADA", "EN_PROCESO", "FINALIZADA", "CANCELADA"];

function toISODate(d) {
  if (!d) return "";
  
  return d;
}

export default function Asignaciones() {
  const [asigs, setAsigs] = useState([]);
  const [camiones, setCamiones] = useState([]);
  const [rutas, setRutas] = useState([]);
  const [conductores, setConductores] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  // form
  const [idCamion, setIdCamion] = useState("");
  const [idRuta, setIdRuta] = useState("");
  const [idConductor, setIdConductor] = useState("");
  const [fecha, setFecha] = useState(""); // YYYY-MM-DD
  const [estado, setEstado] = useState("ACTIVA");

  const [editingId, setEditingId] = useState(null);
  const isEditing = useMemo(() => editingId !== null, [editingId]);

  const loadAll = async () => {
    setLoading(true);
    setMsg("");
    try {
            const [a, c, r, u] = await Promise.all([
            api.get("/asignaciones"),
            api.get("/camiones"),
            api.get("/rutas"),
            api.get("/conductores"),
            ]);

      const aData = a.data?.data ?? a.data;
      const cData = c.data?.data ?? c.data;
      const rData = r.data?.data ?? r.data;
      const uData = u.data?.data ?? u.data;

      setAsigs(Array.isArray(aData) ? aData : []);
      setCamiones(Array.isArray(cData) ? cData : []);
      setRutas(Array.isArray(rData) ? rData : []);
      setConductores(Array.isArray(uData) ? uData : []);
    } catch (e) {
      setMsg(e?.response?.data?.message || "Error cargando datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const resetForm = () => {
    setIdCamion("");
    setIdRuta("");
    setIdConductor("");
    setFecha("");
    setEstado("ACTIVA");
    setEditingId(null);
  };

  const validate = () => {
    if (!idCamion) return "Seleccioná un camión";
    if (!idRuta) return "Seleccioná una ruta";
    if (!idConductor) return "Seleccioná un conductor";
    if (!fecha) return "Seleccioná fecha";
    if (!ESTADOS_ASIGNACION.includes(estado)) return "Estado inválido";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    const err = validate();
    if (err) return setMsg(err);

    setSaving(true);
    try {
      const payload = {
        id_camion: Number(idCamion),
        id_ruta: Number(idRuta),
        id_usuario_conductor: Number(idConductor),
        fecha: toISODate(fecha),
        estado,
      };

      if (isEditing) {
        await api.put(`/asignaciones/${editingId}`, payload);
        setMsg("Asignación actualizada");
      } else {
        await api.post("/asignaciones", payload);
        setMsg("Asignación creada");
      }

      resetForm();
      await loadAll();
      setTimeout(() => setMsg(""), 2000);
    } catch (e2) {
      setMsg(e2?.response?.data?.message || "Error guardando asignación");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (x) => {
    setEditingId(x.id);
    setIdCamion(String(x.id_camion ?? ""));
    setIdRuta(String(x.id_ruta ?? ""));
    setIdConductor(String(x.id_usuario_conductor ?? ""));
    setFecha(String(x.fecha ?? ""));
    setEstado(x.estado ?? "ACTIVA");
    setMsg("");
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar esta asignación?")) return;
    setMsg("");
    try {
      await api.delete(`/asignaciones/${id}`);
      setMsg("Asignación eliminada");
      await loadAll();
      setTimeout(() => setMsg(""), 2000);
    } catch (e) {
      setMsg(e?.response?.data?.message || "Error eliminando asignación");
    }
  };

  // helpers para mostrar nombres
  const camionLabel = (id) => {
    const c = camiones.find((x) => String(x.id) === String(id));
    if (!c) return `#${id}`;
    return `${c.placa} (${String(c.estado || "").replace("_", " ")})`;
  };

  const rutaLabel = (id) => {
    const r = rutas.find((x) => String(x.id) === String(id));
    return r ? r.nombre : `#${id}`;
  };

  const conductorLabel = (id) => {
    const u = conductores.find((x) => String(x.id) === String(id));
    return u ? (u.email ? `${u.nombre} (${u.email})` : u.nombre) : `#${id}`;
  };

  return (
    <div style={{ padding: 24, color: "white" }}>
      <h1 style={{ marginTop: 0 }}>Asignaciones</h1>
      <p style={{ opacity: 0.85 }}>
        Asigná un camión a una ruta y un conductor para una fecha.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "420px 1fr", gap: 16 }}>
        <div style={card}>
          <h3 style={{ marginTop: 0 }}>{isEditing ? "Editar asignación" : "Nueva asignación"}</h3>

          <form onSubmit={handleSubmit}>
            <label>Camión</label>
            <select style={inp} value={idCamion} onChange={(e) => setIdCamion(e.target.value)}>
              <option value="">-- Seleccioná --</option>
              {camiones.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.placa} — {String(c.estado || "").replace("_", " ")} — cap: {c.capacidad_carga}
                </option>
              ))}
            </select>

            <label>Ruta</label>
            <select style={inp} value={idRuta} onChange={(e) => setIdRuta(e.target.value)}>
              <option value="">-- Seleccioná --</option>
              {rutas.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombre}
                </option>
              ))}
            </select>

            <label>Conductor</label>
            <select style={inp} value={idConductor} onChange={(e) => setIdConductor(e.target.value)}>
              <option value="">-- Seleccioná --</option>
              {conductores.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre}{u.email ? ` — ${u.email}` : ""}
                </option>
              ))}
            </select>

            <label>Fecha</label>
            <input
              type="date"
              style={inp}
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />

            <label>Estado</label>
            <select style={inp} value={estado} onChange={(e) => setEstado(e.target.value)}>
              {ESTADOS_ASIGNACION.map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>

            <button type="submit" disabled={saving} style={btn}>
              {saving ? "Guardando..." : isEditing ? "Actualizar" : "Crear"}
            </button>

          </form>

          {msg && <div style={{ marginTop: 10, opacity: 0.95 }}>{msg}</div>}
        </div>

        <div style={card}>
          <h3 style={{ marginTop: 0 }}>Listado</h3>

          {loading ? (
            <div style={{ opacity: 0.85 }}>Cargando...</div>
          ) : asigs.length === 0 ? (
            <div style={{ opacity: 0.85 }}>No hay asignaciones.</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={table}>
                <thead>
                  <tr>
                    <th style={th}>ID</th>
                    <th style={th}>Camión</th>
                    <th style={th}>Ruta</th>
                    <th style={th}>Conductor</th>
                    <th style={th}>Fecha</th>
                    <th style={th}>Estado</th>
                    <th style={th}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {asigs.map((x) => (
                    <tr key={x.id}>
                      <td style={td}>{x.id}</td>
                      <td style={td}>{camionLabel(x.id_camion)}</td>
                      <td style={td}>{rutaLabel(x.id_ruta)}</td>
                      <td style={td}>{conductorLabel(x.id_usuario_conductor)}</td>
                      <td style={td}>{x.fecha}</td>
                      <td style={td}>{x.estado}</td>
                      <td style={td}>
                        <button style={miniBtn} onClick={() => handleEdit(x)}>
                          Editar
                        </button>
                        <button style={miniBtnDanger} onClick={() => handleDelete(x.id)}>
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

            </div>
          )}
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

const inp = {
  width: "100%",
  marginTop: 6,
  marginBottom: 10,
  padding: 10,
  borderRadius: 10,
  border: "1px solid rgba(3, 3, 3, 0.15)",
  background: "#ee4b0a", 
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


const table = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: 8,
};

const th = {
  textAlign: "left",
  padding: "10px 8px",
  borderBottom: "1px solid rgba(232, 248, 7, 0.91)",
  fontSize: 13,
  opacity: 0.9,
};

const td = {
  padding: "10px 8px",
  borderBottom: "1px solid rgba(228, 244, 15, 0.9)",
  fontSize: 13,
};

const miniBtn = {
  padding: "6px 10px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.2)",
  background: "transparent",
  color: "white",
  cursor: "pointer",
  marginRight: 8,
};

const miniBtnDanger = {
  ...miniBtn,
  border: "1px solid rgba(239,68,68,0.55)",
};