import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import bg from "../assets/reciclaje1.jpeg";

export default function CiudadanoLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      // aquí luego conectas tu endpoint real
      navigate("/ciudadano/denuncias");
    } catch {
      setMsg("No se pudo iniciar sesión.");
    }
  };

  return (
    <div style={wrap(bg)}>
      <div style={box}>
        <h2>Ingreso Ciudadano</h2>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
          <input style={inp} placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input style={inp} type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button style={btn}>Ingresar</button>
        </form>

        {msg && <div style={{ marginTop: 10 }}>{msg}</div>}

        <div style={{ marginTop: 14, opacity: 0.9 }}>
          ¿No tienes cuenta? <Link to="/ciudadano/registro" style={{ color: "#86efac" }}>Registrarse</Link>
        </div>
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