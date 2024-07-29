import { http } from './index'

export const getTorneos = async () => {
  return http.get(`Torneo`)
};

export const getTorneo = async (idTorneo: number) => {
  return http.get(`Torneo/id/${idTorneo}`)
};

export const descargarBasesTorneo = async (idTorneo: number) => {
  return http.get(`Torneo/bases/${idTorneo}`)
};
