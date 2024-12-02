import { RegistrarFaccionDTO } from "../interfaces/Faccion";
import { http } from "./index";

export const getFacciones = async () => {
  return http.get("Faccion");
};

export const getFaccionByIdUser = async (idUser: number) => {
  return http.get(`Faccion/Faccion/${idUser}`);
};

export const registrarFaccion = async (nombreFaccionString: string) => {
  const body: RegistrarFaccionDTO = {
    nombreFaccion: nombreFaccionString,
  };
  return http.post("Faccion/Registrar", body);
};
