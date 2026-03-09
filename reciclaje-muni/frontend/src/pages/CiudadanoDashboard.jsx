import { useAuth } from "../auth/useAuth";
import { useNavigate } from "react-router-dom";
import bg from "../assets/reciclaje1.jpeg";

export default function CiudadanoDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const cerrar = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: `linear-gradient(rgba(2,6,23,0.82), rgba(2,6,23,0.9)), url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "white",
        padding: 24,
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 24,
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 40 }}>Panel Ciudadano</h1>
            <p style={{ margin: "8px 0 0", opacity: 0.9, fontSize: 17 }}>
              Bienvenido, <b>{user?.nombre || "Ciudadano"}</b>
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={() => navigate("/")}
              style={btnSecondary}
            >
              Volver al portal público
            </button>

            <button
              onClick={cerrar}
              style={btnDanger}
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* Resumen */}
        <div style={heroCard}>
          <h2 style={{ marginTop: 0, marginBottom: 10 }}>Servicios disponibles</h2>
          <p style={{ opacity: 0.92, lineHeight: 1.7, margin: 0 }}>
            Desde aquí puedes consultar rutas de recolección, registrar denuncias ciudadanas
            sobre basureros clandestinos y dar seguimiento al estado de tus reportes.
          </p>
        </div>

        {/* Acciones */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
            marginTop: 24,
          }}
        >
          <div style={card}>
            <div style={iconCircle}>🗺️</div>
            <h3 style={title}>Consulta de puntos verdes</h3>
            <p style={desc}>
              Visualiza en el mapa los puntos verdes de recolección de reciclaje más cercanos a tu ubicación.
            </p>
            <button onClick={() => navigate("/puntos-verdes-ciudadano")} style={btnPrimary}>
              Ver puntos verdes
            </button>
          </div>

          <div style={card}>
            <div style={iconCircle}>📝</div>
            <h3 style={title}>Registrar denuncia</h3>
            <p style={desc}>
              Reporta un basurero clandestino con ubicación, descripción y fotografía.
            </p>
            <button onClick={() => navigate("/ciudadano/denuncias")} style={btnPrimary}>
              Crear denuncia
            </button>
          </div>

          <div style={card}>
            <div style={iconCircle}>📋</div>
            <h3 style={title}>Mis denuncias</h3>
            <p style={desc}>
              Consulta el estado actual de las denuncias que has registrado en el sistema.
            </p>
            <button onClick={() => navigate("/ciudadano/seguimiento")} style={btnPrimary}>
              Ver seguimiento
            </button>
          </div>

          <div style={card}>
            <div style={iconCircle}>♻️</div>
            <h3 style={title}>Portal ciudadano</h3>
            <p style={desc}>
              Regresa al portal público para consultar información general del sistema.
            </p>
            <button onClick={() => navigate("/")} style={btnPrimary}>
              Ir al portal
            </button>
          </div>
        </div>

        {/* Bloque informativo */}
        <div style={{ ...heroCard, marginTop: 24 }}>
          <h3 style={{ marginTop: 0 }}>Seguimiento de denuncias</h3>
          <p style={{ margin: 0, opacity: 0.9, lineHeight: 1.7 }}>
            Podrás consultar si tu denuncia se encuentra en estado <b>Recibida</b>,{" "}
            <b>En revisión</b>, <b>Asignada</b>, <b>En atención</b>, <b>Atendida</b> o{" "}
            <b>Cerrada</b>.
          </p>
        </div>
      </div>
    </div>
  );
}

const heroCard = {
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 18,
  padding: 22,
  backdropFilter: "blur(10px)",
};

const card = {
  background: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: 18,
  padding: 20,
  backdropFilter: "blur(8px)",
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const iconCircle = {
  width: 54,
  height: 54,
  borderRadius: "50%",
  background: "rgba(34,197,94,0.18)",
  border: "1px solid rgba(34,197,94,0.35)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 24,
};

const title = {
  margin: "2px 0 0",
  fontSize: 22,
};

const desc = {
  opacity: 0.9,
  lineHeight: 1.6,
  minHeight: 72,
};

const btnPrimary = {
  marginTop: "auto",
  padding: "12px 14px",
  borderRadius: 12,
  border: "none",
  background: "#22c55e",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
};

const btnSecondary = {
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(255,255,255,0.06)",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};

const btnDanger = {
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(239,68,68,0.35)",
  background: "rgba(239,68,68,0.16)",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};