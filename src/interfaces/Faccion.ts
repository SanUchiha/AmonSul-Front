export interface Faccion {
  idFaccion: number;
  nombreFaccion: string;
}

export interface RegistrarFaccionDTO {
  nombreFaccion: string;
}

export interface EditarFaccionDTO {
  idFaccion: number;
  idUsuario: number;
}
