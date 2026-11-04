import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { Keyboard } from "@capacitor/keyboard";

// Sin esto, con @capacitor/app instalado el botón Atrás de Android no hace nada al llegar al principio del
// historial, y la app no se puede cerrar con él. history.back() también cierra primero los diálogos abiertos
export const useBotonAtras = () => {
  const init = () => {
    if (!Capacitor.isNativePlatform()) return;

    let tecladoAbierto = false;
    Keyboard.addListener("keyboardWillShow", () => (tecladoAbierto = true));
    Keyboard.addListener("keyboardDidHide", () => (tecladoAbierto = false));

    App.addListener("backButton", ({ canGoBack }) => {
      // Atrás cierra el teclado, pero también puede llegar aquí: volver de página perdería el formulario
      if (tecladoAbierto) {
        tecladoAbierto = false;
        Keyboard.hide();
      } else if (canGoBack) window.history.back();
      else App.exitApp();
    });
  };

  return { init };
};
