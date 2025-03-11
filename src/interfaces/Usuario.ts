import { EloDTO } from "./Elo";
import { FaccionDTO } from "./Faccion";
import {
  InscripcionUsuarioEquipoDTO,
  InscripcionUsuarioIndividualDTO,
} from "./Inscripcion";
import { ViewPartidaAmistosaDTO, ViewPartidaTorneoDTO } from "./Partidas";

export interface NewUserDTO {
  NombreUsuario: string;
  PrimerApellido: string;
  SegundoApellido?: string;
  Email: string;
  Contraseña: string;
  Rol: "JUGADOR";
  Nick: string;
  Ciudad: string;
  idFaccion?: number;
  FechaNacimiento: string;
  Telefono: string;
}

export interface EditarUsuarioDTO {
  NombreUsuario?: string;
  PrimerApellido?: string;
  SegundoApellido?: string;
  Email: string;
  NuevoEmail?: string;
  Contraseña?: string;
  Nick?: string;
  Ciudad?: string;
  Faccion?: string;
  FechaNacimiento?: string;
  Telefono?: string;
}

export interface UsuarioViewDTO {
  idUsuario: number;
  nombreUsuario: string;
  primerApellido: string;
  segundoApellido?: string;
  email: string;
  nick: string;
  ciudad?: string;
  fechaRegistro: string;
  fechaNacimiento: string;
  faccion: FaccionDTO;
  idFaccion?: number;
  telefono?: string;
}

export interface Jugador {
  email: string;
  nick: string;
}

export interface UsuarioNickDTO {
  idUsuario: number;
  nick: string;
  email: string;
}

export interface ViewUsuarioPartidaDTO {
  idUsuario: number;
  email: string;
  nick: string;
  ciudad?: string | null;
  fechaRegistro: string;
  idFaccion?: number | null;
  nombreFaccion?: string;
  numeroPartidasJugadas: number;
  partidasGanadas: number;
  partidasEmpatadas: number;
  partidasPerdidas: number;
  puntuacionElo: number;
  clasificacionElo: number;
}

export interface UsuarioDTO {
  idUsuario: number;
  nick: string;
  ciudad?: string | null;
  faccion: FaccionDTO;
}

export interface UsuarioDataDTO {
  idUsuario: number;
  nick: string;
  email: string;
  faccion: FaccionDTO;
  partidasValidadas: ViewPartidaAmistosaDTO[];
  partidasPendientes: ViewPartidaAmistosaDTO[];
  elos: EloDTO[];
  InscripcionesIndividualTorneo: InscripcionUsuarioIndividualDTO[];
  InscripcionesEquipoTorneo: InscripcionUsuarioEquipoDTO[];
  clasificacionElo: number;
  puntuacionElo: number;
  numeroPartidasJugadas: number;
  partidasGanadas: number;
  partidasEmpatadas: number;
  partidasPerdidas: number;
  proteccionDatos: boolean | null;
  PartidasTorneo: ViewPartidaTorneoDTO[];
  ClasificacionTorneos: ClasificacionTorneosDTO[];
  rankingElo: number;
}

export interface ClasificacionTorneosDTO {
  nombreTorneo: string;
  resultado: number;
}

export interface UsuarioCambioPassDTO {
  idUsuario: number;
  oldPass: string;
  newPass: string;
}

export interface AceptarProteccionDatos {
  idUsuario: number;
  proteccionDatos: boolean;
}

export interface UsuarioFastDTO {
  ciudad: string;
  faccion: FaccionDTO;
  idFaccion: number;
  idUsuario: number;
  nick: string;
}

export interface UsuarioInscripcionTorneoDTO {
  idUsuario: number;
  nick?: string;
  idFaccion?: number;
  ciudad?: string;
  faccion?: FaccionDTO;
  inscripcionTorneos: InscripcionDTO[];
}

export interface InscripcionDTO {
  idInscripcion: number;
  idTorneo: number;
  idUsuario: number;
  idEquipo?: number;
  lista: ListaDTO[];
}

export interface ListaDTO {
  idLista?: number;
  listaData?: string;
  bando?: string;
  ejercito?: string;
}
