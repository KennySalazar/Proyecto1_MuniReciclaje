import { useEffect, useState } from "react";
import {
  getNotificacionesContenedor,
} from "../services/reciclaje.service";

function colorAlerta(tipo) {
  if (tipo === "LLENO_100") return "#ef4444";
  if (tipo === "URGENTE_90") return "#f97316";
  if (tipo === "ALERTA_75") return "#eab308";
  return "#94a3b8";
}

function textoAlerta(tipo) {
  if (tipo === "LLENO_100") return "Contenedor lleno";
  if (tipo === "URGENTE_90") return "Urgente";
  if (tipo === "ALERTA_75") return "Alerta temprana";
  return tipo || "Sin tipo";
}

export default function AlertasContenedor() {
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const r = await getNotificacionesContenedor();
        if (!mounted) return;

        const data = r.data?.data ?? r.data ?? [];
        setItems(Array.isArray(data) ? data : []);
        setMsg("");
      } catch (err) {
        if (!mounted) return;
        setMsg(err?.response?.data?.message || "No se pudieron cargar las alertas");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);



  return (
    <div style={{ padding: 24, color: "white" }}>
      <h1 style={{ marginTop: 0 }}>Alertas de Contenedores</h1>
      <p style={{ opacity: 0.85 }}>
        Consultá alertas automáticas por nivel de llenado de contenedores.
      </p>

      {msg && <div style={{ marginBottom: 12 }}>{msg}</div>}
      {loading && <div style={{ marginBottom: 12 }}>Cargando alertas...</div>}

      <div style={{ display: "grid", gap: 12 }}>
        {items.map((n) => (
          <div key={n.id} style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontWeight: 900, fontSize: 17 }}>
                  {n.punto_verde} - {n.nombre_tipo}
                </div>

                <div style={{ marginTop: 6, fontSize: 14, opacity: 0.9 }}>
                  Mensaje: {n.mensaje || "Sin mensaje"}
                </div>

                <div style={{ marginTop: 4, fontSize: 14, opacity: 0.9 }}>
                  Fecha: {n.fecha_hora}
                </div>

                <div style={{ marginTop: 4, fontSize: 14, opacity: 0.9 }}>
                  Estado: {n.leida_bool ? "Leída" : "Pendiente"}
                </div>
              </div>

              <div style={{ minWidth: 170 }}>
                <div
                  style={{
                    display: "inline-block",
                    padding: "8px 12px",
                    borderRadius: 999,
                    background: colorAlerta(n.tipo_alerta),
                    color: "white",
                    fontWeight: 900,
                    fontSize: 13,
                  }}
                >
                  {textoAlerta(n.tipo_alerta)}
                </div>
              </div>
            </div>

            {!n.leida_bool && (
              <div style={{ marginTop: 12 }}>

              </div>
            )}
          </div>
        ))}

        {!loading && items.length === 0 && (
          <div style={card}>
            No hay alertas registradas.
          </div>
        )}
      </div>
    </div>
  );
}

const card = {
  background: "rgba(244, 16, 16, 0.06)",
  border: "1px solid rgba(226, 15, 15, 0.88)",
  borderRadius: 14,
  padding: 14,
};

