import {
  GenerarRonda,
  RequestAddPairingTorneoDTO,
  RequestUpdatePairingTorneoDTO,
  UpdatePartidaTorneoDTO,
} from "@/interfaces/Live";
import { http } from "./index";
import { EstaJugandoDTO, PartidaTorneoDTO } from "@/interfaces/Partidas";

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

export const getPartidasTorneoPorFechaAsync = async (idUsuario: number) => {
  return http.get(`Torneo/estoy-jugando/${idUsuario}`);
};

// Las piden a la vez la app al arrancar y la ficha del evento: si llegan juntas, una sola petición. Dura poco, para
// que tras el aviso de una ronda se vea la ronda nueva
const VIGENCIA_PARTIDAS_DE_HOY_MS = 5000;
let partidasDeHoy: { idUsuario: number; hora: number; datos: Promise<EstaJugandoDTO> } | null = null;

export const pedirPartidasDeHoy = (idUsuario: number): Promise<EstaJugandoDTO> => {
  if (
    partidasDeHoy?.idUsuario === idUsuario &&
    Date.now() - partidasDeHoy.hora < VIGENCIA_PARTIDAS_DE_HOY_MS
  )
    return partidasDeHoy.datos;

  const datos = getPartidasTorneoPorFechaAsync(idUsuario).then(respuesta => respuesta.data as EstaJugandoDTO);
  const pedida = { idUsuario, hora: Date.now(), datos };
  partidasDeHoy = pedida;
  datos.catch(() => {
    if (partidasDeHoy === pedida) partidasDeHoy = null;
  });
  return datos;
};

export const olvidarPartidasDeHoy = () => {
  partidasDeHoy = null;
};
