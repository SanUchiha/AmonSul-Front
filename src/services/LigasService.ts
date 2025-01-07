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
