import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);


const PALETTE = [
  "rgba(59,130,246,0.75)", 
  "rgba(34,197,94,0.75)",   
  "rgba(245,158,11,0.75)",  
  "rgba(239,68,68,0.75)",   
  "rgba(168,85,247,0.75)",  
  "rgba(14,165,233,0.75)", 
  "rgba(236,72,153,0.75)",  
  "rgba(99,102,241,0.75)",  
];

function colorsFor(n) {
  const out = [];
  for (let i = 0; i < n; i++) out.push(PALETTE[i % PALETTE.length]);
  return out;
}

export default function Reportes() {
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const [estados, setEstados] = useState([]);
  const [basuraRuta, setBasuraRuta] = useState([]);
  const [camiones, setCamiones] = useState([]);
  const [incidencias, setIncidencias] = useState([]);
  const [eficiencia, setEficiencia] = useState({ completadas: 0, incompletas: 0 });

  const load = async () => {
    setLoading(true);
    setMsg("");
    try {
      const [r1, r2, r3, r4, r5] = await Promise.all([
        api.get("/reportes/estados"),
        api.get("/reportes/basura-por-ruta"),
        api.get("/reportes/camiones"),
        api.get("/reportes/incidencias"),
        api.get("/reportes/eficiencia"),
      ]);

      setEstados(r1.data?.data ?? r1.data ?? []);
      setBasuraRuta(r2.data?.data ?? r2.data ?? []);
      setCamiones(r3.data?.data ?? r3.data ?? []);
      setIncidencias(r4.data?.data ?? r4.data ?? []);
      setEficiencia(r5.data?.data ?? r5.data ?? { completadas: 0, incompletas: 0 });
    } catch (err) {
      console.error(err);
      setMsg(err?.response?.data?.message || "No se pudieron cargar los reportes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const kpis = useMemo(() => {
    const totalRecolecciones = estados.reduce((acc, x) => acc + Number(x.total ?? 0), 0);
    const totalTon = basuraRuta.reduce((acc, x) => acc + Number(x.total_toneladas ?? 0), 0);
    const totalInc = incidencias.reduce((acc, x) => acc + Number(x.total ?? 0), 0);

    const completadas = Number(eficiencia?.completadas ?? 0);
    const incompletas = Number(eficiencia?.incompletas ?? 0);

    const eficienciaPct = (() => {
      const t = completadas + incompletas;
      if (!t) return 0;
      return Math.round((completadas / t) * 100);
    })();

    return {
      totalRecolecciones,
      totalTon: round2(totalTon),
      totalInc,
      completadas,
      incompletas,
      eficienciaPct,
    };
  }, [estados, basuraRuta, incidencias, eficiencia]);

  
  const commonOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: "rgba(255,255,255,0.85)" },
        },
        tooltip: {
          bodyColor: "rgba(255,255,255,0.9)",
          titleColor: "rgba(255,255,255,0.95)",
        },
      },
      scales: {
        x: {
          ticks: { color: "rgba(255,255,255,0.75)" },
          grid: { color: "rgba(255,255,255,0.08)" },
        },
        y: {
          ticks: { color: "rgba(255,255,255,0.75)" },
          grid: { color: "rgba(255,255,255,0.08)" },
        },
      },
    }),
    []
  );

  //Chart: Estados
  const pieEstados = useMemo(() => {
    const labels = estados.map((x) => String(x.estado ?? "—"));
    const data = estados.map((x) => Number(x.total ?? 0));
    const bg = colorsFor(labels.length);

    return {
      labels,
      datasets: [
        {
          label: "Recolecciones",
          data,
          backgroundColor: bg,
          borderColor: "rgba(255,255,255,0.9)",
          borderWidth: 1,
        },
      ],
    };
  }, [estados]);

  //Basura por Ruta
  const barBasura = useMemo(() => {
    const labels = basuraRuta.map((x) => String(x.ruta ?? "—"));
    const data = basuraRuta.map((x) => Number(x.total_toneladas ?? 0));

    return {
      labels,
      datasets: [
        {
          label: "Toneladas",
          data,
          backgroundColor: "rgba(34,197,94,0.75)",
          borderColor: "rgba(34,197,94,0.95)",
          borderWidth: 1,
        },
      ],
    };
  }, [basuraRuta]);

  //Incidencias por Tipo
  const barInc = useMemo(() => {
    const labels = incidencias.map((x) => String(x.tipo ?? "OTRA"));
    const data = incidencias.map((x) => Number(x.total ?? 0));

    return {
      labels,
      datasets: [
        {
          label: "Incidencias",
          data,
          backgroundColor: "rgba(245,158,11,0.75)",
          borderColor: "rgba(245,158,11,0.95)",
          borderWidth: 1,
        },
      ],
    };
  }, [incidencias]);

  //Tabla Camiones
  const camionesRows = useMemo(() => {
    const out = [...camiones];
    out.sort((a, b) => Number(b.total_recolecciones ?? 0) - Number(a.total_recolecciones ?? 0));
    return out;
  }, [camiones]);

  return (
    <div style={{ padding: 24, color: "white" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0 }}>Reportes Operativos</h1>
          <p style={{ marginTop: 8, opacity: 0.85 }}>
            Resumen del desempeño: estados, toneladas, incidencias y productividad.
          </p>
        </div>

        <button onClick={load} style={btn2} disabled={loading}>
          {loading ? "Cargando..." : "Refrescar"}
        </button>
      </div>

      {msg && <div style={{ marginTop: 10, opacity: 0.95 }}>{msg}</div>}

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(160px, 1fr))", gap: 12, marginTop: 16 }}>
        <KPI title="Recolecciones" value={kpis.totalRecolecciones} sub="Total registradas" />
        <KPI title="Toneladas" value={`${kpis.totalTon}`} sub="Basura recolectada" />
        <KPI title="Incidencias" value={kpis.totalInc} sub="Reportadas" />
        <KPI title="Completadas" value={kpis.completadas} sub="Finalizadas" />
        <KPI title="Incompletas" value={kpis.incompletas} sub="Por incidencias" />
        <KPI title="Eficiencia" value={`${kpis.eficienciaPct}%`} sub="Completadas / total" />
      </div>

      {/* Graficos */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
        <div style={card}>
          <h3 style={{ marginTop: 0 }}>Recolecciones por estado</h3>
          {loading ? (
            <div style={{ opacity: 0.85 }}>Cargando...</div>
          ) : estados.length ? (
            <div style={{ height: 320 }}>
              <Pie data={pieEstados} options={{ ...commonOptions, scales: undefined }} />
            </div>
          ) : (
            <div style={{ opacity: 0.85 }}>Sin datos.</div>
          )}
        </div>

        <div style={card}>
          <h3 style={{ marginTop: 0 }}>Incidencias por tipo</h3>
          {loading ? (
            <div style={{ opacity: 0.85 }}>Cargando...</div>
          ) : incidencias.length ? (
            <div style={{ height: 320 }}>
              <Bar
                data={barInc}
                options={{
                  ...commonOptions,
                  plugins: { ...commonOptions.plugins, legend: { display: false } },
                }}
              />
            </div>
          ) : (
            <div style={{ opacity: 0.85 }}>Sin datos.</div>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
        <div style={card}>
          <h3 style={{ marginTop: 0 }}>Basura recolectada por ruta (Ton)</h3>
          {loading ? (
            <div style={{ opacity: 0.85 }}>Cargando...</div>
          ) : basuraRuta.length ? (
            <div style={{ height: 320 }}>
              <Bar
                data={barBasura}
                options={{
                  ...commonOptions,
                  plugins: { ...commonOptions.plugins, legend: { display: false } },
                }}
              />
            </div>
          ) : (
            <div style={{ opacity: 0.85 }}>Sin datos.</div>
          )}
        </div>

        <div style={card}>
          <h3 style={{ marginTop: 0 }}>Camiones más utilizados</h3>
          {loading ? (
            <div style={{ opacity: 0.85 }}>Cargando...</div>
          ) : camionesRows.length ? (
            <div style={{ overflowX: "auto" }}>
              <table style={table}>
                <thead>
                  <tr>
                    <th style={th}>Placa</th>
                    <th style={th}>Recolecciones</th>
                  </tr>
                </thead>
                <tbody>
                  {camionesRows.map((x) => (
                    <tr key={x.placa}>
                      <td style={td}>{x.placa}</td>
                      <td style={td}>{x.total_recolecciones}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ opacity: 0.85 }}>Sin datos.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function KPI({ title, value, sub }) {
  return (
    <div style={kpiCard}>
      <div style={{ opacity: 0.85, fontSize: 12 }}>{title}</div>
      <div style={{ fontSize: 22, fontWeight: 900, marginTop: 6 }}>{value}</div>
      <div style={{ opacity: 0.7, fontSize: 12, marginTop: 6 }}>{sub}</div>
    </div>
  );
}

function round2(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return 0;
  return Math.round(x * 100) / 100;
}

const card = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: 14,
  padding: 14,
};

const kpiCard = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: 14,
  padding: 14,
};

const btn2 = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.2)",
  background: "transparent",
  color: "white",
  cursor: "pointer",
  fontWeight: 800,
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
};

const th = {
  textAlign: "left",
  padding: "10px 8px",
  borderBottom: "1px solid rgba(255,255,255,0.12)",
  fontSize: 13,
  opacity: 0.9,
};

const td = {
  padding: "10px 8px",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  fontSize: 13,
};