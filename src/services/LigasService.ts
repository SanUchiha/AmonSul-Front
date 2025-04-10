import { AddLigaTorneoDTO } from "@/interfaces/Liga";
import { http } from "./index";

export const getLiga = async (idLiga: number) => {
  return http.get(`ligas/${idLiga}`);
};

export const getLigas = async () => {
  return http.get(`ligas`);
};

export const getTorneosOfLiga = async (idLiga: number) => {
  return http.get(`ligas/${idLiga}/torneos`);
};

export const getLigasNoTorneoAsync = async (idTorneo: number) => {
  return http.get(`ligas/no-liga-torneo/${idTorneo}`);
};

export const getLigasAsocidasATorneoAsync = async (idTorneo: number) => {
  return http.get(`ligas/torneo/${idTorneo}`);
};

export const addTorneoToLigaAsync = async (request: AddLigaTorneoDTO) => {
  return http.post(`ligas`, request);
};

export const deleteLigaTorneoAsync = async (
  idTorneo: number,
  idLiga: number
) => {
  return http.delete(`ligas/${idLiga}/torneo/${idTorneo}`);
};
