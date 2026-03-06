import { useEffect, useMemo, useState } from "react";
import { getContenedores } from "../services/reciclaje.service";

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

export default function ContenedoresEstado() {
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [puntoSeleccionado, setPuntoSeleccionado] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const r = await getContenedores();
        if (!mounted) return;

        const data = r.data?.data ?? r.data ?? [];
        const arr = Array.isArray(data) ? data : [];

        setItems(arr);
        setMsg("");

        if (arr.length > 0) {
          const primerPunto = arr[0]?.punto_verde ?? "";
          setPuntoSeleccionado(primerPunto);
        }
      } catch (err) {
        if (!mounted) return;
        setMsg(err?.response?.data?.message || "No se pudieron cargar los contenedores");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  const puntos = useMemo(() => {
    const unicos = [...new Set(items.map((x) => x.punto_verde).filter(Boolean))];
    return unicos.sort((a, b) => a.localeCompare(b));
  }, [items]);

  const filtrados = useMemo(() => {
    if (!puntoSeleccionado) return items;
    return items.filter((x) => x.punto_verde === puntoSeleccionado);
  }, [items, puntoSeleccionado]);

  const resumen = useMemo(() => {
    const total = filtrados.length;
    const llenos = filtrados.filter((c) => Number(c.porcentaje || 0) >= 100).length;
    const urgentes = filtrados.filter((c) => {
      const n = Number(c.porcentaje || 0);
      return n >= 90 && n < 100;
    }).length;
    const alertas = filtrados.filter((c) => {
      const n = Number(c.porcentaje || 0);
      return n >= 75 && n < 90;
    }).length;

    return { total, llenos, urgentes, alertas };
  }, [filtrados]);

  return (
    <div style={{ padding: 24, color: "white" }}>
      <h1 style={{ marginTop: 0 }}>Estado de Contenedores</h1>

      {msg && <div style={{ marginBottom: 12 }}>{msg}</div>}
      {loading && <div style={{ marginBottom: 12 }}>Cargando contenedores...</div>}

      <div style={{ ...card, marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 16, alignItems: "end" }}>
          <div>
            <label style={label}>Punto de reciclaje</label>
            <select
              style={inp}
              value={puntoSeleccionado}
              onChange={(e) => setPuntoSeleccionado(e.target.value)}
            >
              {puntos.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={chip}>Total: <b>{resumen.total}</b></div>
            <div style={chip}>Alerta 75%: <b>{resumen.alertas}</b></div>
            <div style={chip}>Urgente 90%: <b>{resumen.urgentes}</b></div>
            <div style={chip}>Llenos: <b>{resumen.llenos}</b></div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {filtrados.map((c) => {
          const porcentaje = Number(c.porcentaje || 0);

          return (
            <div key={c.id} style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 20 }}>
                    {c.nombre_tipo}
                  </div>

                  <div style={{ marginTop: 8, opacity: 0.92 }}>
                    Punto verde: <b>{c.punto_verde}</b>
                  </div>

                  <div style={{ opacity: 0.92 }}>
                    Nivel actual: <b>{Number(c.nivel_actual || 0).toFixed(2)}</b> m³
                  </div>

                  <div style={{ opacity: 0.92 }}>
                    Capacidad: <b>{Number(c.capacidad_m3 || 0).toFixed(2)}</b> m³
                  </div>

                  <div style={{ opacity: 0.92 }}>
                    Porcentaje: <b>{porcentaje.toFixed(2)}%</b>
                  </div>

                </div>

                <div
                  style={{
                    alignSelf: "flex-start",
                    padding: "8px 12px",
                    borderRadius: 999,
                    background: colorPorcentaje(porcentaje),
                    color: "white",
                    fontWeight: 900,
                    fontSize: 13,
                  }}
                >
                  {textoEstado(porcentaje)}
                </div>
              </div>

              <div style={barWrap}>
                <div
                  style={{
                    ...barFill,
                    width: `${Math.min(porcentaje, 100)}%`,
                    background: colorPorcentaje(porcentaje),
                  }}
                />
              </div>
            </div>
          );
        })}

        {!loading && filtrados.length === 0 && (
          <div style={card}>No hay contenedores registrados para ese punto verde.</div>
        )}
      </div>
    </div>
  );
}

const card = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(239, 29, 29, 0.94)",
  borderRadius: 14,
  padding: 14,
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

const chip = {
  padding: "8px 12px",
  borderRadius: 999,
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(152, 241, 18, 0.88)",
  fontSize: 13,
};

const barWrap = {
  width: "100%",
  height: 16,
  borderRadius: 999,
  background: "rgba(242, 235, 235, 0.91)",
  marginTop: 14,
  overflow: "hidden",
};

const barFill = {
  height: "100%",
  borderRadius: 999,
};