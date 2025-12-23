import {
  CrearTorneoDTO,
  GenerarOtraRondaEquiposRequestDTO,
  GenerarRondaEquiposRequestDTO,
  GuardarResultadosDTO,
  HandlerMostarClasificacionDTO,
  HandlerMostarListasDTO,
  ModificarBasesTorneoDTO,
  ModificarPairingTorneoEquiposDTO,
  ModificarTorneoDTO,
} from "@/interfaces/Torneo";
import { http } from "./index";

export const getTorneos = async () => {
  return http.get(`Torneo`);
};

export const getTorneosProximosPaginadosAsync = async (
  pageNumber = 1,
  pageSize = 10
) => {
  return http.get(
    `torneo/proximos?pageNumber=${pageNumber}&pageSize=${pageSize}`
  );
};

export const getTorneosPasadosPaginadosAsync = async (
  pageNumber = 1,
  pageSize = 10
) => {
  return http.get(
    `torneo/pasados?pageNumber=${pageNumber}&pageSize=${pageSize}`
  );
};

export const buscarTorneosPorNombreAsync = async (nombre: string) => {
  return http.get(`torneo/buscar?nombre=${encodeURIComponent(nombre)}`);
};

export const isSaveTournament = async (idTorneo: number) => {
  return http.get(`Torneo/Gestion/issave/${idTorneo}`);
};

export const getTorneo = async (idTorneo: number) => {
  return http.get(`Torneo/id/${idTorneo}`);
};

export const descargarBasesTorneo = async (idTorneo: number) => {
  return http.get(`Torneo/bases/${idTorneo}`, { responseType: "blob" });
};

export const getTorneosCreadosUsuario = async (idUsuario: string) => {
  return http.get(`Torneo/Gestion/Creados/${idUsuario}`);
};

export const getInfoTorneoCreado = async (idTorneo: number) => {
  return http.get(`Torneo/Gestion/Info-torneo/${idTorneo}`);
};

export const getInfoTorneoCreadoMasAsync = async (idTorneo: number) => {
  return http.get(`Torneo/Gestion/Info-torneo-mas/${idTorneo}`);
};

export const getInfoTorneoEquipoCreado = async (idTorneo: number) => {
  return http.get(`Torneo/Gestion/Info-torneo-Equipo/${idTorneo}`);
};

export const getPartidasTorneo = async (idTorneo: number) => {
  return http.get(`Torneo/Gestion/Partidas/${idTorneo}`);
};
export const getPartidasTorneoMas = async (idTorneo: number) => {
  return http.get(`Torneo/Gestion/Mas/Partidas/${idTorneo}`);
};

export const getPartidasTorneoByRonda = async (
  idTorneo: number,
  idRonda: number
) => {
  return http.get(`Torneo/Gestion/Partidas/${idTorneo}/${idRonda}`);
};

export const guardarResultados = async (
  guardarResultados: GuardarResultadosDTO
) => {
  return http.post(`Ganador`, guardarResultados);
};

export const crearTorneo = async (torneoData: CrearTorneoDTO) => {
  return http.post(`Torneo`, torneoData);
};

export const modificarTorneo = async (torneoData: ModificarTorneoDTO) => {
  return http.patch(`Torneo/Gestion/editar`, torneoData);
};

export const ModificarBasesTorneoAsync = async (
  request: ModificarBasesTorneoDTO
) => {
  return http.patch(`Torneo/Gestion/subir-bases/${request.idTorneo}`, request);
};

export const HandlerMostarListasAsync = async (
  request: HandlerMostarListasDTO
) => {
  return http.patch(
    `Torneo/Gestion/Handler-Listas/${request.idTorneo}`,
    request
  );
};

export const HandlerMostarClasificacionAsync = async (
  request: HandlerMostarClasificacionDTO
) => {
  return http.patch(
    `Torneo/Gestion/Handler-Clasificacion/${request.idTorneo}`,
    request
  );
};

export const deleteTorneo = async (idTorneo: number) => {
  return http.delete(`Torneo/Gestion/${idTorneo}`);
};

export const getEquiposByTorneoAsync = async (idTorneo: number) => {
  return http.get(`Torneo/equipos/${idTorneo}`);
};

export const generarRondaTorneoEquipos = async (
  request: GenerarRondaEquiposRequestDTO
) => {
  return http.post(`Torneo/Gestion/Generar-Ronda-Equipos`, request);
};

export const generarOtraRondaTorneoEquipos = async (
  request: GenerarOtraRondaEquiposRequestDTO
) => {
  return http.post(`Torneo/Gestion/Generar-Otra-Ronda-Equipos`, request);
};

export const modificarPairingTorneoEquipos = async (
  request: ModificarPairingTorneoEquiposDTO
) => {
  return http.post(
    `Torneo/Gestion/Equipos/Modificar-Pairing-Equipos/${request.idTorneo}`,
    request
  );
};

export const getEquiposDisponiblesAsync = async (idTorneo: number) => {
  return http.get(`Torneo/Gestion/Equipos/Equipos-disponibles/${idTorneo}`);
};
