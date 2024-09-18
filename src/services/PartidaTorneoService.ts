import { GenerarRonda, UpdatePartidaTorneoDTO } from "@/interfaces/Live";
import { http } from "./index";

export const generarRonda = async (nuevaRonda: GenerarRonda) => {
  return http.post(`Torneo/Gestion/Generar-Ronda`, nuevaRonda);
};

export const updatePartidaTorneo = async (partida: UpdatePartidaTorneoDTO) => {
  return http.put(`Torneo/Editar-Partida`, partida);
};
