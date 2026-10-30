import {
  ViewPartidaAmistosaDTO,
  ViewPartidaTorneoDTO,
} from "@/interfaces/Partidas";
import { ejercitoDelJugador, idJugadorDelLado, juegaEnLado1 } from "@/utils/partidaParejas";
import { FASE_ELIMINATORIA } from "@/Constant/FormatoTorneo";

export type ResultadoPartida = "V" | "E" | "D";

// Una partida ya jugada, de torneo o amistosa, vista desde el jugador
export interface PartidaJugada {
  clave: string;
  origen: "torneo" | "amistosa";
  fecha: string;
  resultado: ResultadoPartida;
  propios: number;
  rival: number;
  // Todos los del otro lado: en Dobles, el capitán y su compañero
  idsRivales: number[];
  // El nick de cada uno de idsRivales, en el mismo orden
  nicksRivales: string[];
  nickRival: string;
  ejercito: string | null;
  // El del otro lado: en Dobles, el del capitán rival
  ejercitoRival: string | null;
  evento: string | null;
  // Torneo, Liga o Copa; en las amistosas, nada
  formato: string | null;
  // La partida tal cual, para pintarla con su tarjeta
  original: ViewPartidaTorneoDTO | ViewPartidaAmistosaDTO;
}

// El bye no es un rival de verdad: no cuenta en el resumen
const esBye = (idUsuario: number, nick?: string | null) =>
  idUsuario === 568 || /^bye\d*$/i.test((nick ?? "").trim());

// De torneo, solo las que han validado los dos; si el historial no lo trae, las que tienen ganador o resultado
function torneoJugada(partida: ViewPartidaTorneoDTO) {
  if (partida.partidaValidadaUsuario1 !== undefined)
    return partida.partidaValidadaUsuario1 === true && partida.partidaValidadaUsuario2 === true;
  return (
    partida.ganadorPartidaTorneo != null ||
    (partida.resultadoUsuario1 ?? 0) + (partida.resultadoUsuario2 ?? 0) > 0
  );
}

function desdeTorneo(partida: ViewPartidaTorneoDTO, idUsuario: number): PartidaJugada | null {
  if (!torneoJugada(partida)) return null;
  const lado1 = juegaEnLado1(partida, idUsuario);
  const rivales = (
    lado1
      ? [
          { id: partida.idUsuario2, nick: partida.nickUsuario2 },
          { id: partida.idCompanero2, nick: partida.nickCompanero2 },
        ]
      : [
          { id: partida.idUsuario1, nick: partida.nickUsuario1 },
          { id: partida.idCompanero1, nick: partida.nickCompanero1 },
        ]
  ).filter(r => r.id != null);
  const idsRivales = rivales.map(r => r.id as number);
  const nicksRivales = rivales.map(r => r.nick ?? "");
  const nickRival = nicksRivales.filter(Boolean).join(" y ");
  if (esBye(idsRivales[0], nickRival)) return null;
  const propios = (lado1 ? partida.resultadoUsuario1 : partida.resultadoUsuario2) ?? 0;
  const rival = (lado1 ? partida.resultadoUsuario2 : partida.resultadoUsuario1) ?? 0;
  const ganador = partida.ganadorPartidaTorneo;
  const resultado: ResultadoPartida =
    ganador == null || ganador === 0
      ? propios > rival
        ? "V"
        : propios < rival
          ? "D"
          : "E"
      : ganador === idJugadorDelLado(partida, idUsuario)
        ? "V"
        : "D";
  return {
    clave: `t${partida.idPartidaTorneo}`,
    origen: "torneo",
    fecha: partida.fechaPartida,
    resultado,
    propios,
    rival,
    idsRivales,
    nicksRivales,
    nickRival,
    ejercito: ejercitoDelJugador(partida, idUsuario) ?? null,
    ejercitoRival: (lado1 ? partida.ejercitoUsuario2 : partida.ejercitoUsuario1) ?? null,
    evento: partida.nombreTorneo ?? null,
    formato: partida.formatoTorneo ?? null,
    original: partida,
  };
}

