import { useAuth } from "../auth/useAuth";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={{ display: "flex", minHeight: "100dvh", fontFamily: "system-ui" }}>
      
      {}
      <aside
        style={{
          width: 240,
          background: "#111827",
          color: "white",
          padding: 20,
        }}
      >
        <h3 style={{ marginTop: 0 }}>Panel Municipal</h3>
        <nav style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          <a href="#" style={linkStyle}>Dashboard</a>
          <a href="/usuarios" style={linkStyle}>Usuarios</a>
          <a href="#" style={linkStyle}>Rutas</a>
          <a href="#" style={linkStyle}>Puntos Verdes</a>
          <a href="#" style={linkStyle}>Denuncias</a>
          <a href="#" style={linkStyle}>Reportes</a>
        </nav>
      </aside>

      {}
      <div style={{ flex: 1, background: "#0f172a", color: "white" }}>
        
        {}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div>
            {user?.nombre} ({user?.rol})
          </div>

          <button
            onClick={handleLogout}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.2)",
              background: "transparent",
              color: "white",
              cursor: "pointer",
            }}
          >
            Cerrar sesión
          </button>
        </div>

        <div style={{ padding: 24 }}>
          <h1>Dashboard</h1>
          <p>Bienvenido al sistema municipal.</p>
        </div>
      </div>
    </div>
  );
}

const linkStyle = {
  color: "white",
  textDecoration: "none",
  opacity: 0.85,
};