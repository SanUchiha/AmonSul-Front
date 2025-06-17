import { TorneoReducidoDTO } from "./Torneo";

export interface CrearInscripcionDTO {
  idTorneo: number;
  idUsuario: number;
}

export interface InscripcionUsuarioIndividualDTO {
  idInscripcion: number;
  idTorneo: number;
  idUsuario: number;
  idOrganizador: number;
  nick: string;
  email: string;
  fechaInscripcion: string;
  estadoLista: string;
  fechaEntregaLista: string;
  esPago: boolean;
  torneo: TorneoReducidoDTO;
  idEquipo?: number;
}

export interface InscripcionUsuarioEquipoDTO {
  idInscripcion: number;
  idTorneo: number;
  nombreTorneo: string;
  idUsuario: number;
  nick: string;
  idEquipo: number;
  torneo: TorneoReducidoDTO;
}

export interface Equipo {
  idEquipo: number;
  nombreEquipo: string;
  idCapitan: number;
}

export interface UpdateEstadoListaDTO {
  idInscripcion: number;
  estadoLista: string;
}

export interface UpdateEstadoPagoDTO {
  idInscripcion: number;
  esPago: string;
}

export interface UpdateEstadoPagoEquipoDTO {
  idEquipo: number;
  esPago: string;
}

export interface InscripcionEquipoDTO {
  idTorneo: number;
  idCapitan: number;
  nombreEquipo: string;
  miembros: number[];
}

export interface CreateMiembroEquipoDTO {
  IdUsuario: number;
  IdTorneo: number;
  IdEquipo: number;
}

export interface InscripcionEquipoDTO {
  idInscripcion: number;
  idTorneo: number;
  idUsuario: number;
  idCapitan: number;
  idEquipo: number;
  idOrganizador: number;
  emailOrganizador: string;
  fechaInscripcion?: string;
  esPago?: string;
  componentesEquipoDTO: ComponentesEquipoDTO[];
}

export interface ComponentesEquipoDTO {
  idUsuario: number;
  idInscripcion: number;
  nick: string;
  esCapitan: boolean;
  estadoLista?: string;
  fechaEntregaLista?: string;
  listaData?: string;
  ejercito?: string;
  idLista: number;
}

export interface TorneoEquipoGestionInfoDTO {
  torneo: TorneoCreadoDTO;
  equipos: EquipoDTO[];
}

export interface TorneoCreadoDTO {
  idTorneo: number;
  idUsuario: number;
  nombreTorneo: string;
  limiteParticipantes?: number | null;
  numeroPartidas: number;
  fechaEntregaListas?: string | null;
  fechaFinInscripcion?: string | null;
  inicioInscripciones?: string | null;
  jugadoresXEquipo: number;
  mostrarListas: boolean;
}

export interface EquipoDTO {
  nombreEquipo?: string | null;
  idEquipo: number;
  idCapitan: number;
  nickCapitan?: string | null;
  emailCapitan?: string | null;
  esPago?: string | null;
  fechaInscripcion?: string | null;
  inscripciones: InscripcionTorneoDTO[];
}

export interface InscripcionTorneoDTO {
  idInscripcion: number;
  idTorneo: number;
  idUsuario: number;
  fechaInscripcion?: string | null;
  estadoLista?: string | null;
  fechaEntregaLista?: string | null;
  esPago?: string | null;
  listaData?: string | null;
  ejercito?: string | null;
  idLista: number;
  nick: string;
}
