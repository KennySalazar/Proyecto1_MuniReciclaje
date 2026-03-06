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