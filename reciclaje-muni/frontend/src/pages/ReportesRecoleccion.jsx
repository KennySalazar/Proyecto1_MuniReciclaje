import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

export default function Reportes() {
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const [porPeriodoDia, setPorPeriodoDia] = useState([]);
  const [porPeriodoSemana, setPorPeriodoSemana] = useState([]);
  const [porPeriodoMes, setPorPeriodoMes] = useState([]);
  const [porZona, setPorZona] = useState([]);
  const [porColonia, setPorColonia] = useState([]);
  const [porRuta, setPorRuta] = useState([]);
  const [comparativaMensual, setComparativaMensual] = useState([]);
  const [comparativaAnual, setComparativaAnual] = useState([]);

  const load = async () => {
    setLoading(true);
    setMsg("");
    try {
      const [rDia, rSemana, rMes, rZona, rColonia, rRuta, rMensual, rAnual] =
        await Promise.all([
          api.get("/reportes/recoleccion/por-periodo?tipo=dia"),
          api.get("/reportes/recoleccion/por-periodo?tipo=semana"),
          api.get("/reportes/recoleccion/por-periodo?tipo=mes"),
          api.get("/reportes/recoleccion/por-zona"),
          api.get("/reportes/recoleccion/por-colonia"),
          api.get("/reportes/recoleccion/por-ruta"),
          api.get("/reportes/recoleccion/comparativa-mensual"),
          api.get("/reportes/recoleccion/comparativa-anual"),
        ]);

      setPorPeriodoDia(rDia.data?.data ?? rDia.data ?? []);
      setPorPeriodoSemana(rSemana.data?.data ?? rSemana.data ?? []);
      setPorPeriodoMes(rMes.data?.data ?? rMes.data ?? []);
      setPorZona(rZona.data?.data ?? rZona.data ?? []);
      setPorColonia(rColonia.data?.data ?? rColonia.data ?? []);
      setPorRuta(rRuta.data?.data ?? rRuta.data ?? []);
      setComparativaMensual(rMensual.data?.data ?? rMensual.data ?? []);
      setComparativaAnual(rAnual.data?.data ?? rAnual.data ?? []);
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
    const totalDia = porPeriodoDia.reduce((acc, x) => acc + Number(x.total_toneladas ?? 0), 0);
    const totalZona = porZona.reduce((acc, x) => acc + Number(x.total_toneladas ?? 0), 0);
    const totalRuta = porRuta.reduce((acc, x) => acc + Number(x.total_recolecciones ?? 0), 0);
    const totalMensual = comparativaMensual.reduce((acc, x) => acc + Number(x.total_toneladas ?? 0), 0);

    return {
      totalDia: round2(totalDia),
      totalZona: round2(totalZona),
      totalRuta,
      totalMensual: round2(totalMensual),
    };
  }, [porPeriodoDia, porZona, porRuta, comparativaMensual]);

  const pieZonaData = useMemo(() => {
    return {
      labels: porZona.map((x) => x.zona),
      datasets: [
        {
          label: "Toneladas por zona",
          data: porZona.map((x) => Number(x.total_toneladas ?? 0)),
          backgroundColor: [
            "rgba(34,197,94,0.8)",
            "rgba(59,130,246,0.8)",
            "rgba(245,158,11,0.8)",
            "rgba(239,68,68,0.8)",
            "rgba(168,85,247,0.8)",
            "rgba(20,184,166,0.8)",
          ],
          borderColor: "rgba(255,255,255,0.15)",
          borderWidth: 1,
        },
      ],
    };
  }, [porZona]);

  const barRutaData = useMemo(() => {
    return {
      labels: porRuta.map((x) => x.ruta),
      datasets: [
        {
          label: "Toneladas por ruta",
          data: porRuta.map((x) => Number(x.total_toneladas ?? 0)),
          backgroundColor: "rgba(59,130,246,0.75)",
          borderColor: "rgba(59,130,246,1)",
          borderWidth: 1,
        },
      ],
    };
  }, [porRuta]);

  const barColoniaData = useMemo(() => {
    return {
      labels: porColonia.map((x) => x.colonia),
      datasets: [
        {
          label: "Toneladas por colonia",
          data: porColonia.map((x) => Number(x.total_toneladas ?? 0)),
          backgroundColor: "rgba(245,158,11,0.75)",
          borderColor: "rgba(245,158,11,1)",
          borderWidth: 1,
        },
      ],
    };
  }, [porColonia]);

  const lineMensualData = useMemo(() => {
    return {
      labels: comparativaMensual.map((x) => `${x.anio}-${String(x.mes).padStart(2, "0")}`),
      datasets: [
        {
          label: "Comparativa mensual (Ton)",
          data: comparativaMensual.map((x) => Number(x.total_toneladas ?? 0)),
          borderColor: "rgba(34,197,94,1)",
          backgroundColor: "rgba(34,197,94,0.25)",
          tension: 0.25,
          fill: true,
        },
      ],
    };
  }, [comparativaMensual]);

  const lineAnualData = useMemo(() => {
    return {
      labels: comparativaAnual.map((x) => `${x.anio}`),
      datasets: [
        {
          label: "Comparativa anual (Ton)",
          data: comparativaAnual.map((x) => Number(x.total_toneladas ?? 0)),
          borderColor: "rgba(168,85,247,1)",
          backgroundColor: "rgba(168,85,247,0.25)",
          tension: 0.25,
          fill: true,
        },
      ],
    };
  }, [comparativaAnual]);

  const periodoDiaData = useMemo(() => {
    return {
      labels: porPeriodoDia.map((x) => x.periodo),
      datasets: [
        {
          label: "Toneladas por día",
          data: porPeriodoDia.map((x) => Number(x.total_toneladas ?? 0)),
          backgroundColor: "rgba(20,184,166,0.75)",
          borderColor: "rgba(20,184,166,1)",
          borderWidth: 1,
        },
      ],
    };
  }, [porPeriodoDia]);

  const periodoSemanaData = useMemo(() => {
    return {
      labels: porPeriodoSemana.map((x) => x.periodo),
      datasets: [
        {
          label: "Toneladas por semana",
          data: porPeriodoSemana.map((x) => Number(x.total_toneladas ?? 0)),
          backgroundColor: "rgba(239,68,68,0.75)",
          borderColor: "rgba(239,68,68,1)",
          borderWidth: 1,
        },
      ],
    };
  }, [porPeriodoSemana]);

  const periodoMesData = useMemo(() => {
    return {
      labels: porPeriodoMes.map((x) => x.periodo),
      datasets: [
        {
          label: "Toneladas por mes",
          data: porPeriodoMes.map((x) => Number(x.total_toneladas ?? 0)),
          backgroundColor: "rgba(99,102,241,0.75)",
          borderColor: "rgba(99,102,241,1)",
          borderWidth: 1,
        },
      ],
    };
  }, [porPeriodoMes]);

  return (
    <div style={{ padding: 24, color: "white" }}>
      <div style={topRow}>
        <div>
          <h1 style={{ margin: 0 }}>Reportes de Recolección</h1>
          <p style={{ marginTop: 8, opacity: 0.85 }}>
            Toneladas recolectadas por período, zona, colonia, ruta y comparativas históricas.
          </p>
        </div>

      </div>

      {msg && <div style={{ marginTop: 12 }}>{msg}</div>}

      <div style={kpiGrid}>
        <KPI title="Ton. acumuladas" value={kpis.totalDia} sub="Suma por días cargados" />
        <KPI title="Ton. por zonas" value={kpis.totalZona} sub="Suma agrupada por zona" />
        <KPI title="Recolecciones" value={kpis.totalRuta} sub="Total en rutas" />
        <KPI title="Ton. comparativa" value={kpis.totalMensual} sub="Base mensual" />
      </div>

      <div style={grid2}>
        <div style={card}>
          <h3 style={titleCard}>Toneladas por zona</h3>
          {loading ? (
            <Empty text="Cargando..." />
          ) : porZona.length ? (
            <div style={{ height: 320 }}>
              <Pie data={pieZonaData} options={pieOptions} />
            </div>
          ) : (
            <Empty text="Sin datos." />
          )}
        </div>

        <div style={card}>
          <h3 style={titleCard}>Toneladas por ruta</h3>
          {loading ? (
            <Empty text="Cargando..." />
          ) : porRuta.length ? (
            <div style={{ height: 320 }}>
              <Bar data={barRutaData} options={barOptions} />
            </div>
          ) : (
            <Empty text="Sin datos." />
          )}
        </div>
      </div>

      <div style={grid2}>
        <div style={card}>
          <h3 style={titleCard}>Toneladas por colonia</h3>
          {loading ? (
            <Empty text="Cargando..." />
          ) : porColonia.length ? (
            <div style={{ height: 320 }}>
              <Bar data={barColoniaData} options={barOptions} />
            </div>
          ) : (
            <Empty text="Sin datos." />
          )}
        </div>

        <div style={card}>
          <h3 style={titleCard}>Comparativa mensual</h3>
          {loading ? (
            <Empty text="Cargando..." />
          ) : comparativaMensual.length ? (
            <div style={{ height: 320 }}>
              <Line data={lineMensualData} options={lineOptions} />
            </div>
          ) : (
            <Empty text="Sin datos." />
          )}
        </div>
      </div>

      <div style={grid2}>
        <div style={card}>
          <h3 style={titleCard}>Comparativa anual</h3>
          {loading ? (
            <Empty text="Cargando..." />
          ) : comparativaAnual.length ? (
            <div style={{ height: 320 }}>
              <Line data={lineAnualData} options={lineOptions} />
            </div>
          ) : (
            <Empty text="Sin datos." />
          )}
        </div>

        <div style={card}>
          <h3 style={titleCard}>Toneladas por día</h3>
          {loading ? (
            <Empty text="Cargando..." />
          ) : porPeriodoDia.length ? (
            <div style={{ height: 320 }}>
              <Bar data={periodoDiaData} options={barOptions} />
            </div>
          ) : (
            <Empty text="Sin datos." />
          )}
        </div>
      </div>

      <div style={grid2}>
        <div style={card}>
          <h3 style={titleCard}>Toneladas por semana</h3>
          {loading ? (
            <Empty text="Cargando..." />
          ) : porPeriodoSemana.length ? (
            <div style={{ height: 320 }}>
              <Bar data={periodoSemanaData} options={barOptions} />
            </div>
          ) : (
            <Empty text="Sin datos." />
          )}
        </div>

        <div style={card}>
          <h3 style={titleCard}>Toneladas por mes</h3>
          {loading ? (
            <Empty text="Cargando..." />
          ) : porPeriodoMes.length ? (
            <div style={{ height: 320 }}>
              <Bar data={periodoMesData} options={barOptions} />
            </div>
          ) : (
            <Empty text="Sin datos." />
          )}
        </div>
      </div>

      <div style={grid2}>
        <div style={card}>
          <h3 style={titleCard}>Detalle por ruta</h3>
          {loading ? (
            <Empty text="Cargando..." />
          ) : porRuta.length ? (
            <div style={{ overflowX: "auto" }}>
              <table style={table}>
                <thead>
                  <tr>
                    <th style={th}>Ruta</th>
                    <th style={th}>Toneladas</th>
                    <th style={th}>Recolecciones</th>
                  </tr>
                </thead>
                <tbody>
                  {porRuta.map((x) => (
                    <tr key={x.id}>
                      <td style={td}>{x.ruta}</td>
                      <td style={td}>{x.total_toneladas}</td>
                      <td style={td}>{x.total_recolecciones}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty text="Sin datos." />
          )}
        </div>

        <div style={card}>
          <h3 style={titleCard}>Detalle por colonia</h3>
          {loading ? (
            <Empty text="Cargando..." />
          ) : porColonia.length ? (
            <div style={{ overflowX: "auto" }}>
              <table style={table}>
                <thead>
                  <tr>
                    <th style={th}>Zona</th>
                    <th style={th}>Colonia</th>
                    <th style={th}>Toneladas</th>
                  </tr>
                </thead>
                <tbody>
                  {porColonia.map((x) => (
                    <tr key={x.id}>
                      <td style={td}>{x.zona}</td>
                      <td style={td}>{x.colonia}</td>
                      <td style={td}>{x.total_toneladas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty text="Sin datos." />
          )}
        </div>
      </div>
    </div>
  );
}

function KPI({ title, value, sub }) {
  return (
    <div style={kpiCard}>
      <div style={{ opacity: 0.82, fontSize: 12 }}>{title}</div>
      <div style={{ fontSize: 24, fontWeight: 900, marginTop: 8 }}>{value}</div>
      <div style={{ opacity: 0.7, fontSize: 12, marginTop: 6 }}>{sub}</div>
    </div>
  );
}

function Empty({ text }) {
  return <div style={{ opacity: 0.85 }}>{text}</div>;
}

function round2(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return 0;
  return Math.round(x * 100) / 100;
}

const commonScales = {
  x: {
    ticks: { color: "rgba(255,255,255,0.75)" },
    grid: { color: "rgba(255,255,255,0.08)" },
  },
  y: {
    ticks: { color: "rgba(255,255,255,0.75)" },
    grid: { color: "rgba(255,255,255,0.08)" },
    beginAtZero: true,
  },
};

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { color: "white" },
    },
    tooltip: {
      enabled: true,
    },
  },
  scales: commonScales,
};

const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { color: "white" },
    },
  },
  scales: commonScales,
};

const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { color: "white" },
    },
  },
};

const topRow = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "center",
};

const grid2 = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 16,
  marginTop: 16,
};

const kpiGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(180px, 1fr))",
  gap: 12,
  marginTop: 16,
};

const card = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(228, 17, 17, 0.93)",
  borderRadius: 14,
  padding: 14,
};

const kpiCard = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(205, 246, 2, 0.9)",
  borderRadius: 14,
  padding: 14,
};

const titleCard = {
  marginTop: 0,
  marginBottom: 12,
};


const table = {
  width: "100%",
  borderCollapse: "collapse",
};

const th = {
  textAlign: "left",
  padding: "10px 8px",
  borderBottom: "1px solid rgba(235, 201, 10, 0.94)",
  fontSize: 13,
  opacity: 0.9,
};

const td = {
  padding: "10px 8px",
  borderBottom: "1px solid rgba(114, 223, 11, 0.93)",
  fontSize: 13,
};