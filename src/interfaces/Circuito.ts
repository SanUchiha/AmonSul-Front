export interface CircuitoTorneosDTO {
  idCircuito: number;
  circuitoNombre: string;
  idTorneo: number;
  torneoNombre: string;
}

export interface CircuitoDTO {
  idCircuito: number;
  nombreCircuito: string;
  // Quien lo creó desde la web, el único que lo renombra o lo borra. Los antiguos no tienen
  idUsuario?: number | null;
  // Cuántos eventos tiene, para la lista de circuitos
  numeroEventos?: number;
  // Su año en la lista es el de su creación
  fechaCreacion?: string;
}

export interface AddCircuitoTorneoDTO {
  idCircuito: number;
  idTorneo: number;
}
