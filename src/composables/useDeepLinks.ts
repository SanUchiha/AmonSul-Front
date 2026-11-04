import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import router from "@/router";

const abrirEnlace = (url: string) => {
  try {
    const { pathname, search } = new URL(url);
    router.push(pathname + search);
  } catch {
    // Enlace mal formado: la app se queda donde está
  }
};

// Android App Links y Universal Links de iOS: el enlace del correo de recuperar la contraseña abre la app,
// en la misma ruta que tiene en la web. Si la app estaba cerrada, Capacitor guarda el aviso hasta que se escucha,
// así que no hace falta getLaunchUrl (lo llevaría dos veces, y otra más tras cada location.reload())
export const useDeepLinks = () => {
  const init = () => {
    if (!Capacitor.isNativePlatform()) return;

    App.addListener("appUrlOpen", evento => abrirEnlace(evento.url));
  };

  return { init };
};
