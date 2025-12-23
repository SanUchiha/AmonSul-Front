import {
  GenerarRonda,
  RequestAddPairingTorneoDTO,
  RequestUpdatePairingTorneoDTO,
  UpdatePartidaTorneoDTO,
} from "@/interfaces/Live";
import { http } from "./index";
import { PartidaTorneoDTO } from "@/interfaces/Partidas";

export const generarRonda = async (nuevaRonda: GenerarRonda) => {
  return http.post(`Torneo/Gestion/Generar-Ronda`, nuevaRonda);
};

export const updatePartidaTorneo = async (
  partida: UpdatePartidaTorneoDTO
): Promise<PartidaTorneoDTO> => {
  const response = await http.put(`Torneo/Editar-Partida`, partida);
  return response.data as PartidaTorneoDTO;
};

export const updatePairingTorneoAsync = async (
  pairing: RequestUpdatePairingTorneoDTO
): Promise<PartidaTorneoDTO> => {
  const response = await http.put(`Torneo/Editar-Pairing`, pairing);
  return response.data as PartidaTorneoDTO;
};

export const updatePairingTorneoEquipoAsync = async (
  pairing: RequestUpdatePairingTorneoDTO
) => {
  return http.put(`Torneo/Editar-Pairing-Equipo`, pairing);
};

export const addPairingTorneo = async (pairing: RequestAddPairingTorneoDTO) => {
  return http.post(`Torneo/Agregar-Pairing`, pairing);
};

export const deletePartidaTorneo = async (idPartida: number) => {
  return http.delete(`Torneo/Eliminar-Partida/${idPartida}`);
};

export const getTournamentMatches = async (idUsuario: number) => {
  return http.get(`Torneo/Partidas/Usuario/${idUsuario}`);
};

export const getPartidasTorneoByUsuarioAsync = async (
  idTorneo: number,
  idUsuario: number
) => {
  return http.get(`Torneo/Partidas/Usuario/${idUsuario}/Torneo/${idTorneo}`);
};
