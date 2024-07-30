import { appsettings } from "@/settings/appsettings";
import axios from "axios";

const BASE_URL: string = appsettings.apiUrl;

export const getTorneos = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(BASE_URL + "Torneo", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error recuperando torneos:", error);
    throw error;
  }
};

export const getTorneo = async (idTorneo: number) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(BASE_URL + "Torneo/id/" + idTorneo, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error recuperando torneos:", error);
    throw error;
  }
};

export const descargarBasesTorneo = async (idTorneo: number) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(BASE_URL + "Torneo/bases/" + idTorneo, {
      responseType: "blob", // Importante para manejar la respuesta como blob
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; // El blob del archivo PDF
  } catch (error) {
    console.error("Error recuperando el archivo del torneo:", error);
    throw error;
  }
};

export const getTorneosCreadosUsuario = async (idUsuario: string) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(BASE_URL + "Torneo/creados/" + idUsuario, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error recuperando torneos creados por el usuario:", error);
    throw error;
  }
};
