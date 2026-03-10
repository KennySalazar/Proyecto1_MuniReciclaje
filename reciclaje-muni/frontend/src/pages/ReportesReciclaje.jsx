import { useEffect, useState } from "react";
import {
  getReporteComparativaMateriales,
  getReporteMaterialPorTipo,
  getReportePuntosVerdesActivos,
  getReporteTendenciasCiudadanas,
} from "../services/reciclaje.service";

export default function ReportesReciclaje() {
  const [materialPorTipo, setMaterialPorTipo] = useState([]);
  const [puntosActivos, setPuntosActivos] = useState([]);
  const [tendencias, setTendencias] = useState([]);
  const [comparativa, setComparativa] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);

      const [r1, r2, r3, r4] = await Promise.all([
        getReporteMaterialPorTipo(),
        getReportePuntosVerdesActivos(),
        getReporteTendenciasCiudadanas(),
        getReporteComparativaMateriales(),
      ]);

      setMaterialPorTipo(r1.data?.data ?? r1.data ?? []);
      setPuntosActivos(r2.data?.data ?? r2.data ?? []);
      setTendencias(r3.data?.data ?? r3.data ?? []);
      setComparativa(r4.data?.data ?? r4.data ?? []);
      setMsg("");
    } catch (err) {
      setMsg(err?.response?.data?.message || "No se pudieron cargar los reportes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ padding: 24, color: "white" }}>
      <h1 style={{ marginTop: 0 }}>Reportes de Reciclaje</h1>
      <p style={{ opacity: 0.85 }}>
        Consulta indicadores de reciclaje por tipo de material, actividad de puntos verdes y tendencias.
      </p>

      {msg && <div style={msgBox}>{msg}</div>}
      {loading && <div style={{ marginBottom: 14 }}>Cargando reportes...</div>}

      <div style={grid}>
        <div style={card}>
          <h3 style={{ marginTop: 0 }}>Cantidad de material reciclado por tipo</h3>
          <div style={{ display: "grid", gap: 10 }}>
            {materialPorTipo.map((m) => (
              <div key={m.id} style={item}>
                <div style={{ fontWeight: 800 }}>{m.nombre_tipo}</div>
                <div>{Number(m.total_kg).toFixed(2)} kg</div>
              </div>
            ))}
            {!loading && materialPorTipo.length === 0 && <div>No hay datos.</div>}
          </div>
        </div>

        <div style={card}>
          <h3 style={{ marginTop: 0 }}>Puntos verdes más activos</h3>
          <div style={{ display: "grid", gap: 10 }}>
            {puntosActivos.map((p) => (
              <div key={p.id} style={item}>
                <div style={{ fontWeight: 800 }}>{p.nombre}</div>
                <div>Entregas: {p.total_entregas}</div>
                <div>Total reciclado: {Number(p.total_kg).toFixed(2)} kg</div>
              </div>
            ))}
            {!loading && puntosActivos.length === 0 && <div>No hay datos.</div>}
          </div>
        </div>

        <div style={card}>
            <h3 style={{ marginTop: 0 }}>Tendencias de reciclaje ciudadano</h3>

            <div style={{ display: "grid", gap: 10 }}>
                {tendencias.map((t, index) => (
                <div key={`${t.fecha_entrega}-${t.ciudadano}-${index}`} style={item}>
                    <div style={{ fontWeight: 800 }}>{t.fecha_entrega}</div>
                    <div>Ciudadano: {t.ciudadano}</div>
                    <div>Entregas: {t.total_entregas}</div>
                    <div>Total: {Number(t.total_kg).toFixed(2)} kg</div>
                </div>
                ))}

                {!loading && tendencias.length === 0 && <div>No hay datos.</div>}
            </div>
        </div>

        <div style={card}>
          <h3 style={{ marginTop: 0 }}>Comparativa entre materiales</h3>
          <div style={{ display: "grid", gap: 10 }}>
            {comparativa.map((c) => (
              <div key={c.nombre_tipo} style={item}>
                <div style={{ fontWeight: 800 }}>{c.nombre_tipo}</div>
                <div>Total entregas: {c.total_entregas}</div>
                <div>Total kg: {Number(c.total_kg).toFixed(2)}</div>
                <div>Promedio por entrega: {Number(c.promedio_kg).toFixed(2)} kg</div>
              </div>
            ))}
            {!loading && comparativa.length === 0 && <div>No hay datos.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 16,
};

const card = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(218, 19, 19, 0.79)",
  borderRadius: 14,
  padding: 14,
};

const item = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(124, 231, 10, 0.93)",
  borderRadius: 10,
  padding: 10,
};

const msgBox = {
  marginBottom: 14,
  padding: "12px 14px",
  borderRadius: 12,
  background: "rgba(59,130,246,0.12)",
  border: "1px solid rgba(59,130,246,0.30)",
};