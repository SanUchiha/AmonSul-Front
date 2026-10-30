import axios from "axios";

// El back manda el motivo como texto en los 400; si no hay, el mensaje por defecto
export function mensajeDelBack(error: unknown, porDefecto: string): string {
  if (
    axios.isAxiosError(error) &&
    typeof error.response?.data === "string" &&
    error.response.data.trim()
  )
    return error.response.data;
  return porDefecto;
}
