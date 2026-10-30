import { TorneoReducidoDTO } from "@/interfaces/Torneo";
import { diaDeHoy, ultimoDiaEvento } from "@/utils/Fecha";

// Una inscripción del usuario, individual o con su equipo, para Mis eventos
export interface MiInscripcion {
  clave: string;
  idInscripcion: number;
  idTorneo: number;
  idOrganizador: number | null;
  porEquipos: boolean;
  torneo: TorneoReducidoDTO;
  // Solo en las individuales
  estadoLista?: string | null;
  esPago?: string | boolean | null;
  // Liga y Copa: el ejército de todo el evento
  ejercitoElegido?: string | null;
}

const primerDia = (inscripcion: MiInscripcion) =>
  (inscripcion.torneo.fechaInicioTorneo ?? inscripcion.torneo.fechaFinTorneo).slice(0, 10);

export const ultimoDia = (inscripcion: MiInscripcion) =>
  ultimoDiaEvento(primerDia(inscripcion), inscripcion.torneo.fechaFinTorneo);

export const haTerminado = (inscripcion: MiInscripcion) => ultimoDia(inscripcion) < diaDeHoy();

// Ya empezado y sin terminar: una liga a mitad o un torneo que se juega hoy
export const estaEnCurso = (inscripcion: MiInscripcion) =>
  primerDia(inscripcion) <= diaDeHoy() && !haTerminado(inscripcion);

// Próximos: primero el que antes empieza. Terminados: primero el que acabó más tarde
export const ordenProximos = (a: MiInscripcion, b: MiInscripcion) =>
  primerDia(a).localeCompare(primerDia(b));
export const ordenTerminados = (a: MiInscripcion, b: MiInscripcion) =>
  ultimoDia(b).localeCompare(ultimoDia(a));

export { primerDia };

// El estado de una lista como se enseña. OK: la ha dado por buena el organizador
export const estadoLista = (estado?: string | null) => {
  const valor = (estado ?? "").toUpperCase();
  if (valor === "OK") return { texto: "Lista validada", color: "success" };
  if (valor === "ENTREGADA") return { texto: "Lista entregada", color: "info" };
  return { texto: "Lista sin entregar", color: "warning" };
};
