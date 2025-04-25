import { GenerarRonda } from "./Live";
import { ListaDTO } from "./Usuario";

export interface Torneo {
  idTorneo: number; // Identificador único del torneo (PK)
  idUsuario: number; // ID del usuario administrador del torneo (FK)
  nombreTorneo: string; // Nombre del torneo
  descripcionTorneo: string; // Descripción del torneo
  fechaInicioTorneo: string; // Fecha de inicio del torneo
  fechaFinTorneo: string; // Fecha de fin del torneo
  precioTorneo: number; // Precio del torneo
  numeroPartidas: number; // Número de partidas del torneo
  puntosTorneo: number; // Puntos asignados al torneo
  estadoTorneo: "ESPERANDO" | "LIVE" | "TERMINADO" | "CANCELADO"; // Estado del torneo (enum)
  lugarTorneo: string; // Lugar donde se llevará a cabo el torneo
  esLiga?: boolean;
  tipoTorneo: "Individual" | "Parejas" | "Equipos_4" | "Equipos_6";
  esPrivadoTorneo: boolean; // Indica si el torneo es privado o no
  idRangoTorneo: number; // ID del rango del torneo (FK)
  esMatchedPlayTorneo: boolean; // Indica si el torneo es de tipo Matched Play
  fechaEntregaListas: string; // Fecha límite de entrega de listas
  fechaFinInscripcion: string; // Fecha límite de inscripción
  basesTorneo: string; // Bases del torneo (PDF en base 64 o URL)
  cartelTorneo: string; // Imagen o cartel del torneo (URL o base 64)
  metodosPago: string[]; // Métodos de pago aceptados
  horaInicioTorneo: string; // Hora de inicio del torneo (HH:mm)
  horaFinTorneo: string; // Hora de fin del torneo (HH:mm)
  limiteParticipantes?: number; // Límite de plazas del torneo (opcional)
  tieneBases: boolean;
  inicioInscripciones: string; // Fecha límite de inscripción
  listasPorJugador: number;
}

export interface TorneoReducidoDTO {
  idTorneo: number; // Identificador único del torneo (PK)
  nombreTorneo: string; // Nombre del torneo
  limiteParticipantes?: number; // Límite de plazas del torneo (opcional)
  fechaFinTorneo: string; // Fecha de fin del torneo
  numeroPartidas: number; // Número de partidas del torneo
  puntosTorneo: number; // Puntos asignados al torneo
  tipoTorneo: string; // Tipo de torneo
}

export interface TorneoPropioDTO {
  idTorneo: number; // Identificador único del torneo (PK)
  idUsuario: number; // ID del usuario administrador del torneo (FK)
  nombreTorneo: string; // Nombre del torneo
  tipoTorneo: string;
  listasPorJugador: number;
}

export interface TorneoGestionInfoDTO {
  torneo: TorneoCreadoDTO;
  inscripciones: InscripcionTorneoCreadoDTO[];
}

export interface TorneoGestionInfoMasDTO {
  torneo: TorneoCreadoDTO;
  inscripciones: InscripcionTorneoCreadoMasDTO[];
}

export interface TorneoCreadoDTO {
  idTorneo: number;
  idUsuario: number;
  nombreTorneo: string;
  limiteParticipantes?: number | null;
  numeroPartidas: number;
  estadoTorneo: string;
  fechaEntregaListas?: string | null;
  fechaFinInscripcion?: string | null;
  inicioInscripciones?: string | null;
  listasPorJugador: number;
}

export interface InscripcionTorneoCreadoDTO {
  idInscripcion: number;
  idUsuario: number;
  torneo: Torneo;
  nick?: string | null;
  fechaInscripcion?: string | null;
  bando?: "evil" | "good" | null;
  estadoLista?: string | null;
  fechaEntrega?: string | null;
  esPago?: string | null;
  idLista?: number | null;
  ejercito?: string | null;
  listaData?: string | null;
  idTorneo: number;
}

export interface InscripcionTorneoCreadoMasDTO {
  idInscripcion: number;
  idUsuario: number;
  nick: string;
  fechaInscripcion: string;
  bando?: "evil" | "good" | null;
  fechaUltimaEntrega?: string | null;
  esPago: string;
  lista: ListaDTO[];
  countListasEntregadas: number;
}

export interface GuardarResultadosDTO {
  ganadoresDTO: ResultadoJugador[];
  generarRondaDTO: GenerarRonda;
}

export interface ResultadoJugador {
  idUsuario: number;
  idTorneo?: number;
  resultado: number;
}

export interface CrearTorneoDTO {
  idUsuario: number;
  nombreTorneo: string;
  descripcionTorneo?: string;
  limiteParticipantes: number;
  fechaInicioTorneo: string; // formato de fecha "YYYY-MM-DD"
  fechaFinTorneo: string; // formato de fecha "YYYY-MM-DD"
  precioTorneo: number;
  numeroPartidas: number;
  puntosTorneo: number;
  estadoTorneo: number;
  lugarTorneo: string;
  tipoTorneo: string;
  esLiga: boolean;
  idRangoTorneo: number;
  esMatchedPlayTorneo: boolean;
  fechaEntregaListas: string; // formato de fecha "YYYY-MM-DD"
  fechaFinInscripcion: string; // formato de fecha "YYYY-MM-DD"
  inicioInscripciones: string; // formato de fecha "YYYY-MM-DD"
  basesTorneo?: string;
  cartelTorneo?: string; //  base64
  metodosPago?: string;
  horaInicioTorneo: string; // formato de hora "HH:mm:ss"
  horaFinTorneo: string; // formato de hora "HH:mm:ss"
}

export interface ModificarTorneoDTO {
  idTorneo?: number;
  nombreTorneo?: string;
  descripcionTorneo?: string;
  limiteParticipantes?: number;
  fechaInicioTorneo?: string; // formato de fecha "YYYY-MM-DD"
  fechaFinTorneo?: string; // formato de fecha "YYYY-MM-DD"
  precioTorneo?: number;
  numeroPartidas?: number;
  puntosTorneo?: number;
  estadoTorneo: number; // Estado del torneo (enum)
  lugarTorneo?: string;
  tipoTorneo: "Individual" | "Parejas" | "Equipos_4" | "Equipos_6";
  esLiga?: boolean;
  idRangoTorneo?: number;
  esMatchedPlayTorneo?: boolean;
  fechaEntregaListas?: string; // formato de fecha "YYYY-MM-DD"
  fechaFinInscripcion?: string; // formato de fecha "YYYY-MM-DD"
  basesTorneo?: string;
  cartelTorneo?: string; //  base64
  metodosPago?: string;
  horaInicioTorneo?: string; // formato de hora "HH:mm:ss"
  horaFinTorneo?: string; // formato de hora "HH:mm:ss"
  inicioInscripciones?: string; // Fecha límite de inscripción
}

export interface ModificarBasesTorneoDTO {
  idTorneo?: number;
  basesTorneo?: string;
}
