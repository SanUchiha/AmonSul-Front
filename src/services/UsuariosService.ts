import { EditarFaccionDTO } from "@/interfaces/Faccion";
import { NewUserDTO } from "@/interfaces/Usuario";
import { http } from "./index";

class UsuariosService {
  static newUser = (newUser: NewUserDTO) => {
    return http.post(`Usuario/Registrar`, newUser)
  };

  static getUsuarioPartidas = (email: string) => {
    return http.get(`Usuario/Email/${email}`)
  };

  static getUsuario = (email: string) => {
    return http.get(`Usuario/${email}`)
  };

  static getUsuarios = () => {
    return http.get(`Usuario/All`)
  };

  static editarUsuario = (json: any) => {
    return http.put(`Usuario/Editar`, json)
  };

  static getNickById = (idUsuario: number) => {
    return http.get(`Usuario/id/${idUsuario}`)
  };

  static getUsuarioByNick = (nick: string) => {
    return http.get(`Usuario/nick/${nick}`)
  };

  static getDetalleUsuarioByEmail = (email: string) => {
    return http.get(`Usuario/detalle/${email}`)
  };

  static getUsuarioData = (idUsuario: number) => {
    return http.get(`Usuario/Data/${idUsuario}`)
  };

  static editarFaccion = (body: EditarFaccionDTO) => {
    return http.put(`Usuario/modificar-faccion`, body)
  };
}

export { UsuariosService }
