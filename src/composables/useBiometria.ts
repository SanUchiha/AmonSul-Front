import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";
import {
  AccessControl,
  BiometryType,
  Credentials,
  NativeBiometric,
} from "@capgo/capacitor-native-biometric";

const SERVIDOR = "com.amonsul.app";
const CUENTA_ACTIVADA = "biometriaCuenta";
// Sin esto, el primer dedo mal puesto cierra la ventana de la huella. Es el máximo que admite Android
const INTENTOS_ANDROID = 5;

const NOMBRES: Partial<Record<BiometryType, string>> = {
  [BiometryType.FACE_ID]: "Face ID",
  [BiometryType.TOUCH_ID]: "Touch ID",
  [BiometryType.FINGERPRINT]: "huella",
};

// Vacío si este dispositivo no puede: en la web, sin biometría configurada...
const nombreDelAcceso = async (): Promise<string> => {
  if (!Capacitor.isNativePlatform()) return "";
  try {
    const { isAvailable, biometryType } = await NativeBiometric.isAvailable({
      useFallback: false,
    });
    return isAvailable ? (NOMBRES[biometryType] ?? "biometría") : "";
  } catch {
    return "";
  }
};

const cuentaActivada = async () =>
  (await Preferences.get({ key: CUENTA_ACTIVADA })).value;

// Cuando caduca la sesión se entra con un login normal, sin escribir nada. Las credenciales las protege el sistema: no
// se pueden leer sin huella o Face ID, y dejan de valer si cambian las registradas en el dispositivo
const activar = async (cuenta: string, password: string): Promise<boolean> => {
  try {
    await NativeBiometric.setCredentials({
      username: cuenta,
      password,
      server: SERVIDOR,
      accessControl: AccessControl.BIOMETRY_CURRENT_SET,
      title: "Entrar sin escribir la contraseña",
      negativeButtonText: "Ahora no",
      maxAttempts: INTENTOS_ANDROID,
    });
    await Preferences.set({ key: CUENTA_ACTIVADA, value: cuenta });
    return true;
  } catch (error) {
    console.error("No se pudo activar el acceso", error);
    return false;
  }
};

const desactivar = async () => {
  await Preferences.remove({ key: CUENTA_ACTIVADA });
  if (!Capacitor.isNativePlatform()) return;
  try {
    await NativeBiometric.deleteCredentials({ server: SERVIDOR });
  } catch {
    // No había nada guardado
  }
};

const hayQuePreguntar = async (cuenta: string): Promise<boolean> =>
  !!(await nombreDelAcceso()) && (await cuentaActivada()) !== cuenta;

// El aviso de activado vive en Preferences: en iOS lo guardado sobrevive a desinstalar la app, y así no cuenta
const hayAccesoGuardado = async (): Promise<boolean> =>
  !!(await cuentaActivada()) && !!(await nombreDelAcceso());

// Null si cancela, no es la persona o el sistema lo ha invalidado
const leerAcceso = async (): Promise<Credentials | null> => {
  try {
    return await NativeBiometric.getSecureCredentials({
      server: SERVIDOR,
      reason: "Para entrar en Amon Sûl",
      title: "Amon Sûl",
      negativeButtonText: "Cancelar",
      maxAttempts: INTENTOS_ANDROID,
    });
  } catch {
    return null;
  }
};

export const useBiometria = () => ({
  nombreDelAcceso,
  cuentaActivada,
  activar,
  desactivar,
  hayQuePreguntar,
  hayAccesoGuardado,
  leerAcceso,
});
