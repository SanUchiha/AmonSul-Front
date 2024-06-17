export interface Usuario {
  id?: number;
  correo?: string;
  password?: string;
}

export interface NewUserDTO{
  Nombre_Usuario: string;
  Primer_Apellido: string;
  Segundo_Apellido?: string;
  Email: string;
  Contraseña: string;
  Rol: 'JUGADOR';
  Nick: string;
  Ciudad: string;
  Faccion: string;
  Fecha_Nacimiento: Date;
}

export interface Faccion {
  ID_Faccion: number;            
  Nombre_Faccion: string;
}

export interface Jugador{
  ID_Usuario: number;            
  Nombre_Usuario: string;
  Primer_Apellido: string;
  Segundo_Apellido?: string;
  Email: string;
  Contraseña: string;
  Rol: 'JUGADOR' | 'ADMIN';
  Nick: string;
  Ciudad: string;
  Faccion: string;
  Fecha_Registro: Date;
  Fecha_Nacimiento: Date;
}


