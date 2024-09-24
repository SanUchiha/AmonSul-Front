import { http } from "./index";

export const getTorneos = async () => {
  return http.get(`Torneo`);
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

export const getPartidasTorneo = async (idTorneo: number) => {
  return http.get(`Torneo/Gestion/Partidas/${idTorneo}`);
};

export const getPartidasTorneoByRonda = async (
  idTorneo: number,
  idRonda: number
) => {
  return http.get(`Torneo/Gestion/Partidas/${idTorneo}/${idRonda}`);
};
