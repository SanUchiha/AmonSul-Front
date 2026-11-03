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

const login = async (credentials: RequestLoginDTO) => {
  try {
    const response = await axios.post(BASE_URL + "Acceso/Login", credentials);
    if (response.data.isAccess) {
      const token = response.data.token;
      const user = response.data.user;
      const idUsuario = response.data.idUsuario;

      await Promise.all([
        guardarDatoSesion("token", token),
        guardarDatoSesion("user", JSON.stringify(user)),
        guardarDatoSesion("idUsuario", JSON.stringify(idUsuario)),
      ]);

      stateAuth.token = token;
      stateAuth.user = user;
      stateAuth.idUsuario = idUsuario;
      stateAuth.error = null;
    }
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
    login,
    logout,
    isAuthenticated,
    getUser,
    getidUsuario,
    getError,
  };
}
