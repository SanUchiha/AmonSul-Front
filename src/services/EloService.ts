import { http } from "./index";

export const getEloUsuario = async (idUsuario: number) => {
  return http.get(`Elo/Usuario/${idUsuario}`);
};

export const getClasifiacionElo = async () => {
  return http.get("Elo/Clasificacion/");
};

export const getClasifiacionEloMensual = async () => {
  return http.get("Elo/Mensual/");
};

export const getRankingEloByIdUser = async (idUser: number) => {
  return http.get(`Elo/Ranking/${idUser}`);
};
