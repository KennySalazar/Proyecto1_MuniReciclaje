import { useNavigate } from "react-router-dom";
import bg from "../assets/reciclaje1.jpeg";

export default function PortalPublico() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: `linear-gradient(rgba(2,6,23,0.65), rgba(2,6,23,0.78)), url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 920,
          display: "grid",
          gridTemplateColumns: "1.2fr 0.8fr",
          gap: 24,
          alignItems: "center",
        }}
      >
        <div>
          <h1 style={{ fontSize: 48, marginBottom: 14 }}>
            Sistema Municipal de Residuos y Reciclaje
          </h1>
          <p style={{ fontSize: 18, opacity: 0.9, lineHeight: 1.6 }}>
            Consultá rutas de recolección, horarios, puntos verdes y gestioná denuncias ciudadanas.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 22 }}>
            <button style={btnMenu} onClick={() => navigate("/login")}>
              Acceso municipal
            </button>
            <button style={btnSecondary} onClick={() => navigate("/ciudadano/login")}>
              Iniciar sesión ciudadano
            </button>
            <button style={btnSecondary} onClick={() => navigate("/ciudadano/registro")}>
              Registrarse
            </button>
          </div>
        </div>

        <div style={card}>
          <h3 style={{ marginTop: 0 }}>Portal Público</h3>

          <div style={{ display: "grid", gap: 10 }}>
            <button style={btnMenu} onClick={() => navigate("/consulta-rutas")}>
              Ver rutas en mapa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const card = {
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(241, 16, 16, 0.82)",
  borderRadius: 18,
  padding: 20,
  backdropFilter: "blur(10px)",
};

const btnSecondary = {
  padding: "12px 18px",
  borderRadius: 12,
  border: "1px solid rgba(235, 17, 17, 0.77)",
  background: "rgba(224, 191, 6, 0.08)",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};

const btnMenu = {
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(120, 230, 10, 0.9)",
  background: "rgba(142, 230, 10, 0.05)",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
  textAlign: "left",
};