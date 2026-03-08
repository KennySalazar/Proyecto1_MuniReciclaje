import { useMemo, useState } from "react";

export default function RouteForm({
  distanceKm,
  pointsCount,
  saving,
  onSave,
  onClear,
  zonas = [],
  colonias = [],
}) {
  const initialForm = {
    nombre: "",
    dias_asignados: "Lunes-Miercoles-Viernes",
    horario: "06:00-12:00",
    tipo_residuo: "MIXTO",
    id_zona: "",
    id_colonia: "",
  };

  const [form, setForm] = useState(initialForm);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleZonaChange = (value) => {
    setForm((prev) => ({
      ...prev,
      id_zona: value,
      id_colonia: "",
    }));
  };

  const coloniasFiltradas = useMemo(() => {
    if (!form.id_zona) return [];
    return colonias.filter(
      (c) => String(c.id_zona) === String(form.id_zona)
    );
  }, [colonias, form.id_zona]);

  const limpiarFormulario = () => {
    setForm(initialForm);
    onClear();
  };

  return (
    <div style={card}>
      <h3 style={{ marginTop: 0 }}>Datos de la ruta</h3>

      <label>Nombre</label>
      <input
        style={inp}
        value={form.nombre}
        onChange={(e) => handleChange("nombre", e.target.value)}
      />

      <label>Zona</label>
      <select
        style={inp}
        value={form.id_zona}
        onChange={(e) => handleZonaChange(e.target.value)}
      >
        <option value="">-- Seleccioná zona --</option>
        {zonas.map((z) => (
          <option key={z.id} value={z.id}>
            {z.nombre}
          </option>
        ))}
      </select>

      <label>Colonia</label>
      <select
        style={inp}
        value={form.id_colonia}
        onChange={(e) => handleChange("id_colonia", e.target.value)}
        disabled={!form.id_zona}
      >
        <option value="">-- Seleccioná colonia --</option>
        {coloniasFiltradas.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nombre}
          </option>
        ))}
      </select>

      <label>Días</label>
      <input
        style={inp}
        value={form.dias_asignados}
        onChange={(e) => handleChange("dias_asignados", e.target.value)}
      />

      <label>Horario</label>
      <input
        style={inp}
        value={form.horario}
        onChange={(e) => handleChange("horario", e.target.value)}
      />

      <label>Tipo residuo</label>
      <select
        style={inp}
        value={form.tipo_residuo}
        onChange={(e) => handleChange("tipo_residuo", e.target.value)}
      >
        <option value="ORGANICO">Orgánico</option>
        <option value="INORGANICO">Inorgánico</option>
        <option value="MIXTO">Mixto</option>
      </select>

      <div style={{ marginTop: 10, opacity: 0.9 }}>
        <div>Puntos: <b>{pointsCount}</b></div>
        <div>Distancia: <b>{distanceKm.toFixed(2)} km</b></div>
      </div>

      <button
        disabled={
          saving ||
          pointsCount < 2 ||
          !form.nombre ||
          !form.id_zona ||
          !form.id_colonia
        }
        onClick={() => onSave(form)}
        style={btn}
      >
        {saving ? "Guardando..." : "Guardar ruta"}
      </button>

      <button onClick={limpiarFormulario} style={btn2}>
        Limpiar
      </button>
    </div>
  );
}

const card = {
  background: "rgba(246, 145, 13, 0.06)",
  border: "1px solid rgba(234, 150, 14, 0.94)",
  borderRadius: 14,
  padding: 14,
};

const inp = {
  width: "100%",
  marginTop: 6,
  marginBottom: 10,
  padding: 10,
  borderRadius: 10,
  border: "1px solid rgba(243, 240, 236, 0.83)",
  background: "#ee4b0a",
  color: "white",
  outline: "none",
};

const btn = {
  width: "100%",
  marginTop: 10,
  padding: 12,
  borderRadius: 12,
  border: "none",
  background: "#22c55e",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
};

const btn2 = {
  width: "100%",
  marginTop: 10,
  padding: 12,
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.2)",
  background: "transparent",
  color: "white",
  cursor: "pointer",
};