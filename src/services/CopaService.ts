import { http } from "./index";

// Gestión de los torneos con formato Copa; solo el organizador. Si no se puede, el back responde 400 con el motivo

export const repartirGruposAsync = async (idTorneo: number) =>
  http.post(`Copa/${idTorneo}/Grupos/Repartir`, {});

export const cambiarGrupoAsync = async (
  idTorneo: number,
  idInscripcion: number,
  grupo: number
) => http.put(`Copa/${idTorneo}/Grupos/${idInscripcion}/${grupo}`, {});

export const generarGruposAsync = async (idTorneo: number) =>
  http.post(`Copa/${idTorneo}/Grupos/Generar`, {});

export const eliminarJornadasCopaAsync = async (idTorneo: number) =>
  http.delete(`Copa/${idTorneo}/Jornadas`);

export const retirarJugadorCopaAsync = async (
  idTorneo: number,
  idInscripcion: number
) => http.post(`Copa/${idTorneo}/Retirar/${idInscripcion}`, {});

export const generarEliminatoriaAsync = async (idTorneo: number) =>
  http.post(`Copa/${idTorneo}/Eliminatoria/Generar`, {});

export const eliminarEliminatoriaAsync = async (idTorneo: number) =>
  http.delete(`Copa/${idTorneo}/Eliminatoria`);

export const elegirQuienPasaAsync = async (
  idTorneo: number,
  idPartida: number,
  idUsuario: number
) => http.post(`Copa/${idTorneo}/Eliminatoria/${idPartida}/Pasa/${idUsuario}`, {});

export const cerrarCopaAsync = async (idTorneo: number) =>
  http.post(`Copa/${idTorneo}/Cerrar`, {});
