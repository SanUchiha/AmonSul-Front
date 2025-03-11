import { EditarFaccionDTO } from "@/interfaces/Faccion";
import {
  AceptarProteccionDatos,
  NewUserDTO,
  UsuarioCambioPassDTO,
} from "@/interfaces/Usuario";
import { http } from "./index";

export const newUser = async (newUser: NewUserDTO) => {
  return http.post(`Usuario/Registrar`, newUser);
};

export const getUsuarioPartidas = async (email: string) => {
  return http.get(`Usuario/Email/${email}`);
};

export const getUsuario = async (email: string) => {
  return http.get(`Usuario/${email}`);
};

export const getUsuarios = async () => {
  return http.get(`Usuario/All`);
};

export const getUsuariosFast = async () => {
  return http.get(`Usuario`);
};

export const getUsuariosByTorneo = async (idTorneo: number) => {
  console.log("getUsuariosByTorneo idTorneo: ", idTorneo)
  return http.get(`Usuario/torneo/${idTorneo}`);
};

export const getUsuariosNoInscritosTorneoAsync = async (idTorneo: number) => {
  return http.get(`Usuario/no-inscritos-torneo/${idTorneo}`);
};

export const getNicks = async () => {
  return http.get(`Usuario/Nicks`);
};

export const editarUsuario = async (json: any) => {
  return http.put(`Usuario/Editar`, json);
};

export const getNickById = async (idUsuario: number) => {
  return http.get(`Usuario/id/${idUsuario}`);
};

export const getUsuarioByNick = async (nick: string) => {
  return http.get(`Usuario/nick/${nick}`);
};

export const getDetalleUsuarioByEmail = async (email: string) => {
  return http.get(`Usuario/detalle/${email}`);
};

export const getUsuarioData = async (idUsuario: number) => {
  return http.get(`Usuario/Data/${idUsuario}`);
};

export const editarFaccion = async (body: EditarFaccionDTO) => {
  return http.put(`Usuario/modificar-faccion`, body);
};

export const cambiarPass = async (body: UsuarioCambioPassDTO) => {
  return http.put(`Usuario/Cambiar-Pass`, body);
};

export const aceptarProteccionDatos = async (body: AceptarProteccionDatos) => {
  return http.put(`Usuario/Proteccion-Datos`, body);
};

export const recordarPass = async (email: string) => {
  return http.get(`Usuario/Recordar-Pass/${email}`);
};

class UsuariosService {
  static newUser = (newUser: NewUserDTO) => {
    return http.post(`Usuario/Registrar`, newUser);
  };

  static getUsuarioPartidas = (email: string) => {
    return http.get(`Usuario/Email/${email}`);
  };

  static getUsuario = (email: string) => {
    return http.get(`Usuario/${email}`);
  };

  static getUsuarios = () => {
    return http.get(`Usuario`);
  };

  static editarUsuario = (json: any) => {
    return http.put(`Usuario/Editar`, json);
  };

  static getNickById = (idUsuario: number) => {
    return http.get(`Usuario/id/${idUsuario}`);
  };

  static getUsuarioByNick = (nick: string) => {
    return http.get(`Usuario/nick/${nick}`);
  };

  static getDetalleUsuarioByEmail = (email: string) => {
    return http.get(`Usuario/detalle/${email}`);
  };

  static getUsuarioData = (idUsuario: number) => {
    return http.get(`Usuario/Data/${idUsuario}`);
  };

  static editarFaccion = (body: EditarFaccionDTO) => {
    return http.put(`Usuario/modificar-faccion`, body);
  };
}

export { UsuariosService };
