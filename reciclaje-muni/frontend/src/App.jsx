import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Usuarios from "./pages/Usuarios";
import Rutas from "./pages/Rutas";

import AuthProvider from "./auth/AuthProvider";
import RequireAuth from "./auth/RequireAuth";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/usuarios" element={<RequireAuth><Usuarios /></RequireAuth>} />
          <Route path="/rutas" element={<RequireAuth><Rutas /></RequireAuth>} />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}