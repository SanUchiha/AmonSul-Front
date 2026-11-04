import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";

// Sin esto, con @capacitor/app instalado el botón Atrás de Android no hace nada al llegar al principio del
// historial, y la app no se puede cerrar con él. history.back() también cierra primero los diálogos abiertos
export const useBotonAtras = () => {
  const init = () => {
    if (!Capacitor.isNativePlatform()) return;

    App.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack) window.history.back();
      else App.exitApp();
    });
  };

  return { init };
};
