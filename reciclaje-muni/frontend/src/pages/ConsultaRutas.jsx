export default function ConsultaRutas() {
  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "white", padding: 24 }}>
      <h1>Consulta Ciudadana de Rutas</h1>
      <p style={{ opacity: 0.85 }}>
        Aquí el ciudadano podrá ver las rutas de recolección, filtrarlas por zona o colonia y consultar horarios.
      </p>

      <div style={card}>
        <div style={{ marginBottom: 12 }}>
          Luego aquí vas a poner:
        </div>
        <ul style={{ lineHeight: 1.8 }}>
          <li>Mapa interactivo con todas las rutas</li>
          <li>Filtro por zona</li>
          <li>Filtro por colonia</li>
          <li>Calendario y horarios</li>
          <li>Búsqueda por dirección</li>
        </ul>
      </div>
    </div>
  );
}

const card = {
  marginTop: 16,
  padding: 16,
  borderRadius: 14,
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.10)",
};