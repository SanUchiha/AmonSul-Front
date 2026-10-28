import { ViewPartidaTorneoDTO } from "@/interfaces/Partidas";

// En Parejas el ganador de la partida es el capitán de cada lado: el compañero gana o pierde con él

export const juegaEnLado1 = (
  partida: ViewPartidaTorneoDTO,
  idUsuario: number
) => partida.idUsuario1 === idUsuario || partida.idCompanero1 === idUsuario;

// Jugador cuyo resultado cuenta para idUsuario: él mismo o, si es compañero, su capitán
export const idJugadorDelLado = (
  partida: ViewPartidaTorneoDTO,
  idUsuario: number
) => {
  if (partida.idCompanero1 === idUsuario) return partida.idUsuario1;
  if (partida.idCompanero2 === idUsuario) return partida.idUsuario2;
  return idUsuario;
};

// Con lista conjunta el compañero no tiene ejército propio: juega el de la pareja
export const ejercitoDelJugador = (
  partida: ViewPartidaTorneoDTO,
  idUsuario: number
) => {
  if (partida.idCompanero1 === idUsuario)
    return partida.ejercitoCompanero1 ?? partida.ejercitoUsuario1;
  if (partida.idCompanero2 === idUsuario)
    return partida.ejercitoCompanero2 ?? partida.ejercitoUsuario2;
  if (partida.idUsuario1 === idUsuario) return partida.ejercitoUsuario1;
  if (partida.idUsuario2 === idUsuario) return partida.ejercitoUsuario2;
  return undefined;
};
