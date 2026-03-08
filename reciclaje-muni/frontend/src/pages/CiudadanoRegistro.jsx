import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ciudadanoRegister } from "../services/reciclaje.service";
import { useAuth } from "../auth/useAuth";
import bg from "../assets/reciclaje1.jpeg";

export default function CiudadanoRegistro() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    cui: "",
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    telefono: "",
    direccion: "",
  });

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const res = await ciudadanoRegister(form);
      login(res.data);
      navigate("/ciudadano/denuncias");
    } catch (err) {
      setMsg(err?.response?.data?.message || "No se pudo registrar el ciudadano.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={wrap(bg)}>
      <div style={box}>
        <h2>Registro Ciudadano</h2>

        <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
          <input
            style={inp}
            placeholder="CUI"
            value={form.cui}
            onChange={(e) => setForm({ ...form, cui: e.target.value })}
          />

          <input
            style={inp}
            placeholder="Nombre"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          />

          <input
            style={inp}
            placeholder="Apellido"
            value={form.apellido}
            onChange={(e) => setForm({ ...form, apellido: e.target.value })}
          />

          <input
            style={inp}
            placeholder="Correo"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            style={inp}
            type="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <input
            style={inp}
            placeholder="Teléfono"
            value={form.telefono}
            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
          />

          <input
            style={inp}
            placeholder="Dirección"
            value={form.direccion}
            onChange={(e) => setForm({ ...form, direccion: e.target.value })}
          />

          {msg && (
            <div style={errorBox}>
              {msg}
            </div>
          )}

          <button style={btn} disabled={loading}>
            {loading ? "Registrando..." : "Registrarse"}
          </button>
        </form>

        <div style={{ marginTop: 14, opacity: 0.9 }}>
          ¿Ya tienes cuenta?{" "}
          <Link to="/ciudadano/login" style={{ color: "#86efac" }}>
            Iniciar sesión
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
  width: 460,
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