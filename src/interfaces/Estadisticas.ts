// ── EP1: Top bandos ───────────────────────────────────────────────────────────

export interface EjercitoStatsDTO {
  ejercito: string;
  bando: string | null;
  totalPartidas: number;
  victorias: number;
  derrotas: number;
  empates: number;
  winRate: number;
  mediaPuntosFavor: number;
  mediaPuntosContra: number;
}

export interface BandoTopDTO {
  mejores: EjercitoStatsDTO[];
  peores: EjercitoStatsDTO[];
}

export interface TopBandosResponseDTO {
  bien: BandoTopDTO;
  oscuridad: BandoTopDTO;
}

// ── EP2: Rating de un ejército ────────────────────────────────────────────────

export interface RatingEjercitoRequestDTO {
  ejercito: string;
  fechaDesde?: string | null;   // formato ISO: "2024-01-15"
  fechaHasta?: string | null;
  ejercitosRivales?: string[];  // mutuamente excluyente con bandoRival
  bandoRival?: string | null;   // "good" | "evil"
  puntosPartidaMin?: number | null;
  puntosPartidaMax?: number | null;
}

export interface RatingEjercitoResponseDTO extends EjercitoStatsDTO {
  esFiltrado: boolean;
  descripcionFiltro: string | null;
}
