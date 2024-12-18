import { http } from "./index";

export const getEloUsuario = async (email: string) => {
  return http.get(`Elo/Usuario/${email}`);
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
