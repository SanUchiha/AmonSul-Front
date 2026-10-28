import axios from "axios";

export const SIN_LISTA = "Todavía no ha entregado la lista.";

// Por qué no se puede abrir una lista: el back manda el motivo como texto (sin lista, listas ocultas)
export function motivoSinLista(error: unknown): string {
  if (
    axios.isAxiosError(error) &&
    typeof error.response?.data === "string" &&
    error.response.data.trim()
  )
    return error.response.data;
  return "No se ha podido cargar la lista.";
}
