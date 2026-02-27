import { useState } from "react";
import api from "../api/axios";
import { useAuth } from "../auth/useAuth";
import { useNavigate } from "react-router-dom";
import bg from "../assets/reciclaje1.jpeg";

export default function Login() {
  const [email, setEmail] = useState("admin@muni.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/login", { email, password });
      login(res.data);
      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0, 
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.65)",
        }}
      />

      {}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 420,
          borderRadius: 18,
          padding: 24,
          background: "rgba(255,255,255,0.10)",
          border: "1px solid rgba(255,255,255,0.18)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
          color: "white",
        }}
      >
        <div style={{ marginBottom: 14 }}>
          <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>
            Sistema Municipal
          </h2>
          <p style={{ margin: "6px 0 0", opacity: 0.9 }}>
            Gestión de Residuos y Reciclaje
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label style={{ fontSize: 13, opacity: 0.9 }}>Correo</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@muni.com"
            style={{
              width: "100%",
              marginTop: 6,
              marginBottom: 14,
              padding: "12px 12px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.25)",
              background: "rgba(0,0,0,0.35)",
              color: "white",
              outline: "none",
            }}
          />

          <label style={{ fontSize: 13, opacity: 0.9 }}>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            style={{
              width: "100%",
              marginTop: 6,
              marginBottom: 10,
              padding: "12px 12px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.25)",
              background: "rgba(0,0,0,0.35)",
              color: "white",
              outline: "none",
            }}
          />

          {error && (
            <div
              style={{
                marginTop: 8,
                marginBottom: 10,
                padding: "10px 12px",
                borderRadius: 10,
                background: "rgba(220, 38, 38, 0.18)",
                border: "1px solid rgba(220, 38, 38, 0.35)",
                color: "#fecaca",
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}

          <button
            disabled={loading}
            style={{
              width: "100%",
              marginTop: 8,
              padding: "12px 14px",
              borderRadius: 12,
              border: "none",
              background: loading
                ? "rgba(34,197,94,0.55)"
                : "rgba(34,197,94,0.92)",
              color: "white",
              fontWeight: 800,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Entrando..." : "Iniciar sesión"}
          </button>
        </form>

        <div style={{ marginTop: 14, fontSize: 12, opacity: 0.85 }}>
           Municipalidad — Panel Administrativo
        </div>
      </div>
    </div>
  );
}