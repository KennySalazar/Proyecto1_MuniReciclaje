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
import Reportes from "./pages/Reportes";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          >
            <Route path="/dashboard" element={<div />} />
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/rutas" element={<Rutas />} />
            <Route path="/camiones" element={<Camiones />} />
            <Route path="/asignaciones" element={<Asignaciones />} />
            <Route path="/generacion" element={<Generacion />} />
            <Route path="/monitoreo" element={<Monitoreo />} />
            <Route path="/incidencias" element={<Incidencias />} />
            <Route path="/reportes" element={<Reportes />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}