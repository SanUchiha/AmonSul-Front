import { Clasificacion } from "@/interfaces/Live";
import { PartidaTorneoDTO } from "@/interfaces/Partidas";
import { InscripcionTorneoCreadoDTO } from "@/interfaces/Torneo";

type ClasificacionJugador = {
  nick: string;
  victorias: number;
  puntosFavor: number;
  puntosContra: number;
  diferenciaPuntos: number;
  lider: number;
  idUsuario: number;
  empates: number;
  derrotas: number;
  puntosTorneo: number;
  idTorneo: number;
};

export function generarClasificacionIndividual({
  partidas = [],
  inscripciones = [],
  armies = [],
}: {
  partidas: PartidaTorneoDTO[];
  inscripciones: InscripcionTorneoCreadoDTO[];
  armies: any[];
}): Clasificacion[] {
  const ranking: Record<number, ClasificacionJugador> = {};

  partidas.forEach((partida) => {
    if (partida.partidaValidadaUsuario1 && partida.partidaValidadaUsuario2) {
      const puntosUsuario1 = partida.resultadoUsuario1 ?? 0;
      const puntosUsuario2 = partida.resultadoUsuario2 ?? 0;
      const liderMuertoUsuario1 = partida.liderMuertoUsuario1 ? 1 : 0;
      const liderMuertoUsuario2 = partida.liderMuertoUsuario2 ? 1 : 0;

      if (!ranking[partida.idUsuario1]) {
        ranking[partida.idUsuario1] = {
          nick: partida.nick1,
          victorias: 0,
          puntosFavor: 0,
          puntosContra: 0,
          diferenciaPuntos: 0,
          lider: 0,
          idUsuario: partida.idUsuario1,
          empates: 0,
          derrotas: 0,
          puntosTorneo: 0,
          idTorneo: partida.idTorneo,
        };
      }
      if (!ranking[partida.idUsuario2]) {
        ranking[partida.idUsuario2] = {
          nick: partida.nick2,
          victorias: 0,
          puntosFavor: 0,
          puntosContra: 0,
          diferenciaPuntos: 0,
          lider: 0,
          idUsuario: partida.idUsuario2,
          empates: 0,
          derrotas: 0,
          puntosTorneo: 0,
          idTorneo: partida.idTorneo,
        };
      }

      ranking[partida.idUsuario1].puntosFavor += puntosUsuario1;
      ranking[partida.idUsuario1].puntosContra += puntosUsuario2;
      ranking[partida.idUsuario2].puntosFavor += puntosUsuario2;
      ranking[partida.idUsuario2].puntosContra += puntosUsuario1;

      ranking[partida.idUsuario1].diferenciaPuntos =
        ranking[partida.idUsuario1].puntosFavor -
        ranking[partida.idUsuario1].puntosContra;
      ranking[partida.idUsuario2].diferenciaPuntos =
        ranking[partida.idUsuario2].puntosFavor -
        ranking[partida.idUsuario2].puntosContra;

      if (partida.ganadorPartidaTorneo === partida.idUsuario1) {
        ranking[partida.idUsuario1].puntosTorneo += 3;
        ranking[partida.idUsuario1].victorias += 1;
        ranking[partida.idUsuario2].derrotas += 1;
      } else if (partida.ganadorPartidaTorneo === partida.idUsuario2) {
        ranking[partida.idUsuario2].puntosTorneo += 3;
        ranking[partida.idUsuario2].victorias += 1;
        ranking[partida.idUsuario1].derrotas += 1;
      } else {
        ranking[partida.idUsuario1].puntosTorneo += 1;
        ranking[partida.idUsuario2].puntosTorneo += 1;
        ranking[partida.idUsuario1].empates += 1;
        ranking[partida.idUsuario2].empates += 1;
      }

      if (liderMuertoUsuario1) {
        ranking[partida.idUsuario1].lider += 1;
      } else if (liderMuertoUsuario2) {
        ranking[partida.idUsuario2].lider += 1;
      }
    }
  });

  inscripciones.forEach((inscripcion) => {
    const userId = inscripcion.idUsuario;
    if (ranking[userId]) {
      ranking[userId].puntosTorneo += inscripcion.puntosExtra;
    }
  });

  // Enriquecer con ejercito y bando
  const jugadoresConEjercitos = Object.values(ranking).map((jugador) => {
    const partidasJugador = partidas.filter(
      (p) => p.nick1 === jugador.nick || p.nick2 === jugador.nick
    );
    // Tomar el primer ejercito encontrado
    const ejercito = partidasJugador.length
      ? partidasJugador[0].nick1 === jugador.nick
        ? partidasJugador[0].ejercitoUsuario1
        : partidasJugador[0].ejercitoUsuario2
      : null;
    const ejercitoInfo = armies.find((e) => e.name === ejercito);
    return {
      ...jugador,
      bando: ejercitoInfo ? ejercitoInfo.band : "desconocido",
      nombreCortoEjercito: ejercitoInfo?.shortName ?? undefined,
      ejercito: ejercitoInfo?.name ?? undefined,
    };
  });

  return jugadoresConEjercitos.sort((a, b) => {
    if (b.puntosTorneo !== a.puntosTorneo) {
      return b.puntosTorneo - a.puntosTorneo;
    }
    if (b.diferenciaPuntos !== a.diferenciaPuntos) {
      return b.diferenciaPuntos - a.diferenciaPuntos;
    }
    if (b.puntosFavor !== a.puntosFavor) {
      return b.puntosFavor - a.puntosFavor;
    }
    return b.lider - a.lider;
  });
}
