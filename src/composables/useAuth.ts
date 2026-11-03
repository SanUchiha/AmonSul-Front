import { reactive, computed } from "vue";
import axios from "axios";
import { RequestLoginDTO } from "@/interfaces/Login";
import { appsettings } from "@/settings/appsettings";
import { AuthState } from "@/interfaces/Login";
import {
  borrarSesionGuardada,
  cargarSesionGuardada,
  guardarDatoSesion,
  leerDatoSesion,
} from "@/services/StorageService";

const BASE_URL: string = appsettings.apiUrl;

const sesionGuardada = () => ({
  user: JSON.parse(leerDatoSesion("user") || "null"),
  token: leerDatoSesion("token") || "",
  idUsuario: JSON.parse(leerDatoSesion("idUsuario") || "null"),
});

const stateAuth = reactive<AuthState>({ ...sesionGuardada(), error: null });

// En main.ts, antes de montar la app: la sesión del dispositivo se lee sin esperar desde el router
const restaurarSesion = async () => {
  await cargarSesionGuardada();
  Object.assign(stateAuth, sesionGuardada());
};

// Lo que devuelven Acceso/Login y Acceso/Refresh cuando entra
const guardarSesion = async (data: {
  token: string;
  user: string;
  idUsuario: string;
  refreshToken?: string;
}) => {
  await Promise.all([
    guardarDatoSesion("token", data.token),
    guardarDatoSesion("user", JSON.stringify(data.user)),
    guardarDatoSesion("idUsuario", JSON.stringify(data.idUsuario)),
    data.refreshToken && guardarDatoSesion("refreshToken", data.refreshToken),
  ]);

  stateAuth.token = data.token;
  stateAuth.user = data.user;
  stateAuth.idUsuario = data.idUsuario;
  stateAuth.error = null;
};

const login = async (credentials: RequestLoginDTO) => {
  try {
    const response = await axios.post(BASE_URL + "Acceso/Login", credentials);
    if (response.data.isAccess) await guardarSesion(response.data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.message || "Error de servidor";
      stateAuth.error = errorMessage;
      return errorMessage;
    }
    throw error;
  }
};

// El token caduca a las 12 horas: con el refresh token se pide otro sin volver a iniciar sesión. Una sola
// renovación a la vez, aunque caduquen varias peticiones juntas
let renovacionEnCurso: Promise<boolean> | null = null;

const renovarSesion = (tokenCaducado: string): Promise<boolean> => {
  if (!renovacionEnCurso)
    renovacionEnCurso = pedirTokenNuevo(tokenCaducado).finally(() => {
      renovacionEnCurso = null;
    });
  return renovacionEnCurso;
};

const pedirTokenNuevo = async (tokenCaducado: string): Promise<boolean> => {
  // Otra pestaña puede haberla renovado ya: se parte de lo guardado, no de la copia en memoria
  await cargarSesionGuardada();
  Object.assign(stateAuth, sesionGuardada());
  if (stateAuth.token && stateAuth.token !== tokenCaducado) return true;

  const refreshToken = leerDatoSesion("refreshToken");
  if (!refreshToken) return false;
  try {
    const { data } = await axios.post(BASE_URL + "Acceso/Refresh", {
      refreshToken,
    });
    if (!data.isAccess) return false;
    await guardarSesion(data);
    return true;
  } catch {
    return false;
  }
};

const logout = () => {
  void borrarSesionGuardada();

  stateAuth.user = "";
  stateAuth.token = "";
  stateAuth.error = null;
  stateAuth.idUsuario = "";
};

const isAuthenticated = computed(() => !!stateAuth.token);
const getUser = computed(() => stateAuth.user);
const getidUsuario = computed(() => stateAuth.idUsuario);
const getError = computed<string | null>(() => stateAuth.error);

export function useAuth() {
  return {
    stateAuth,
    restaurarSesion,
    renovarSesion,
    login,
    logout,
    isAuthenticated,
    getUser,
    getidUsuario,
    getError,
  };
}
