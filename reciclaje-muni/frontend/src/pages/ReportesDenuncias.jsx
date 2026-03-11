import { useEffect, useState } from "react";
import api from "../api/axios";

export default function ReportesDenuncias() {
  const [resumen, setResumen] = useState({
    atendidas: 0,
    pendientes: 0,
    total: 0,
  });
  const [tiempoPromedio, setTiempoPromedio] = useState({
    promedio_dias: 0,
  });
  const [zonas, setZonas] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);

      const [r1, r2, r3] = await Promise.all([
        api.get("/reportes/denuncias/resumen"),
        api.get("/reportes/denuncias/tiempo-promedio"),
        api.get("/reportes/denuncias/por-zona"),
      ]);

      setResumen(r1.data?.data ?? r1.data ?? { atendidas: 0, pendientes: 0, total: 0 });
      setTiempoPromedio(r2.data?.data ?? r2.data ?? { promedio_dias: 0 });
      setZonas(Array.isArray(r3.data?.data ?? r3.data) ? (r3.data?.data ?? r3.data) : []);
      setMsg("");
    } catch (err) {
      console.error(err);
      setMsg(err?.response?.data?.message || "No se pudieron cargar los reportes de denuncias");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ padding: 24, color: "white" }}>
      <div style={topRow}>
        <div>
          <h1 style={{ marginTop: 0 }}>Reportes de Denuncias</h1>
          <p style={{ opacity: 0.85 }}>
            Consulta indicadores de atención, pendientes y zonas con mayor incidencia de denuncias.
          </p>
        </div>

      </div>

      {msg && <div style={msgBox}>{msg}</div>}

      <div style={gridKpis}>
        <div style={kpiCard}>
          <div style={kpiTitle}>Atendidas</div>
          <div style={kpiValue}>{resumen.atendidas ?? 0}</div>
          <div style={kpiSub}>ATENDIDA o CERRADA</div>
        </div>

        <div style={kpiCard}>
          <div style={kpiTitle}>Pendientes</div>
          <div style={kpiValue}>{resumen.pendientes ?? 0}</div>
          <div style={kpiSub}>Aún en proceso</div>
        </div>

        <div style={kpiCard}>
          <div style={kpiTitle}>Total</div>
          <div style={kpiValue}>{resumen.total ?? 0}</div>
          <div style={kpiSub}>Denuncias registradas</div>
        </div>

        <div style={kpiCard}>
          <div style={kpiTitle}>Tiempo promedio</div>
          <div style={kpiValue}>{Number(tiempoPromedio.promedio_dias ?? 0).toFixed(2)}</div>
          <div style={kpiSub}>Días promedio de atención</div>
        </div>
      </div>

      <div style={grid}>
        <div style={card}>
          <h3 style={{ marginTop: 0 }}>Denuncias atendidas vs pendientes</h3>

          {loading ? (
            <div style={{ opacity: 0.85 }}>Cargando...</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              <div style={itemBox}>
                <div style={{ fontWeight: 800 }}>Atendidas</div>
                <div style={{ fontSize: 22, fontWeight: 900 }}>
                  {resumen.atendidas ?? 0}
                </div>
              </div>

              <div style={itemBox}>
                <div style={{ fontWeight: 800 }}>Pendientes</div>
                <div style={{ fontSize: 22, fontWeight: 900 }}>
                  {resumen.pendientes ?? 0}
                </div>
              </div>

              <div style={itemBox}>
                <div style={{ fontWeight: 800 }}>Total</div>
                <div style={{ fontSize: 22, fontWeight: 900 }}>
                  {resumen.total ?? 0}
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={card}>
          <h3 style={{ marginTop: 0 }}>Tiempo promedio de atención</h3>

          {loading ? (
            <div style={{ opacity: 0.85 }}>Cargando...</div>
          ) : (
            <div style={itemBox}>
              <div style={{ fontSize: 15 }}>
                Promedio de atención:
              </div>
              <div style={{ marginTop: 8, fontSize: 26, fontWeight: 900 }}>
                {Number(tiempoPromedio.promedio_dias ?? 0).toFixed(2)} días
              </div>
            </div>
          )}
        </div>

        <div style={{ ...card, gridColumn: "1 / -1" }}>
          <h3 style={{ marginTop: 0 }}>Zonas con mayor cantidad de denuncias</h3>

          {loading ? (
            <div style={{ opacity: 0.85 }}>Cargando...</div>
          ) : zonas.length === 0 ? (
            <div style={{ opacity: 0.85 }}>No hay datos.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {zonas.map((z, index) => (
                <div key={index} style={itemBox}>
                  <div style={{ fontWeight: 800 }}>{z.zona}</div>
                  <div>Total denuncias: {z.total_denuncias}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const topRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  marginBottom: 14,
};

const gridKpis = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 16,
  marginBottom: 16,
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 16,
};

const card = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(173, 241, 15, 0.9)",
  borderRadius: 14,
  padding: 14,
};

const kpiCard = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(91, 233, 20, 0.93)",
  borderRadius: 14,
  padding: 14,
};

const kpiTitle = {
  opacity: 0.82,
  fontSize: 13,
};

const kpiValue = {
  fontSize: 28,
  fontWeight: 900,
  marginTop: 8,
};

const kpiSub = {
  opacity: 0.7,
  fontSize: 12,
  marginTop: 6,
};

const itemBox = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(240, 10, 10, 0.89)",
  borderRadius: 10,
  padding: 12,
};

const msgBox = {
  marginBottom: 14,
  padding: "12px 14px",
  borderRadius: 12,
  background: "rgba(59,130,246,0.12)",
  border: "1px solid rgba(232, 15, 15, 0.88)",
};

