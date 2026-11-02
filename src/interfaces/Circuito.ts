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
  // Los años en que empiezan sus eventos y cuántos son, para la lista de circuitos
  anios?: number[];
  numeroEventos?: number;
}

export interface AddCircuitoTorneoDTO {
  idCircuito: number;
  idTorneo: number;
}
