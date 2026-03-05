import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";

const ESTADOS_CAMION = ["OPERATIVO", "MANTENIMIENTO", "FUERA_SERVICIO"];

export default function Camiones() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  // formulario
  const [placa, setPlaca] = useState("");
  const [capacidad, setCapacidad] = useState(""); 
  const [estado, setEstado] = useState("OPERATIVO");

  // edicion
  const [editingId, setEditingId] = useState(null);
  const isEditing = useMemo(() => editingId !== null, [editingId]);

  const load = async () => {
    setLoading(true);
    setMsg("");
    try {
      const { data } = await api.get("/camiones");
      setRows(Array.isArray(data) ? data : (data?.data ?? []));
    } catch (e) {
      setMsg(e?.response?.data?.message || "Error cargando camiones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setPlaca("");
    setCapacidad("");
    setEstado("OPERATIVO");
    setEditingId(null);
  };

  const validate = () => {
    if (!placa.trim()) return "La placa es requerida";
    if (placa.trim().length > 20) return "La placa no puede exceder 20 caracteres";
    const cap = Number(capacidad);
    if (!capacidad || Number.isNaN(cap) || cap <= 0) return "Capacidad debe ser un número > 0";
    if (!ESTADOS_CAMION.includes(estado)) return "Estado inválido";
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
        placa: placa.trim(),
        capacidad_carga: Number(capacidad),
        estado,
      };

      if (isEditing) {
        await api.put(`/camiones/${editingId}`, payload);
        setMsg("Camión actualizado");
      } else {
        await api.post("/camiones", payload);
        setMsg("Camión creado");
      }

      resetForm();
      await load();
      setTimeout(() => setMsg(""), 2000);
    } catch (e2) {
      const backendMsg = e2?.response?.data?.message;
      setMsg(backendMsg || "Error guardando camión");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (c) => {
    setEditingId(c.id);
    setPlaca(c.placa ?? "");
    setCapacidad(String(c.capacidad_carga ?? ""));
    setEstado(c.estado ?? "OPERATIVO");
    setMsg("");
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este camión?")) return;
    setMsg("");
    try {
      await api.delete(`/camiones/${id}`);
      setMsg("Camión eliminado");
      await load();
      setTimeout(() => setMsg(""), 2000);
    } catch (e) {
      setMsg(e?.response?.data?.message || "Error eliminando camión");
    }
  };

  return (
    <div style={{ padding: 24, color: "white" }}>
      <h1 style={{ marginTop: 0 }}>Camiones</h1>
      <p style={{ opacity: 0.85 }}>Registrá camiones recolectores y su estado.</p>

      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 16 }}>
        <div style={card}>
          <h3 style={{ marginTop: 0 }}>{isEditing ? "Editar camión" : "Nuevo camión"}</h3>

          <form onSubmit={handleSubmit}>
            <label>Placa/Identificador</label>
            <input
              style={inp}
              value={placa}
              onChange={(e) => setPlaca(e.target.value)}
              placeholder="P-123ABC"
              maxLength={20}
            />

            <label>Capacidad de carga</label>
            <input
              style={inp}
              value={capacidad}
              onChange={(e) => setCapacidad(e.target.value)}
              placeholder="Ej: 3.5"
              inputMode="decimal"
            />
            <div style={{ fontSize: 12, opacity: 0.8, marginTop: -6, marginBottom: 10 }}>
              (toneladas)
            </div>

            <label>Estado</label>
            <select style={inp} value={estado} onChange={(e) => setEstado(e.target.value)}>
              {ESTADOS_CAMION.map((x) => (
                <option key={x} value={x}>
                  {x.replace("_", " ")}
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
          ) : rows.length === 0 ? (
            <div style={{ opacity: 0.85 }}>No hay camiones registrados.</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={table}>
                <thead>
                  <tr>
                    <th style={th}>ID</th>
                    <th style={th}>Placa</th>
                    <th style={th}>Capacidad</th>
                    <th style={th}>Estado</th>
                    <th style={th}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((c) => (
                    <tr key={c.id}>
                      <td style={td}>{c.id}</td>
                      <td style={td}>{c.placa}</td>
                      <td style={td}>{c.capacidad_carga}</td>
                      <td style={td}>{String(c.estado || "").replace("_", " ")}</td>
                      <td style={td}>
                        <button style={miniBtn} onClick={() => handleEdit(c)}>
                          Editar
                        </button>
                        <button style={miniBtnDanger} onClick={() => handleDelete(c.id)}>
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
  border: "1px solid rgba(236, 11, 11, 0.88)",
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
  borderBottom: "1px solid rgba(247, 134, 5, 0.97)",
  fontSize: 13,
  opacity: 0.9,
};

const td = {
  padding: "10px 8px",
  borderBottom: "1px solid rgba(247, 134, 5, 0.97)",
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