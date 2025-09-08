import { ClasificacionEquipo } from "@/interfaces/Torneo";
import { EquipoDTO } from "@/interfaces/Inscripcion";
import { PartidaTorneoDTO } from "@/interfaces/Partidas";
import { Torneo } from "@/interfaces/Torneo";


function crearClasificacionBase(equipos: EquipoDTO[]): Map<number, ClasificacionEquipo> {
  const clasificacionMap = new Map<number, ClasificacionEquipo>();
  equipos.forEach((equipo) => {
    clasificacionMap.set(equipo.idEquipo, {
      nombreEquipo: equipo.nombreEquipo ?? `Equipo ${equipo.idEquipo}`,
      idEquipo: equipo.idEquipo,
      puntos: 0,
      puntosFavor: 0,
      puntosContra: 0,
      diferencia: 0,
      lideresMatados: 0,
    });
  });
  return clasificacionMap;
}

function clasificacionNormal(equipos: EquipoDTO[], partidas: PartidaTorneoDTO[]): ClasificacionEquipo[] {
  const clasificacionMap = crearClasificacionBase(equipos);
  partidas.forEach((partida) => {
    const {
      idEquipo1,
      idEquipo2,
      resultadoUsuario1,
      resultadoUsuario2,
      partidaValidadaUsuario1,
      partidaValidadaUsuario2,
      liderMuertoUsuario1,
      liderMuertoUsuario2,
    } = partida;
    const esValida = partidaValidadaUsuario1 && partidaValidadaUsuario2;
    if (!esValida || idEquipo1 === null || idEquipo2 === null) return;
    const equipo1 = clasificacionMap.get(idEquipo1);
    const equipo2 = clasificacionMap.get(idEquipo2);
    const res1 = resultadoUsuario1 ?? 0;
    const res2 = resultadoUsuario2 ?? 0;
    if (res1 === res2) {
      if (equipo1) equipo1.puntos += 1;
      if (equipo2) equipo2.puntos += 1;
    } else {
      if (equipo1 && res1 > res2) equipo1.puntos += 3;
      if (equipo2 && res2 > res1) equipo2.puntos += 3;
    }
    if (equipo1) {
      equipo1.puntosFavor += res1;
      equipo1.puntosContra += res2;
      if (liderMuertoUsuario2 === true) equipo1.lideresMatados += 1;
      equipo1.diferencia = equipo1.puntosFavor - equipo1.puntosContra;
    }
    if (equipo2) {
      equipo2.puntosFavor += res2;
      equipo2.puntosContra += res1;
      if (liderMuertoUsuario1 === true) equipo2.lideresMatados += 1;
      equipo2.diferencia = equipo2.puntosFavor - equipo2.puntosContra;
    }
  });
  return Array.from(clasificacionMap.values()).sort((a, b) => {
    if (b.puntos !== a.puntos) return b.puntos - a.puntos;
    if (b.diferencia !== a.diferencia) return b.diferencia - a.diferencia;
    if (b.puntosFavor !== a.puntosFavor) return b.puntosFavor - a.puntosFavor;
    return b.lideresMatados - a.lideresMatados;
  });
}

function clasificacionExtendida(equipos: EquipoDTO[], partidas: PartidaTorneoDTO[]): ClasificacionEquipo[] {
  const clasificacionMap = crearClasificacionBase(equipos);
  partidas.forEach((partida) => {
    const {
      idEquipo1,
      idEquipo2,
      resultadoUsuario1,
      resultadoUsuario2,
      partidaValidadaUsuario1,
      partidaValidadaUsuario2,
      liderMuertoUsuario1,
      liderMuertoUsuario2,
    } = partida;
    const esValida = partidaValidadaUsuario1 && partidaValidadaUsuario2;
    if (!esValida || idEquipo1 === null || idEquipo2 === null) return;
    const equipo1 = clasificacionMap.get(idEquipo1);
    const equipo2 = clasificacionMap.get(idEquipo2);
    const res1 = resultadoUsuario1 ?? 0;
    const res2 = resultadoUsuario2 ?? 0;
    if (res1 === res2) {
      if (equipo1) equipo1.puntos += 2;
      if (equipo2) equipo2.puntos += 2;
    } else {
      if (res1 > res2) {
        if (res1 >= 2 * res2) {
          if (equipo1) equipo1.puntos += 6;
          if (equipo2) equipo2.puntos += 0;
        } else {
          if (equipo1) equipo1.puntos += 5;
          if (equipo2) equipo2.puntos += 1;
        }
      }
      if (res2 > res1) {
        if (res2 >= 2 * res1) {
          if (equipo2) equipo2.puntos += 6;
          if (equipo1) equipo1.puntos += 0;
        } else {
          if (equipo2) equipo2.puntos += 5;
          if (equipo1) equipo1.puntos += 1;
        }
      }
    }
    if (equipo1) {
      equipo1.puntosFavor += res1;
      equipo1.puntosContra += res2;
      if (liderMuertoUsuario2 === true) equipo1.lideresMatados += 1;
      equipo1.diferencia = equipo1.puntosFavor - equipo1.puntosContra;
    }
    if (equipo2) {
      equipo2.puntosFavor += res2;
      equipo2.puntosContra += res1;
      if (liderMuertoUsuario1 === true) equipo2.lideresMatados += 1;
      equipo2.diferencia = equipo2.puntosFavor - equipo2.puntosContra;
    }
  });
  return Array.from(clasificacionMap.values()).sort((a, b) => {
    if (b.puntos !== a.puntos) return b.puntos - a.puntos;
    if (b.diferencia !== a.diferencia) return b.diferencia - a.diferencia;
    if (b.puntosFavor !== a.puntosFavor) return b.puntosFavor - a.puntosFavor;
    return b.lideresMatados - a.lideresMatados;
  });
}

// Aquí puedes añadir más funciones para otros tipos de clasificación, por ejemplo:
// function clasificacionAleman(...) { ... }

export function generarClasificacionEquipos({
  equipos = [],
  partidas = [],
  torneo
}: {
  equipos: EquipoDTO[];
  partidas: PartidaTorneoDTO[];
  torneo?: Torneo;
}): ClasificacionEquipo[] {
  switch (torneo?.classificationType) {
    case 2: // EXTENDED
      return clasificacionExtendida(equipos, partidas);
    // case 3: // ALEMAN
    //   return clasificacionAleman(equipos, partidas);
    case 1:
    default:
      return clasificacionNormal(equipos, partidas);
  }
}
