import { Preferences } from "@capacitor/preferences";

// La sesión se guarda con @capacitor/preferences y no en localStorage: en la app móvil el sistema puede
// borrar el localStorage del WebView. En la web Preferences usa localStorage por debajo (claves
// «CapacitorStorage.*»). Se lee una vez al arrancar y se copia en memoria para que el router y los
// interceptores puedan leerla sin esperar.

const CLAVES_SESION = ["token", "user", "idUsuario", "refreshToken"] as const;
export type ClaveSesion = (typeof CLAVES_SESION)[number];

const enMemoria: Partial<Record<ClaveSesion, string>> = {};

// Antes de montar la app, y de nuevo al renovar la sesión por si otra pestaña la ha cambiado. La sesión que
// estaba en localStorage con las claves de antes pasa a Preferences, así nadie tiene que volver a iniciar sesión
export const cargarSesionGuardada = async (): Promise<void> => {
  for (const clave of CLAVES_SESION) {
    let { value } = await Preferences.get({ key: clave });
    const antigua = localStorage.getItem(clave);
    if (value === null && antigua !== null) {
      await Preferences.set({ key: clave, value: antigua });
      value = antigua;
    }
    if (antigua !== null) localStorage.removeItem(clave);
    if (value !== null) enMemoria[clave] = value;
    else delete enMemoria[clave];
  }
};

export const leerDatoSesion = (clave: ClaveSesion): string | null =>
  enMemoria[clave] ?? null;

export const guardarDatoSesion = (
  clave: ClaveSesion,
  valor: string
): Promise<void> => {
  enMemoria[clave] = valor;
  return Preferences.set({ key: clave, value: valor });
};

export const borrarSesionGuardada = (): Promise<void> => {
  for (const clave of CLAVES_SESION) delete enMemoria[clave];
  return Promise.all(
    CLAVES_SESION.map(clave => Preferences.remove({ key: clave }))
  ).then(() => undefined);
};
