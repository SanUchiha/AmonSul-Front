import { http } from "./index";

export const getGanadores = async () => {
  return http.get(`ganador`);
};
