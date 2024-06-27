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
  nombreUsuario: string;
  primerApellido: string;
  segundoApellido?: string;
  email: string;
  nick: string;
  ciudad?: string;
  fechaRegistro: string;
  fechaNacimiento: string;
  idFaccion?: number;
  telefono?: string;
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
