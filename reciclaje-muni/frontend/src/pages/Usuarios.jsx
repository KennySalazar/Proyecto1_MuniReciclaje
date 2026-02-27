import { useAuth } from "../auth/useAuth";

export default function Usuarios() {
  const { user } = useAuth();

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h2>Módulo Usuarios</h2>
      <p>Usuario logueado:</p>
      <pre>{JSON.stringify(user, null, 2)}</pre>

      <p>
        (Aquí luego conectamos endpoints tipo: GET /api/usuarios, POST /api/usuarios, etc.)
      </p>
    </div>
  );
}