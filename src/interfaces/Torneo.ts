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
  tipoTorneo: string; // Tipo de torneo
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
  limitePlazas?: number; // Límite de plazas del torneo (opcional)
}
