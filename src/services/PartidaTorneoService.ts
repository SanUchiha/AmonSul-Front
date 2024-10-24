import {
  GenerarRonda,
  RequestUpdatePairingTorneoDTO,
  UpdatePartidaTorneoDTO,
} from "@/interfaces/Live";
import { http } from "./index";

export const generarRonda = async (nuevaRonda: GenerarRonda) => {
  return http.post(`Torneo/Gestion/Generar-Ronda`, nuevaRonda);
};

export const updatePartidaTorneo = async (partida: UpdatePartidaTorneoDTO) => {
  return http.put(`Torneo/Editar-Partida`, partida);
};

export const updatePairingTorneo = async (
  pairing: RequestUpdatePairingTorneoDTO
) => {
  return http.put(`Torneo/Editar-Pairing`, pairing);
};

export const deletePartidaTorneo = async (idPartida: number) => {
  return http.delete(`Torneo/Eliminar-Partida/${idPartida}`);
};

export const getTournamentMatches = async (idUsuario: number) => {
  return http.get(`Torneo/Partidas/Usuario/${idUsuario}`);
};
