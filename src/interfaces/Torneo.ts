export interface Torneo {
    ID_Torneo: number; // Identificador único del torneo (PK)
    ID_Usuario: number; // ID del usuario administrador del torneo (FK)
    Nombre_Torneo: string; // Nombre del torneo
    Descripción_Torneo: string; // Descripción del torneo
    Fecha_Inicio_Torneo: Date; // Fecha de inicio del torneo
    Fecha_Fin_Torneo: Date; // Fecha de fin del torneo
    Precio_Torneo: number; // Precio del torneo
    Numero_Partidas: number; // Número de partidas del torneo
    Puntos_Torneo: number; // Puntos asignados al torneo
    Estado_Torneo: 'Esperando' | 'live' | 'terminado' | 'cancelado'; // Estado del torneo (enum)
    Lugar_Torneo: string; // Lugar donde se llevará a cabo el torneo
    Tipo_Torneo: string; // Tipo de torneo
    Es_Privado_Torneo: boolean; // Indica si el torneo es privado o no
    ID_Rango_Torneo: number; // ID del rango del torneo (FK)
    Es_Matched_Play_Torneo: boolean; // Indica si el torneo es de tipo Matched Play
    Fecha_Entrega_Listas: Date; // Fecha límite de entrega de listas
    Fecha_Fin_Inscripcion: Date; // Fecha límite de inscripción
    Bases_Torneo: string; // Bases del torneo
    Cartel_Torneo: string; // Imagen o cartel del torneo
    Metodos_Pago: string[]; // Métodos de pago aceptados
    Hora_Inicio_Torneo: string; // Hora de inicio del torneo
    Hora_Fin_Torneo: string; // Hora de fin del torneo
}