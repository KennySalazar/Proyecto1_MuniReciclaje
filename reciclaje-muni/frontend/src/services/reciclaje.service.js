import api from "../api/axios";

export const getTiposMaterial = () => api.get("/tipos-material");
export const getContenedores = (idPuntoReciclaje) =>
  api.get("/contenedores", {
    params: idPuntoReciclaje ? { id_punto_reciclaje: idPuntoReciclaje } : {},
  });

export const getEntregasReciclaje = () => api.get("/entregas-reciclaje");
export const createEntregaReciclaje = (payload) => api.post("/entregas-reciclaje", payload);

export const getPuntosVerdes = () => api.get("/puntos-verdes");

export const getVaciadosProgramados = () => api.get("/vaciados-programados");
export const createVaciadoProgramado = (payload) => api.post("/vaciados-programados", payload);
export const updateEstadoVaciado = (id, payload) =>
  api.patch(`/vaciados-programados/${id}/estado`, payload);

export const getNotificacionesContenedor = () => api.get("/notificaciones-contenedor");
export const marcarNotificacionLeida = (id) =>
  api.patch(`/notificaciones-contenedor/${id}/leer`);

export const ciudadanoRegister = (payload) => api.post("/ciudadanos/register", payload);
export const ciudadanoLogin = (payload) => api.post("/ciudadanos/login", payload);


export const getCatalogosDenuncia = () => api.get("/denuncias/catalogos");

export const crearDenunciaCiudadana = (formData) =>
  api.post("/ciudadano/denuncias", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const getMisDenuncias = () => api.get("/ciudadano/denuncias");

export const getDenuncias = () => api.get("/denuncias");
export const getDenunciaDetalle = (id) => api.get(`/denuncias/${id}`);
export const cambiarEstadoDenuncia = (id, payload) =>
  api.patch(`/denuncias/${id}/estado`, payload);

export const asignarCuadrillaDenuncia = (payload) =>
  api.post("/denuncias/asignar-cuadrilla", payload);

export const subirFotoDenuncia = (id, formData) =>
  api.post(`/denuncias/${id}/fotos`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const getPuntosVerdesPublicos = () => api.get("/portal/puntos-verdes");

export const getEstadisticasPublicas = () =>
  api.get("/portal/estadisticas");

export const getReporteMaterialPorTipo = () =>
  api.get("/reportes-reciclaje/material-por-tipo");

export const getReportePuntosVerdesActivos = () =>
  api.get("/reportes-reciclaje/puntos-verdes-activos");

export const getReporteTendenciasCiudadanas = () =>
  api.get("/reportes-reciclaje/tendencias-ciudadanas");

export const getReporteComparativaMateriales = () =>
  api.get("/reportes-reciclaje/comparativa-materiales");

export const getUsuariosSistema = () => api.get("/usuarios");
export const getRolesDisponibles = () => api.get("/usuarios/roles-disponibles");
export const getCiudadanosRegistrados = () => api.get("/usuarios/ciudadanos-registrados");
export const createUsuarioSistema = (payload) => api.post("/usuarios", payload);
export const updateUsuarioSistema = (id, payload) => api.put(`/usuarios/${id}`, payload);
export const deleteUsuarioSistema = (id) => api.delete(`/usuarios/${id}`);