function desdeAmistosa(partida: ViewPartidaAmistosaDTO, idUsuario: number): PartidaJugada | null {
  const lado1 = partida.idUsuario1 === idUsuario;
  const idRival = lado1 ? partida.idUsuario2 : partida.idUsuario1;
  const nickRival = lado1 ? partida.nickUsuario2 : partida.nickUsuario1;
  if (esBye(idRival, nickRival)) return null;
  const resultado: ResultadoPartida =
    partida.ganadorPartida === idUsuario ? "V" : partida.ganadorPartida === 0 ? "E" : "D";
  return {
    clave: `a${partida.idPartidaAmistosa}`,
    origen: "amistosa",
    fecha: partida.fechaPartida,
    resultado,
    propios: (lado1 ? partida.resultadoUsuario1 : partida.resultadoUsuario2) ?? 0,
    rival: (lado1 ? partida.resultadoUsuario2 : partida.resultadoUsuario1) ?? 0,
    idsRivales: [idRival],
    nicksRivales: [nickRival],
    nickRival,
    ejercito: (lado1 ? partida.ejercitoUsuario1 : partida.ejercitoUsuario2) || null,
    ejercitoRival: (lado1 ? partida.ejercitoUsuario2 : partida.ejercitoUsuario1) || null,
    evento: null,
    formato: null,
    original: partida,
  };
}

const tiempo = (fecha?: string | null) => (fecha ? new Date(fecha).getTime() : 0);

// Dentro de un evento, el orden de juego: en una copa la eliminatoria va después de los grupos
const ordenEnEvento = (partida: ViewPartidaTorneoDTO) =>
  (partida.fase === FASE_ELIMINATORIA ? 1000 : 0) + (partida.numeroRonda ?? 0);

/**
 * De la más antigua a la más reciente. La fecha no lleva hora y todas las rondas de un torneo comparten
 * día, así que dentro del evento manda la ronda; el id no sirve, una ronda posterior puede tenerlo menor
 */
export const compararPartidasTorneo = (a: ViewPartidaTorneoDTO, b: ViewPartidaTorneoDTO) =>
  tiempo(a.fechaPartida) - tiempo(b.fechaPartida) ||
  (a.idTorneo === b.idTorneo ? ordenEnEvento(a) - ordenEnEvento(b) : 0) ||
  a.idPartidaTorneo - b.idPartidaTorneo;

function compararJugadas(a: PartidaJugada, b: PartidaJugada) {
  if (a.origen === "torneo" && b.origen === "torneo")
    return compararPartidasTorneo(a.original as ViewPartidaTorneoDTO, b.original as ViewPartidaTorneoDTO);
  return tiempo(a.fecha) - tiempo(b.fecha) || idDe(a) - idDe(b);
}

function idDe(partida: PartidaJugada) {
  return Number(partida.clave.slice(1));
}

/**
 * Las partidas jugadas de un jugador, de torneo y amistosas, de la más reciente a la más antigua. Sin las
 * pendientes y sin los byes
 */
export function partidasJugadas(
  idUsuario: number,
  torneo: ViewPartidaTorneoDTO[],
  amistosas: ViewPartidaAmistosaDTO[]
): PartidaJugada[] {
  return [
    ...torneo.map(p => desdeTorneo(p, idUsuario)),
    ...amistosas.map(p => desdeAmistosa(p, idUsuario)),
  ]
    .filter((p): p is PartidaJugada => p !== null)
    .sort((a, b) => compararJugadas(b, a));
}

// Los nombres de ejército no siempre se escriben igual: sin mayúsculas, tildes ni "The" delante para agruparlos y
// buscar su bando
export const normalizarEjercito = (nombre: string) =>
  nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/^the\s+/, "");

// Desde el resumen: las partidas con un ejército o contra un rival
export interface FiltroPartidas {
  ejercito?: string;
  idRival?: number;
  nickRival?: string;
}

export const cumpleFiltro = (partida: PartidaJugada, filtro?: FiltroPartidas | null) =>
  !filtro ||
  ((!filtro.ejercito ||
    (!!partida.ejercito &&
      normalizarEjercito(partida.ejercito) === normalizarEjercito(filtro.ejercito))) &&
    (filtro.idRival == null || partida.idsRivales.includes(filtro.idRival)));

// «3/45» si se sabe cuántos había en la clasificación; si no, «3.º»
export const textoPosicion = (posicion: number, total?: number | null) =>
  total ? `${posicion}/${total}` : `${posicion}.º`;

export interface Balance {
  victorias: number;
  empates: number;
  derrotas: number;
  total: number;
  // Porcentaje de victorias, redondeado
  porcentaje: number;
}

export function balanceDe(partidas: PartidaJugada[]): Balance {
  const victorias = partidas.filter(p => p.resultado === "V").length;
  const empates = partidas.filter(p => p.resultado === "E").length;
  const derrotas = partidas.filter(p => p.resultado === "D").length;
  const total = partidas.length;
  return {
    victorias,
    empates,
    derrotas,
    total,
    porcentaje: total ? Math.round((victorias / total) * 100) : 0,
  };
}
