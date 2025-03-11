import {
  CrearTorneoDTO,
  GuardarResultadosDTO,
  ModificarBasesTorneoDTO,
  ModificarTorneoDTO,
} from "@/interfaces/Torneo";
import { http } from "./index";

export const getTorneos = async () => {
  return http.get(`Torneo`);
};

export const isSaveTournament = async (idTorneo: number) => {
  console.log("isSaveTournament idTorneo: ", idTorneo)
  return http.get(`Torneo/Gestion/issave/${idTorneo}`);
};

export const getTorneo = async (idTorneo: number) => {
  console.log("getTorneo idTorneo: ", idTorneo)
  return http.get(`Torneo/id/${idTorneo}`);
};

export const descargarBasesTorneo = async (idTorneo: number) => {
  return http.get(`Torneo/bases/${idTorneo}`, { responseType: "blob" });
};

export const getTorneosCreadosUsuario = async (idUsuario: string) => {
  return http.get(`Torneo/Gestion/Creados/${idUsuario}`);
};

export const getInfoTorneoCreado = async (idTorneo: number) => {
  console.log("getInfoTorneoCreado idTorneo: ", idTorneo)
  return http.get(`Torneo/Gestion/Info-torneo/${idTorneo}`);
};

export const getInfoTorneoEquipoCreado = async (idTorneo: number) => {
  return http.get(`Torneo/Gestion/Info-torneo-Equipo/${idTorneo}`);
};

export const getPartidasTorneo = async (idTorneo: number) => {
  console.log("getPartidasTorneo idTorneo: ", idTorneo)
  return http.get(`Torneo/Gestion/Partidas/${idTorneo}`);
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
  torneoData: ModificarBasesTorneoDTO
) => {
  return http.patch(`Torneo/Gestion/subir-bases`, torneoData);
};

export const deleteTorneo = async (idTorneo: number) => {
  return http.delete(`Torneo/Gestion/${idTorneo}`);
}
export const getEquiposByTorneoAsync = async (idTorneo: number) => {
  return http.get(`Torneo/equipos/${idTorneo}`);
};
