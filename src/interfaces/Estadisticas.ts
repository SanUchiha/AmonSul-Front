// ── Estadísticas de ejércitos ────────────────────────────────────────────────

export type TramoPuntos = "hasta-550" | "600-650" | "700-750" | "800+";
export type Bando = "good" | "evil";

// Filtros comunes: sin ninguno, todas las temporadas y todos los puntos, sin amistosas
export interface FiltroEstadisticas {
  temporada?: number | null;
  tramo?: TramoPuntos | null;
  bando?: Bando | null;
  amistosas?: boolean;
}

// El porcentaje cuenta el empate como media victoria. «Rinde»: lo que se ganó de más o de menos frente a lo que esperaba
// el ELO de los jugadores, en puntos de porcentaje
export interface BalanceDTO {
  partidas: number;
  victorias: number;
  empates: number;
  derrotas: number;
  porcentaje: number;
  rinde: number;
  puntosFavor: number;
  puntosContra: number;
}

export interface EjercitoBalanceDTO extends BalanceDTO {
  ejercito: string;
  bando: Bando | null;
  jugadores: number;
  // En torneos individuales con clasificación final: jugados, ganados y podios. Solo en el ranking y en la ficha
  torneos: number;
  torneosGanados: number;
  podios: number;
}

export interface TramoBalanceDTO extends BalanceDTO {
  tramo: TramoPuntos;
}

export interface TemporadaBalanceDTO extends BalanceDTO {
  temporada: number;
}

export interface JugadorBalanceDTO extends BalanceDTO {
  idUsuario: number;
  nick: string;
}

export interface FichaEjercitoDTO {
  resumen: EjercitoBalanceDTO;
  generalesMatados: number | null;
  porTramo: TramoBalanceDTO[];
  porTemporada: TemporadaBalanceDTO[];
  rivales: EjercitoBalanceDTO[];
  jugadores: JugadorBalanceDTO[];
}

// Un ejército contra otro, o contra un bando, visto desde el primero
export interface PartidaCruceDTO {
  idPartida: number;
  esAmistosa: boolean;
  idTorneo: number | null;
  nombreTorneo: string | null;
  ronda: number | null;
  fecha: string;
  puntos: number | null;
  idUsuario: number;
  nick: string;
  ejercito: string;
  resultado: number;
  idUsuarioRival: number;
  nickRival: string;
  ejercitoRival: string;
  resultadoRival: number;
  // 1 si ganó el del ejército, 0,5 si empataron y 0 si perdió
  puntuacion: number;
}

export interface CruceEjercitosDTO {
  ejercito: string;
  rival: string;
  resumen: BalanceDTO;
  porTramo: TramoBalanceDTO[];
  partidas: PartidaCruceDTO[];
}

export interface CruceResumenDTO extends BalanceDTO {
  ejercito: string;
  rival: string;
}

// Cada cruce visto desde el ejército que se impone
export interface CrucesDestacadosDTO {
  masJugados: CruceResumenDTO[];
  masDesequilibrados: CruceResumenDTO[];
}

// Con qué ejércitos juega un jugador y cómo le va con cada uno
export interface EjercitosJugadorDTO {
  idUsuario: number;
  nick: string;
  // Con todos sus ejércitos: para comparar cada uno con su media
  resumen: BalanceDTO;
  // Del más jugado al menos
  ejercitos: EjercitoBalanceDTO[];
  // Contra los que pierde más de lo que gana
  rivalesDificiles: EjercitoBalanceDTO[];
}
