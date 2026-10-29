export interface CircuitoTorneosDTO {
  idCircuito: number;
  circuitoNombre: string;
  idTorneo: number;
  torneoNombre: string;
}

export interface CircuitoDTO {
  idCircuito: number;
  nombreCircuito: string;
}

export interface AddCircuitoTorneoDTO {
  idCircuito: number;
  idTorneo: number;
}
