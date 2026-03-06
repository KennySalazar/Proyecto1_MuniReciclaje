import { useEffect, useMemo, useState } from "react";
import {
  createVaciadoProgramado,
  getContenedores,
  getVaciadosProgramados,
  updateEstadoVaciado,
} from "../services/reciclaje.service";

export default function VaciadosProgramados() {
  const [contenedores, setContenedores] = useState([]);
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [puntoSeleccionado, setPuntoSeleccionado] = useState("");

  const [form, setForm] = useState({
    id_contenedor: "",
    hora_fecha: "",
    observacion: "",
  });

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const [r1, r2] = await Promise.all([
          getContenedores(),
          getVaciadosProgramados(),
        ]);

        if (!mounted) return;

        const conts = r1.data?.data ?? r1.data ?? [];
        const vaciados = r2.data?.data ?? r2.data ?? [];

        const contenedoresArr = Array.isArray(conts) ? conts : [];
        const vaciadosArr = Array.isArray(vaciados) ? vaciados : [];

        setContenedores(contenedoresArr);
        setItems(vaciadosArr);
        setMsg("");

        if (contenedoresArr.length > 0) {
          setPuntoSeleccionado(contenedoresArr[0]?.punto_verde ?? "");
        }
      } catch (err) {
        if (!mounted) return;
        setMsg(err?.response?.data?.message || "No se pudo cargar la información");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  const recargar = async () => {
    try {
      const [r1, r2] = await Promise.all([
        getContenedores(),
        getVaciadosProgramados(),
      ]);

      const conts = r1.data?.data ?? r1.data ?? [];
      const vaciados = r2.data?.data ?? r2.data ?? [];

      setContenedores(Array.isArray(conts) ? conts : []);
      setItems(Array.isArray(vaciados) ? vaciados : []);
    } catch (err) {
      setMsg(err?.response?.data?.message || "No se pudo cargar la información");
    }
  };

  const puntos = useMemo(() => {
    const unicos = [...new Set(contenedores.map((c) => c.punto_verde).filter(Boolean))];
    return unicos.sort((a, b) => a.localeCompare(b));
  }, [contenedores]);

  const contenedoresFiltrados = useMemo(() => {
    if (!puntoSeleccionado) return contenedores;
    return contenedores.filter((c) => c.punto_verde === puntoSeleccionado);
  }, [contenedores, puntoSeleccionado]);

  const vaciadosPendientes = useMemo(() => {
    return items.filter((v) => v.estado === "PENDIENTE");
  }, [items]);

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    setSaving(true);

    try {
      await createVaciadoProgramado({
        id_contenedor: Number(form.id_contenedor),
        hora_fecha: form.hora_fecha,
        observacion: form.observacion,
      });

      setForm({
        id_contenedor: "",
        hora_fecha: "",
        observacion: "",
      });

      await recargar();
      setMsg("Vaciado programado correctamente");
    } catch (err) {
      setMsg(err?.response?.data?.message || "No se pudo programar el vaciado");
    } finally {
      setSaving(false);
    }
  };

  const cambiarEstado = async (id, estado) => {
    setMsg("");

    try {
      await updateEstadoVaciado(id, { estado });
      await recargar();
      setMsg("Vaciado completado correctamente");
    } catch (err) {
      setMsg(err?.response?.data?.message || "No se pudo actualizar el estado");
    }
  };

  return (
    <div style={{ padding: 24, color: "white" }}>
      <h1 style={{ marginTop: 0 }}>Vaciados Programados</h1>
      {msg && <div style={{ marginBottom: 12 }}>{msg}</div>}
      {loading && <div style={{ marginBottom: 12 }}>Cargando información...</div>}

      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 16 }}>
        <div style={card}>
          <h3 style={{ marginTop: 0 }}>Programar vaciado</h3>

          <div style={{ marginBottom: 10 }}>
            <label style={label}>Punto de reciclaje</label>
            <select
              style={inp}
              value={puntoSeleccionado}
              onChange={(e) => {
                setPuntoSeleccionado(e.target.value);
                setForm({ ...form, id_contenedor: "" });
              }}
            >
              {puntos.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <select
              style={inp}
              value={form.id_contenedor}
              onChange={(e) => setForm({ ...form, id_contenedor: e.target.value })}
              required
            >
              <option value="">Seleccione contenedor</option>

              {contenedoresFiltrados.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre_tipo} ({c.porcentaje}%)
                </option>
              ))}
            </select>

            <input
              style={inp}
              type="datetime-local"
              value={form.hora_fecha}
              onChange={(e) => setForm({ ...form, hora_fecha: e.target.value })}
              required
            />

            <input
              style={inp}
              placeholder="Observación"
              value={form.observacion}
              onChange={(e) => setForm({ ...form, observacion: e.target.value })}
            />

            <button style={btn} disabled={saving || loading}>
              {saving ? "Programando..." : "Programar"}
            </button>
          </form>
        </div>

        <div style={card}>
          <h3 style={{ marginTop: 0 }}>Vaciados pendientes</h3>

          <div style={{ display: "grid", gap: 10 }}>
            {vaciadosPendientes.map((v) => (
              <div key={v.id} style={item}>
                <div><b>{v.punto_verde} - {v.nombre_tipo}</b></div>
                <div>Fecha: {v.hora_fecha}</div>
                <div>Estado: {v.estado}</div>
                <div>Responsable: {v.responsable || "N/D"}</div>
                <div>Observación: {v.observacion || "Sin observación"}</div>

                <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    style={btnMini}
                    onClick={() => cambiarEstado(v.id, "COMPLETADO")}
                  >
                    Completar
                  </button>
                </div>
              </div>
            ))}

            {!loading && vaciadosPendientes.length === 0 && (
              <div>No hay vaciados pendientes.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const card = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(235, 19, 19, 0.84)",
  borderRadius: 14,
  padding: 14,
};

const item = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(124, 242, 14, 0.73)",
  borderRadius: 10,
  padding: 10,
};

const label = {
  display: "block",
  marginBottom: 6,
  fontSize: 13,
  opacity: 0.9,
};

const inp = {
  width: "100%",
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
  cursor: "pointer",
  fontWeight: 900,
};

const btnMini = {
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(255,255,255,0.08)",
  color: "white",
  cursor: "pointer",
};