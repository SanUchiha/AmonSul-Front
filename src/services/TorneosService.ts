import { ITorneo } from "@/interfaces/Torneo";
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
