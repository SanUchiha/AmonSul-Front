import { http } from "./index";

// Va en segundo plano: si falla, no hay que llevar a nadie al login ni a la página de error, que es lo que hace el
// interceptor con el 404 y el 500. Con el 401 sí interesa que actúe, porque renueva la sesión
const enSegundoPlano = {
  validateStatus: (estado: number) => estado !== 401,
};

export const registrarDispositivo = (token: string, plataforma: string) =>
  http.post(
    "Notificaciones/Dispositivo",
    { token, plataforma },
    enSegundoPlano
  );

export const quitarDispositivo = (token: string) =>
  http.delete("Notificaciones/Dispositivo", {
    data: { token },
    ...enSegundoPlano,
  });
