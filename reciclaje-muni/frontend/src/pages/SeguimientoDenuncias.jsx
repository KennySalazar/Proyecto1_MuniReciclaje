import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMisDenuncias } from "../services/reciclaje.service";

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

function textoTamano(valor) {
  const v = String(valor || "").toUpperCase();
  if (v === "PEQUENO") return "PEQUEÑO";
  if (v === "MEDIANO") return "MEDIANO";
  if (v === "GRANDE") return "GRANDE";
  return valor || "N/D";
}

export default function SeguimientoDenuncias() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const r = await getMisDenuncias();
      const data = r.data?.data ?? r.data ?? [];
      setItems(Array.isArray(data) ? data : []);
      setMsg("");
    } catch (err) {
      setMsg(err?.response?.data?.message || "No se pudieron cargar tus denuncias.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "white", padding: 24 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 18,
          }}
        >
          <div>
            <h1 style={{ margin: 0 }}>Seguimiento de Mis Denuncias</h1>
            <p style={{ opacity: 0.85, marginTop: 8 }}>
              Consulta el estado actual de las denuncias que has registrado.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => navigate("/ciudadano/denuncias")}
              style={btnSecondary}
            >
              Crear denuncia
            </button>

            <button
              type="button"
              onClick={() => navigate("/ciudadano/dashboard")}
              style={btnSecondary}
            >
              Volver al panel ciudadano
            </button>
          </div>
        </div>

        {msg && <div style={msgBox}>{msg}</div>}
        {loading && <div style={{ marginBottom: 12 }}>Cargando denuncias...</div>}

        <div style={{ display: "grid", gap: 12 }}>
          {items.map((d) => (
            <div key={d.id} style={card}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div style={{ fontWeight: 900, fontSize: 20 }}>
                    Denuncia #{d.id}
                  </div>

                  <div style={{ marginTop: 8, opacity: 0.92 }}>
                    Tamaño del basurero: <b>{textoTamano(d.tamano)}</b>
                  </div>

                  <div style={{ opacity: 0.92 }}>
                    Fecha de denuncia: <b>{d.fecha_denuncia}</b>
                  </div>

                  <div style={{ opacity: 0.92 }}>
                    Ubicación: <b>{d.latitud}, {d.longitud}</b>
                  </div>

                  <div style={{ opacity: 0.92 }}>
                    Cuadrilla asignada: <b>{d.cuadrilla || "Sin asignar"}</b>
                  </div>

                  <div style={{ opacity: 0.92 }}>
                    Fecha programada: <b>{d.fecha_programada || "No programada"}</b>
                  </div>

                  <div style={{ opacity: 0.92 }}>
                    Recursos estimados: <b>{d.recursos_estimados || "N/D"}</b>
                  </div>

                  <div style={{ marginTop: 10, opacity: 0.98 }}>
                    {d.descripcion}
                  </div>
                </div>

                <div
                  style={{
                    background: colorEstado(d.nombre_estado),
                    color: "white",
                    padding: "8px 14px",
                    borderRadius: 999,
                    fontWeight: 800,
                    fontSize: 12,
                    minWidth: 120,
                    textAlign: "center",
                  }}
                >
                  {d.nombre_estado}
                </div>
              </div>
            </div>
          ))}

          {!loading && items.length === 0 && (
            <div style={emptyBox}>
              No tienes denuncias registradas todavía.
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
  borderRadius: 16,
  padding: 16,
};

const emptyBox = {
  background: "rgba(255,255,255,0.04)",
  border: "1px dashed rgba(255,255,255,0.12)",
  borderRadius: 12,
  padding: 14,
  opacity: 0.9,
};

const msgBox = {
  marginBottom: 14,
  padding: "12px 14px",
  borderRadius: 12,
  background: "rgba(59,130,246,0.12)",
  border: "1px solid rgba(59,130,246,0.30)",
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