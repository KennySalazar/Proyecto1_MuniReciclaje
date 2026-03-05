import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";


export default function Incidencias() {
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [activas, setActivas] = useState([]);
  const [recs, setRecs] = useState({});
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setMsg("");
    try {
      
      const m = await api.get("/monitoreo/activas");
      const list = m.data?.data ?? m.data ?? [];
      setActivas(Array.isArray(list) ? list : []);

     
      const ids = (Array.isArray(list) ? list : [])
        .map((x) => x.id_recoleccion)
        .filter(Boolean);

      
      if (ids.length === 0) {
        setRecs({});
        return;
      }

      const details = await Promise.all(
        ids.map((id) => api.get(`/recolecciones/${id}`))
      );

      const map = {};
      for (const resp of details) {
        const r = resp.data?.data ?? resp.data;
        if (r?.id) map[r.id] = r;
      }
      setRecs(map);
    } catch (err) {
      setMsg(err?.response?.data?.message || "No se pudieron cargar incidencias");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, []);

  const rows = useMemo(() => {
    const out = [];
    for (const a of activas) {
      const idRec = a.id_recoleccion;
      const full = recs[idRec];

      let incs = [];
      try {
        incs = JSON.parse(full?.incidencias || "[]");
        if (!Array.isArray(incs)) incs = [];
      } catch {
        incs = [];
      }

      incs.forEach((inc, idx) => {
        out.push({
          idRecoleccion: idRec,
          idx,
          placa: a.camion?.placa,
          ruta: a.ruta?.nombre,
          fechaRuta: a.asignacion?.fecha,
          tipo: inc.tipo || "OTRA",
          detalle: inc.detalle || "",
          fecha: inc.fecha || "",
          lat: inc.lat ?? null,
          lng: inc.lng ?? null,
          resuelta: !!inc.resuelta,
          resuelta_en: inc.resuelta_en ?? null,
          resuelta_por: inc.resuelta_por ?? null,
          resolucion: inc.resolucion ?? null,
        });
      });
    }

    out.sort((x, y) => {
      if (x.resuelta !== y.resuelta) return x.resuelta ? 1 : -1;
      return String(y.fecha).localeCompare(String(x.fecha));
    });

    return out;
  }, [activas, recs]);

  const resolver = async (idRecoleccion, idx, resolucion) => {
    setSaving(true);
    setMsg("");
    try {
      await api.patch(`/recolecciones/${idRecoleccion}/incidencias/${idx}/resolver`, {
        resolucion,
      });
      setMsg("Incidencia resuelta");
      await load();
      setTimeout(() => setMsg(""), 1500);
    } catch (err) {
      setMsg(err?.response?.data?.message || "No se pudo resolver la incidencia");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: 24, color: "white" }}>
      <h1 style={{ marginTop: 0 }}>Incidencias</h1>
      <p style={{ opacity: 0.85 }}>
        El coordinador monitorea y resuelve incidencias reportadas durante la recolección.
      </p>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>

        {msg && <div style={{ opacity: 0.95 }}>{msg}</div>}
      </div>

      <div style={card}>
        {loading ? (
          <div style={{ opacity: 0.85 }}>Cargando...</div>
        ) : rows.length === 0 ? (
          <div style={{ opacity: 0.85 }}>No hay incidencias.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Estado</th>
                  <th style={th}>Fecha</th>
                  <th style={th}>Ruta / Camión</th>
                  <th style={th}>Tipo</th>
                  <th style={th}>Detalle</th>
                  <th style={th}>Resolución</th>
                  <th style={th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((x) => (
                  <IncRow
                    key={`${x.idRecoleccion}-${x.idx}-${x.fecha}`}
                    x={x}
                    disabled={saving}
                    onResolver={resolver}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function IncRow({ x, disabled, onResolver }) {
  const [res, setRes] = useState(x.resolucion || "");

  return (
    <tr>
      <td style={td}>
        <span
          style={{
            padding: "4px 10px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.18)",
            background: x.resuelta ? "rgba(34,197,94,0.14)" : "rgba(239,68,68,0.14)",
            fontWeight: 800,
            fontSize: 12,
          }}
        >
          {x.resuelta ? "RESUELTA" : "PENDIENTE"}
        </span>
      </td>

      <td style={td}>{x.fecha || "—"}</td>

      <td style={td}>
        <div style={{ fontWeight: 800 }}>{x.ruta}</div>
        <div style={{ opacity: 0.85 }}>{x.placa}</div>
      </td>

      <td style={td}>{x.tipo}</td>

      <td style={td}>
        <div style={{ maxWidth: 420, whiteSpace: "pre-wrap" }}>{x.detalle}</div>
        {(x.lat != null && x.lng != null) && (
          <div style={{ opacity: 0.7, fontSize: 12 }}>
            {x.lat}, {x.lng}
          </div>
        )}
      </td>

      <td style={td}>
        {x.resuelta ? (
          <div style={{ opacity: 0.9 }}>
            <div>{x.resolucion || "—"}</div>
            <div style={{ opacity: 0.7, fontSize: 12 }}>
              {x.resuelta_en ? ` ${x.resuelta_en}` : ""}
            </div>
          </div>
        ) : (
          <input
            value={res}
            onChange={(e) => setRes(e.target.value)}
            style={inpMini}
            placeholder="Escribe la resolución..."
          />
        )}
      </td>

      <td style={td}>
        {!x.resuelta ? (
          <button
            style={miniBtnOk}
            disabled={disabled || !String(res).trim()}
            onClick={() => onResolver(x.idRecoleccion, x.idx, res)}
          >
            Resolver
          </button>
        ) : (
          <span style={{ opacity: 0.75, fontSize: 12 }}>—</span>
        )}
      </td>
    </tr>
  );
}

const card = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(234, 8, 8, 0.85)",
  borderRadius: 14,
  padding: 14,
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
};

const th = {
  textAlign: "left",
  padding: "10px 8px",
  borderBottom: "1px solid rgba(199, 243, 8, 0.85)",
  fontSize: 13,
  opacity: 0.9,
};

const td = {
  padding: "10px 8px",
  borderBottom: "1px solid rgba(241, 172, 10, 0.95)",
  fontSize: 13,
  verticalAlign: "top",
};

const inpMini = {
  width: 260,
  padding: 10,
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.15)",
  background: "rgba(0,0,0,0.25)",
  color: "white",
  outline: "none",
};

const miniBtnOk = {
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid rgba(34,197,94,0.55)",
  background: "rgba(34,197,94,0.14)",
  color: "white",
  cursor: "pointer",
  fontWeight: 800,
};