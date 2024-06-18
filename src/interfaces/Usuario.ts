export interface Usuario {
  id?: number;
  correo?: string;
  password?: string;
}

export interface NewUserDTO {
  NombreUsuario: string;
  PrimerApellido: string;
  SegundoApellido?: string;
  Email: string;
  Contraseña: string;
  Rol: "JUGADOR";
  Nick: string;
  Ciudad: string;
  Faccion: string;
  FechaNacimiento: string;
}

export interface Faccion {
  ID_Faccion: number;
  Nombre_Faccion: string;
}

export interface Jugador {
  ID_Usuario: number;
  NombreUsuario: string;
  PrimerApellido: string;
  SegundoApellido?: string;
  Email: string;
  Contraseña: string;
  Rol: "JUGADOR" | "ADMIN";
  Nick: string;
  Ciudad: string;
  Faccion: string;
  FechaRegistro: Date;
  FechaNacimiento: Date;
}
