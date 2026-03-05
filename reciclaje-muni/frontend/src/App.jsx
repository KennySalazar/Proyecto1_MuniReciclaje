import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Usuarios from "./pages/Usuarios";
import Rutas from "./pages/Rutas";

import AuthProvider from "./auth/AuthProvider";
import RequireAuth from "./auth/RequireAuth";
import Camiones from "./pages/Camiones";
import Asignaciones from "./pages/Asignaciones";
import Generacion from "./pages/Generacion";
import Incidencias from "./pages/Incidencias";
import Monitoreo from "./pages/Monitoreo";
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/usuarios" element={<RequireAuth><Usuarios /></RequireAuth>} />
          <Route path="/rutas" element={<RequireAuth><Rutas /></RequireAuth>} />
          <Route path="/camiones" element={<RequireAuth><Camiones /></RequireAuth>} />
          <Route path="/asignaciones" element={<RequireAuth><Asignaciones /></RequireAuth>} />
          <Route path="/generacion" element={<RequireAuth><Generacion/></RequireAuth>} />
          <Route path="/monitoreo" element={<RequireAuth><Monitoreo/></RequireAuth>} />
          <Route path="/incidencias" element={<RequireAuth><Incidencias/></RequireAuth>} />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}