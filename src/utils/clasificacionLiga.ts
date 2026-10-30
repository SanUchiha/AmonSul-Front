import {
  ClassificationType,
  MatchResultGeneral,
  ResultMatchMatchedPlayExtendedIndividualType,
  ResultMatchMatchedPlayType,
} from "@/Constant/TipoClasificacion";
import { PartidaTorneoDTO } from "@/interfaces/Partidas";
import { InscripcionTorneoCreadoDTO } from "@/interfaces/Torneo";
import { calcularPuntosAleman } from "./sistemaAleman";

export interface FilaClasificacionLiga {
  posicion: number;
  idUsuario: number;
  nick: string;
  ejercito: string | null;
  jugadas: number;
  victorias: number;
  empates: number;
  derrotas: number;
  puntos: number;
  puntosFavor: number;
  puntosContra: number;
  diferencia: number;
  generales: number;
}

// Cuenta cuando la han validado los dos; las que no se jueguen no cuentan
export const partidaJugada = (partida: PartidaTorneoDTO) =>
  partida.partidaValidadaUsuario1 === true &&
  partida.partidaValidadaUsuario2 === true;

function puntosDePartida(
  res1: number,
  res2: number,
  tipo: ClassificationType | undefined
): [number, number] {
  if (tipo === ClassificationType.ALEMAN) {
    const { jugador1, jugador2 } = calcularPuntosAleman(res1, res2);
    return [jugador1, jugador2];
  }
  if (tipo === ClassificationType.EXTENDED) {
    const escala = ResultMatchMatchedPlayExtendedIndividualType;
    if (res1 === res2) return [escala.DRAW, escala.DRAW];
    const ganador = Math.max(res1, res2);
    const perdedor = Math.min(res1, res2);
    const amplia = ganador >= 2 * perdedor && ganador >= 6;
    const gana = amplia ? escala.MAJOR_WIN : escala.MINOR_WIN;
    const pierde = amplia ? escala.MAJOR_LOSS : escala.MINOR_LOSS;
    return res1 > res2 ? [gana, pierde] : [pierde, gana];
  }
  const escala = ResultMatchMatchedPlayType;
  if (res1 === res2) return [escala.DRAW, escala.DRAW];
  return res1 > res2 ? [escala.WIN, escala.LOSS] : [escala.LOSS, escala.WIN];
}

/**
 * Clasificación de una liga con lo jugado hasta ahora. Salen todos los que tienen partidas (un retirado ya no
 * tiene ninguna). Desempate, el de siempre: puntos, diferencia, puntos a favor y generales matados
 */
export function generarClasificacionLiga(
  partidas: PartidaTorneoDTO[],
  inscripciones: InscripcionTorneoCreadoDTO[],
  tipo: ClassificationType | undefined
): FilaClasificacionLiga[] {
  const filas = new Map<number, FilaClasificacionLiga>();
  const fila = (idUsuario: number, nick: string, ejercito?: string | null) => {
    const existente = filas.get(idUsuario);
    if (existente) return existente;
    const nueva: FilaClasificacionLiga = {
      posicion: 0,
      idUsuario,
      nick,
      ejercito: ejercito ?? null,
      jugadas: 0,
      victorias: 0,
      empates: 0,
      derrotas: 0,
      puntos: 0,
      puntosFavor: 0,
      puntosContra: 0,
      diferencia: 0,
      generales: 0,
    };
    filas.set(idUsuario, nueva);
    return nueva;
  };
  const sumar = (
    f: FilaClasificacionLiga,
    aFavor: number,
    enContra: number,
    puntos: number,
    generalMatado: boolean | null
  ) => {
    f.jugadas += 1;
    f.puntos += puntos;
    f.puntosFavor += aFavor;
    f.puntosContra += enContra;
    f.diferencia = f.puntosFavor - f.puntosContra;
    if (aFavor > enContra) f.victorias += 1;
    else if (aFavor < enContra) f.derrotas += 1;
    else f.empates += 1;
    if (generalMatado) f.generales += MatchResultGeneral.DEAD;
  };

  partidas.forEach(partida => {
    const f1 = fila(
      partida.idUsuario1,
      partida.nick1,
      partida.ejercitoUsuario1
    );
    const f2 = fila(
      partida.idUsuario2,
      partida.nick2,
      partida.ejercitoUsuario2
    );
    if (!partidaJugada(partida)) return;
    const res1 = partida.resultadoUsuario1 ?? 0;
    const res2 = partida.resultadoUsuario2 ?? 0;
    const [puntos1, puntos2] = puntosDePartida(res1, res2, tipo);
    sumar(f1, res1, res2, puntos1, partida.liderMuertoUsuario1);
    sumar(f2, res2, res1, puntos2, partida.liderMuertoUsuario2);
  });

  // Puntos extra que da el organizador
  inscripciones.forEach(inscripcion => {
    const f = filas.get(inscripcion.idUsuario);
    if (f) f.puntos += inscripcion.puntosExtra ?? 0;
  });

  return [...filas.values()]
    .sort(
      (a, b) =>
        b.puntos - a.puntos ||
        b.diferencia - a.diferencia ||
        b.puntosFavor - a.puntosFavor ||
        b.generales - a.generales
    )
    .map((f, i) => ({ ...f, posicion: i + 1 }));
}

// Jornadas y partidas que saldrán con estos jugadores
export function calendarioLiga(jugadores: number, idaYVuelta: boolean) {
  if (jugadores < 2) return { jornadas: 0, partidas: 0 };
  const vueltas = idaYVuelta ? 2 : 1;
  return {
    jornadas: (jugadores % 2 === 0 ? jugadores - 1 : jugadores) * vueltas,
    partidas: ((jugadores * (jugadores - 1)) / 2) * vueltas,
  };
}
