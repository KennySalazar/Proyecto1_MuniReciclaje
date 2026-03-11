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
import PuntosVerdes from "./pages/PuntosVerdes";
import EntregasReciclaje from "./pages/EntregasReciclaje";
import ContenedoresEstado from "./pages/ContenedoresEstado";
import VaciadosProgramados from "./pages/VaciadosProgramados";
import AlertasContenedor from "./pages/AlertasContenedor";
import PortalPublico from "./pages/PortalPublico";
import CiudadanoLogin from "./pages/CiudadanoLogin";
import CiudadanoRegistro from "./pages/CiudadanoRegistro";
import ConsultaPortal from "./pages/ConsultaPortal";
import CiudadanoDashboard from "./pages/CiudadanoDashboard";
import DenunciaCiudadana from "./pages/DenunciaCiudadana";
import DenunciasAdmin from "./pages/DenunciasAdmin";
import SeguimientoDenuncias from "./pages/SeguimientoDenuncias";
import PuntosVerdesCiudadano from "./pages/PuntosVerdesCiudadano";
import EstadisticasCiudadano from "./pages/EstadisticasCiudadano";
import ReportesRecoleccion from "./pages/ReportesRecoleccion";
import ReportesReciclaje from "./pages/ReportesReciclaje";  
import ReportesDenuncias from "./pages/ReportesDenuncias";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Portal público */}
          <Route path="/" element={<PortalPublico />} />
          <Route path="/portal-publico" element={<PortalPublico />} />
          <Route path="/consulta-portal" element={<ConsultaPortal />} />

          {/* Ciudadano */}
          <Route path="/ciudadano/login" element={<CiudadanoLogin />} />
          <Route path="/ciudadano/registro" element={<CiudadanoRegistro />} />
          <Route path="/ciudadano/dashboard" element={<CiudadanoDashboard />} />
          <Route path="/ciudadano/denuncias" element={<DenunciaCiudadana />} />
          <Route path="/ciudadano/seguimiento" element={<SeguimientoDenuncias />} />
          <Route path="/ciudadano/puntos-verdes" element={<PuntosVerdesCiudadano />} />
          <Route path="/ciudadano/estadisticas" element={<EstadisticasCiudadano/>}/>
          
          {/* Acceso municipal */}
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
            <Route path="/puntos-verdes" element={<PuntosVerdes />} />
            <Route path="/vaciados-programados" element={<VaciadosProgramados />} />
            <Route path="/contenedores-estado" element={<ContenedoresEstado />} />
            <Route path="/entregas-reciclaje" element={<EntregasReciclaje />} />
            <Route path="/alertas-contenedores" element={<AlertasContenedor />} />
            <Route path="/portal-publico" element={<PortalPublico />} />
            <Route path="/denuncias-admin" element={<DenunciasAdmin />} />
            <Route path="/reportes-recoleccion" element={<ReportesRecoleccion />} />
            <Route path="/reportes-reciclaje" element={<ReportesReciclaje />} />
            <Route path="/reportes-denuncias" element={<ReportesDenuncias />} />
          


          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}