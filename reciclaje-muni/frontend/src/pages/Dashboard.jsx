import { useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

const menuByRole = {
  ADMIN: [
    { label: "Dashboard", to: "/dashboard" },
    { label: "Usuarios", to: "/usuarios" },
    { label: "Rutas", to: "/rutas" },
    { label: "Puntos Verdes", to: "/puntos-verdes" },
    { label: "Denuncias", to: "/denuncias" },
    { label: "Reportes", to: "/reportes" },
  ],
  COORDINADOR: [
    { label: "Dashboard", to: "/dashboard" },
    { label: "Rutas", to: "/rutas" },
    { label: "Camiones", to: "/camiones" },
    { label: "Asignaciones", to: "/asignaciones" },
    { label: "Monitoreo", to: "/monitoreo" },
    { label: "Incidencias", to: "/incidencias" },
    { label: "Reportes", to: "/reportes" },
  ],
  OPERADOR: [
    { label: "Dashboard", to: "/dashboard" },
    { label: "Puntos Verdes", to: "/puntos-verdes" },
    { label: "Denuncias", to: "/denuncias" },
  ],
  AUDITOR: [
    { label: "Dashboard", to: "/dashboard" },
    { label: "Reportes", to: "/reportes" },
  ],
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const items = useMemo(() => {
    return menuByRole[user?.rol] ?? [{ label: "Dashboard", to: "/dashboard" }];
  }, [user?.rol]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={{ display: "flex", minHeight: "100dvh", fontFamily: "system-ui" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 240,
          background: "#111827",
          color: "white",
          padding: 20,
          borderRight: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Panel Municipal</h3>

        <nav style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map((it) => {
            const active = location.pathname === it.to;
            return (
              <Link
                key={it.to}
                to={it.to}
                style={{
                  ...linkStyle,
                  opacity: active ? 1 : 0.85,
                  background: active ? "rgba(255,255,255,0.10)" : "transparent",
                  border: active ? "1px solid rgba(255,255,255,0.12)" : "1px solid transparent",
                }}
              >
                {it.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Content */}
      <div style={{ flex: 1, background: "#0f172a", color: "white" }}>
        {/* Topbar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            background: "linear-gradient(180deg, rgba(17,24,39,0.55), rgba(15,23,42,0))",
          }}
        >
          <div style={{ fontWeight: 600 }}>
            {user?.nombre} <span style={{ opacity: 0.8 }}>({user?.rol})</span>
          </div>

          <button
            onClick={handleLogout}
            style={{
              padding: "8px 14px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.2)",
              background: "transparent",
              color: "white",
              cursor: "pointer",
            }}
          >
            Cerrar sesión
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 24 }}>
          <h1 style={{ marginTop: 0 }}>Dashboard</h1>
          <p style={{ opacity: 0.85 }}>Bienvenido al sistema municipal.</p>

          {/* mini resumen por rol */}
          {user?.rol === "COORDINADOR" && (
            <div style={card}>
              <h3 style={{ marginTop: 0 }}>Acciones del Coordinador</h3>
              <ul style={{ margin: 0, paddingLeft: 18, opacity: 0.9 }}>
                <li>Planificación de rutas de recolección</li>
                <li>Asignación de camiones y conductores</li>
                <li>Monitoreo en tiempo real de recolección</li>
                <li>Resolución de incidencias</li>
                <li>Reportes operativos</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const linkStyle = {
  color: "white",
  textDecoration: "none",
  padding: "10px 12px",
  borderRadius: 10,
  display: "block",
};

const card = {
  marginTop: 16,
  padding: 16,
  borderRadius: 14,
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.10)",
};