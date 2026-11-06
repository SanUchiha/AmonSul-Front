import { Capacitor } from "@capacitor/core";
import { FirebaseMessaging, Importance } from "@capacitor-firebase/messaging";
import router from "@/router";
import { useAuth } from "@/composables/useAuth";
import { useToast } from "@/composables/useToast";
import {
  quitarDispositivo,
  registrarDispositivo,
} from "@/services/NotificacionesService";

// El canal de AndroidManifest.xml: con importancia alta, el aviso de una ronda se ve aunque se esté en otra app
const CANAL_ANDROID = "avisos";

let tokenRegistrado = "";

const darDeAlta = async (token: string) => {
  await registrarDispositivo(token, Capacitor.getPlatform());
  tokenRegistrado = token;
};

// Con sesión: la primera vez pide permiso y da de alta este móvil en la cuenta. Sin permiso no hay avisos, y no
// pasa nada: la app sigue igual
const registrar = async () => {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const { receive } = await FirebaseMessaging.requestPermissions();
    if (receive !== "granted") return;
    if (Capacitor.getPlatform() === "android")
      await FirebaseMessaging.createChannel({
        id: CANAL_ANDROID,
        name: "Avisos",
        importance: Importance.High,
      });
    const { token } = await FirebaseMessaging.getToken();
    await darDeAlta(token);
  } catch (error) {
    console.error("No se pudo activar las notificaciones", error);
  }
};

// Al cerrar sesión, con el token aún válido: este móvil deja de recibir los avisos de la cuenta
const quitar = async () => {
  if (!tokenRegistrado) return;
  try {
    await quitarDispositivo(tokenRegistrado);
  } catch (error) {
    console.error("No se pudo quitar el dispositivo", error);
  }
  tokenRegistrado = "";
};

// Quien ya tiene el evento del aviso delante lo ve actualizado sin tocar nada. El aviso de una ronda llega a todos a la
// vez y el servidor corta si le entran demasiadas peticiones juntas: cada móvil espera un rato al azar
const ESPERA_MAX_REFRESCO_MS = 10000;
let refrescoPendiente = false;

const refrescarSiEstaEnPantalla = (ruta: string) => {
  const destino = router.resolve(ruta);
  const enPantalla = () => router.currentRoute.value.path === destino.path;
  if (destino.name !== "detalle-evento" || !enPantalla() || refrescoPendiente) return;

  refrescoPendiente = true;
  setTimeout(() => {
    refrescoPendiente = false;
    // Se ha ido del evento, o está con una ventana abierta, como la de meter el resultado: no se le quita de delante
    if (!enPantalla() || document.querySelector(".v-dialog.v-overlay--active")) return;
    const { path, query } = router.currentRoute.value;
    router.replace({ path, query: { ...query, aviso: String(Date.now()) } });
  }, Math.random() * ESPERA_MAX_REFRESCO_MS);
};

const escuchar = () => {
  if (!Capacitor.isNativePlatform()) return;

  // Firebase puede cambiar el token de un móvil
  FirebaseMessaging.addListener("tokenReceived", ({ token }) => {
    if (useAuth().isAuthenticated.value) void darDeAlta(token);
  });

  FirebaseMessaging.addListener(
    "notificationActionPerformed",
    ({ notification }) => {
      const { ruta } = (notification.data ?? {}) as { ruta?: string };
      if (!ruta) return;
      // Con la marca, tocar el aviso del evento que ya se está viendo también lo actualiza
      const destino = router.resolve(ruta);
      router.push({ path: destino.path, query: { ...destino.query, aviso: String(Date.now()) } });
    }
  );

  // Con la app abierta, Android no enseña nada; iOS sí, por presentationOptions
  FirebaseMessaging.addListener("notificationReceived", ({ notification }) => {
    const { ruta } = (notification.data ?? {}) as { ruta?: string };
    if (ruta) refrescarSiEstaEnPantalla(ruta);
    if (Capacitor.getPlatform() !== "android") return;
    useToast().triggerToast(
      "info",
      [notification.title, notification.body].filter(Boolean).join(": ")
    );
  });
};

export const useNotificacionesPush = () => ({ registrar, quitar, escuchar });
