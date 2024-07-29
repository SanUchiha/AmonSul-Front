import { ContactForm } from "@/interfaces/Contacto";
import { appsettings } from "@/settings/appsettings";
import axios, { AxiosError } from "axios";

const baseUrl: string = appsettings.apiUrl;

export const sendEmailContacto = async (contacto: ContactForm) => {
  try {
    const response = await axios.post(baseUrl + "Email/Contacto", contacto);
    if (response.data.status) return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error as AxiosError;
    } else {
      throw new Error("Ocurrió un error desconocido");
    }
  }
};
