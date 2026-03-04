import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import MapEditor from "../components/MapEditor";
import RouteForm from "../components/RouteForm";

export default function Rutas() {
  const [points, setPoints] = useState([]);
  const [distanceKm, setDistanceKm] = useState(0);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const [routes, setRoutes] = useState([]);

  // seleccion de ruta
  const [selectedRouteId, setSelectedRouteId] = useState("ALL"); 
  const [showAll, setShowAll] = useState(true);

  const canSave = useMemo(
    () => points.length >= 2 && distanceKm >= 0,
    [points, distanceKm]
  );

  const loadRoutes = async () => {
    try {
      const res = await api.get("/rutas");
      const list = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
      setRoutes(list);
    } catch (e) {
      console.log("ERROR GET /rutas:", e?.response?.status, e?.response?.data, e);
    }
  };

  useEffect(() => {
    loadRoutes();
  }, []);

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

      await loadRoutes();
    } catch (e) {
      console.log("ERROR POST /rutas:", e?.response?.status, e?.response?.data, e);
      const txt = e?.response?.data?.message || "";

      if (
        txt.includes("duplicate key") ||
        txt.includes("unique constraint") ||
        txt.includes("ruta_nombre_key")
      ) {
        setMsg("Ya existe una ruta con ese nombre.");
      } else {
        setMsg(txt || "Error guardando la ruta");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    setPoints([]);
    setDistanceKm(0);
    setMsg("");
  };

  //rutas que se van a dibujar según selección
  const routesToDraw = useMemo(() => {
    if (showAll) return routes;

    if (selectedRouteId === "ALL") return [];
    const idNum = Number(selectedRouteId);
    return routes.filter((r) => Number(r.id) === idNum);
  }, [routes, selectedRouteId, showAll]);

  return (
    <div style={{ padding: 24, color: "white" }}>
      <h1 style={{ marginTop: 0 }}>Rutas</h1>
      <p style={{ opacity: 0.85 }}>
        Trazá la ruta con clics en el mapa. Mínimo 2 puntos.
      </p>

      {}
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          marginBottom: 14,
          flexWrap: "wrap",
        }}
      >
        <label style={{ opacity: 0.9 }}>Mostrar:</label>

        <label style={{ display: "flex", alignItems: "center", gap: 8, opacity: 0.9 }}>
          <input
            type="checkbox"
            checked={showAll}
            onChange={(e) => setShowAll(e.target.checked)}
          />
          Ver todas
        </label>

        {!showAll && (
          <>
            <label style={{ opacity: 0.9 }}>Ruta:</label>
            <select
              value={selectedRouteId}
              onChange={(e) => setSelectedRouteId(e.target.value)}
              style={{
                padding: 10,
                borderRadius: 10,
                border: "1px solid rgb(236, 234, 231)",
                background: "rgba(65, 17, 197, 0.81)",
                color: "white",
                outline: "none",
                minWidth: 260,
              }}
            >
              <option value="ALL">-- Seleccioná una ruta --</option>
              {routes.map((r) => (
                <option key={r.id} value={String(r.id)}>
                  {r.nombre}
                </option>
              ))}
            </select>
          </>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 16 }}>
        <RouteForm
          distanceKm={distanceKm}
          pointsCount={points.length}
          saving={saving}
          onSave={handleSave}
          onClear={handleClear}
        />

        <MapEditor
          points={points}
          setPoints={setPoints}
          setDistanceKm={setDistanceKm}
          routes={routesToDraw} 
        />
      </div>

      {msg && <div style={{ marginTop: 12, opacity: 0.95 }}>{msg}</div>}
    </div>
  );
}