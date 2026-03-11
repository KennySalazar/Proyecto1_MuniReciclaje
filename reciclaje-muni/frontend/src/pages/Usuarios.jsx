import { useEffect, useMemo, useState } from "react";
import {
  createUsuarioSistema,
  deleteUsuarioSistema,
  getCiudadanosRegistrados,
  getRolesDisponibles,
  getUsuariosSistema,
  updateUsuarioSistema,
} from "../services/reciclaje.service";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [ciudadanos, setCiudadanos] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [editandoId, setEditandoId] = useState(null);
  const [filtroRol, setFiltroRol] = useState("");

  const [form, setForm] = useState({
    id_rol: "",
    id_ciudadano: "",
    nombre: "",
    email: "",
    password: "",
  });

  const load = async () => {
    try {
      setLoading(true);

      const [r1, r2, r3] = await Promise.all([
        getUsuariosSistema(),
        getRolesDisponibles(),
        getCiudadanosRegistrados(),
      ]);

      setUsuarios(r1.data?.data ?? r1.data ?? []);
      setRoles(r2.data?.data ?? r2.data ?? []);
      setCiudadanos(r3.data?.data ?? r3.data ?? []);
      setMsg("");
    } catch (err) {
      setMsg(err?.response?.data?.message || "No se pudo cargar la información");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const usuariosFiltrados = useMemo(() => {
    if (!filtroRol) return usuarios;
    return usuarios.filter((u) => u.rol === filtroRol);
  }, [usuarios, filtroRol]);

  const limpiarFormulario = () => {
    setForm({
      id_rol: "",
      id_ciudadano: "",
      nombre: "",
      email: "",
      password: "",
    });
    setEditandoId(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      const payload = {
        id_rol: Number(form.id_rol),
        id_ciudadano: form.id_ciudadano ? Number(form.id_ciudadano) : null,
        nombre: form.nombre,
        email: form.email,
        password: form.password,
      };

      if (editandoId) {
        await updateUsuarioSistema(editandoId, payload);
        setMsg("Usuario actualizado correctamente");
      } else {
        await createUsuarioSistema(payload);
        setMsg("Usuario creado correctamente");
      }

      limpiarFormulario();
      await load();
    } catch (err) {
      setMsg(err?.response?.data?.message || "No se pudo guardar el usuario");
    }
  };

  const editar = (u) => {
    const rolEncontrado = roles.find((r) => r.nombre === u.rol);

    setForm({
      id_rol: rolEncontrado ? String(rolEncontrado.id) : "",
      id_ciudadano: u.id_ciudadano ? String(u.id_ciudadano) : "",
      nombre: u.nombre || "",
      email: u.email || "",
      password: "",
    });

    setEditandoId(u.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const eliminar = async (id) => {
    const ok = window.confirm("¿Seguro que deseas eliminar este usuario?");
    if (!ok) return;

    try {
      await deleteUsuarioSistema(id);
      setMsg("Usuario eliminado correctamente");
      if (editandoId === id) limpiarFormulario();
      await load();
    } catch (err) {
      setMsg(err?.response?.data?.message || "No se pudo eliminar el usuario");
    }
  };

  return (
    <div style={{ padding: 24, color: "white" }}>
      <h1 style={{ marginTop: 0 }}>Gestión de Usuarios</h1>
      <p style={{ opacity: 0.85 }}>
        Administra usuarios internos del sistema y consulta los ciudadanos registrados.
      </p>

      {msg && <div style={msgBox}>{msg}</div>}
      {loading && <div style={{ marginBottom: 12 }}>Cargando información...</div>}

      <div style={{ display: "grid", gridTemplateColumns: "420px 1fr", gap: 16 }}>
        <div style={card}>
          <h3 style={{ marginTop: 0 }}>
            {editandoId ? "Editar usuario" : "Crear usuario"}
          </h3>

          <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
            <select
              style={inp}
              value={form.id_rol}
              onChange={(e) => setForm({ ...form, id_rol: e.target.value })}
              required
            >
              <option value="">Seleccione rol</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombre}
                </option>
              ))}
            </select>

            <input
              style={inp}
              placeholder="Nombre"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              required
            />

            <input
              style={inp}
              type="email"
              placeholder="Correo"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />

            <input
              style={inp}
              type="password"
              placeholder={editandoId ? "Nueva contraseña (opcional)" : "Contraseña"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required={!editandoId}
            />

            <div style={{ display: "flex", gap: 10 }}>
              <button style={btn} type="submit">
                {editandoId ? "Actualizar" : "Crear"}
              </button>

              {editandoId && (
                <button type="button" style={btn2} onClick={limpiarFormulario}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        <div style={card}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 12,
            }}
          >
            <h3 style={{ margin: 0 }}>Usuarios del sistema</h3>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <select
                style={{ ...inp, minWidth: 220 }}
                value={filtroRol}
                onChange={(e) => setFiltroRol(e.target.value)}
              >
                <option value="">Todos los roles</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.nombre}>
                    {r.nombre}
                  </option>
                ))}
              </select>

              <button
                type="button"
                style={btn2}
                onClick={() => setFiltroRol("")}
              >
                Limpiar filtro
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 12, opacity: 0.85, fontSize: 13 }}>
            Mostrando <b>{usuariosFiltrados.length}</b> usuario(s)
            {filtroRol ? (
              <> del rol <b>{filtroRol}</b></>
            ) : null}
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {usuariosFiltrados.map((u) => (
              <div key={u.id} style={item}>
                <div style={{ fontWeight: 900 }}>{u.nombre}</div>
                <div>Correo: {u.email}</div>
                <div>Rol: {u.rol}</div>

                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <button type="button" style={btnMini} onClick={() => editar(u)}>
                    Editar
                  </button>
                  <button type="button" style={btnDanger} onClick={() => eliminar(u.id)}>
                    Eliminar
                  </button>
                </div>
              </div>
            ))}

            {!loading && usuariosFiltrados.length === 0 && (
              <div>No hay usuarios para el filtro seleccionado.</div>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16, ...card }}>
        <h3 style={{ marginTop: 0 }}>Ciudadanos registrados</h3>

        <div style={{ display: "grid", gap: 10 }}>
          {ciudadanos.map((c) => (
            <div key={c.id} style={item}>
              <div style={{ fontWeight: 900 }}>
                {c.nombre} {c.apellido}
              </div>
              <div>CUI: {c.cui}</div>
              <div>Correo: {c.email || "N/D"}</div>
              <div>Teléfono: {c.telefono || "N/D"}</div>
              <div>Dirección: {c.direccion || "N/D"}</div>
            </div>
          ))}

          {!loading && ciudadanos.length === 0 && <div>No hay ciudadanos registrados.</div>}
        </div>
      </div>
    </div>
  );
}

const card = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(238, 12, 12, 0.87)",
  borderRadius: 14,
  padding: 14,
};

const item = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(211, 233, 12, 0.9)",
  borderRadius: 10,
  padding: 10,
};

const inp = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgb(250, 239, 239)",
  background: "#ee4b0a",
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
  flex: 1,
};

const btn2 = {
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(115, 232, 13, 0.86)",
  background: "rgba(255,255,255,0.06)",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};

const btnMini = {
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(255,255,255,0.08)",
  color: "white",
  cursor: "pointer",
};

const btnDanger = {
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid rgba(239,68,68,0.35)",
  background: "rgba(239,68,68,0.20)",
  color: "white",
  cursor: "pointer",
};

const msgBox = {
  marginBottom: 14,
  padding: "12px 14px",
  borderRadius: 12,
  background: "rgba(59,130,246,0.12)",
  border: "1px solid rgba(59,130,246,0.30)",
};