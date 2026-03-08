import { useAuth } from "../auth/useAuth";
import { useNavigate } from "react-router-dom";

export default function CiudadanoDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const cerrar = () => {
    logout();
    navigate("/");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "white", padding: 40 }}>
      <h1>Panel Ciudadano</h1>

      <p>Bienvenido {user?.nombre}</p>

      <div style={{ marginTop: 30, display: "flex", gap: 20 }}>
        <button onClick={() => navigate("/consulta-rutas")} style={btn}>
          Ver rutas de recolección
        </button>

        <button onClick={() => navigate("/ciudadano/denuncias")} style={btn}>
          Crear denuncia
        </button>
      </div>

      <button onClick={cerrar} style={{ marginTop: 40 }}>
        Cerrar sesión
      </button>
    </div>
  );
}

const btn = {
  padding: "12px 16px",
  borderRadius: 10,
  border: "none",
  background: "#22c55e",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
};