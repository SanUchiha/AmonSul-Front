import { EditarFaccionDTO } from "@/interfaces/Faccion";
import { NewUserDTO } from "@/interfaces/Usuario";
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
