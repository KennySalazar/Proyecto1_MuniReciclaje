import { useMemo, useState } from "react";
import api from "../api/axios";
import MapEditor from "../components/MapEditor";
import RouteForm from "../components/RouteForm";

export default function Rutas() {
  const [points, setPoints] = useState([]); // [{lat,lng,orden}]
  const [distanceKm, setDistanceKm] = useState(0);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const canSave = useMemo(() => points.length >= 2 && distanceKm >= 0, [points, distanceKm]);

  const handleSave = async (form) => {
    if (!canSave) return;
    setSaving(true);
    setMsg("");

    try {
      const payload = {
        nombre: form.nombre,
        dias_asignados: form.dias_asignados,
        horario: form.horario,
        tipo_residuo: form.tipo_residuo,
        distancia_km: distanceKm,
        coordenadas: points,
      };

      await api.post("/rutas", payload);
      setMsg("Ruta creada correctamente");
      setTimeout(() => setMsg(""), 2500);
      setPoints([]);
      setDistanceKm(0);
    } catch (e) {
        console.log("ERROR /rutas:", e?.response?.status, e?.response?.data, e);
        if (e?.response?.data?.message?.includes("duplicate key")) {
            setMsg("Ya existe una ruta con ese nombre.");
        } else {
            setMsg(
            e?.response?.data?.message || "Error guardando la ruta"
            );
        }
        } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: 24, color: "white" }}>
      <h1 style={{ marginTop: 0 }}>Rutas</h1>
      <p style={{ opacity: 0.85 }}>
        Trazá la ruta con clics en el mapa. Mínimo 2 puntos.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 16 }}>
        <RouteForm
          distanceKm={distanceKm}
          pointsCount={points.length}
          saving={saving}
          onSave={handleSave}
          onClear={() => { setPoints([]); setDistanceKm(0); }}
        />

        <MapEditor
        points={points}
        setPoints={setPoints}
        setDistanceKm={setDistanceKm}
        />
      </div>

      {msg && <div style={{ marginTop: 12, opacity: 0.95 }}>{msg}</div>}
    </div>
  );
}