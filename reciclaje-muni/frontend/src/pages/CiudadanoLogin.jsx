import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ciudadanoLogin } from "../services/reciclaje.service";
import { useAuth } from "../auth/useAuth";
import bg from "../assets/reciclaje1.jpeg";

export default function CiudadanoLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const res = await ciudadanoLogin({ email, password });
      login(res.data);
      navigate("/ciudadano/dashboard");
    } catch (err) {
      setMsg(err?.response?.data?.message || "No se pudo iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={wrap(bg)}>
      <div style={box}>
        <h2>Ingreso Ciudadano</h2>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
          <input
            style={inp}
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            style={inp}
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {msg && (
            <div style={errorBox}>
              {msg}
            </div>
          )}

          <button style={btn} disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <div style={{ marginTop: 14, opacity: 0.9 }}>
          ¿No tienes cuenta?{" "}
          <Link to="/ciudadano/registro" style={{ color: "#86efac" }}>
            Registrarse
          </Link>
        </div>

        <button
          type="button"
          onClick={() => navigate("/")}
          style={btnSecondary}
        >
          Volver al portal público
        </button>
      </div>
    </div>
  );
}

const wrap = (bg) => ({
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundImage: `linear-gradient(rgba(2,6,23,0.65), rgba(2,6,23,0.78)), url(${bg})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  padding: 24,
});

const box = {
  width: 420,
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 18,
  padding: 24,
  backdropFilter: "blur(10px)",
  color: "white",
};

const inp = {
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.15)",
  background: "rgba(0,0,0,0.22)",
  color: "white",
  outline: "none",
};

const btn = {
  padding: "12px 14px",
  borderRadius: 12,
  border: "none",
  background: "#22c55e",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
};

const btnSecondary = {
  marginTop: 12,
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(255,255,255,0.06)",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};

const errorBox = {
  padding: "10px 12px",
  borderRadius: 10,
  background: "rgba(220, 38, 38, 0.18)",
  border: "1px solid rgba(220, 38, 38, 0.35)",
  color: "#fecaca",
  fontSize: 13,
};