export interface FaccionDTO {
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
