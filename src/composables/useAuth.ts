import { reactive, computed } from "vue";
import axios from "axios";
import { RequestLoginDTO } from "@/interfaces/Login";
import { appsettings } from "@/settings/appsettings";
import { AuthState } from "@/interfaces/Login";

const BASE_URL: string = appsettings.apiUrl;

const stateAuth = reactive<AuthState>({
  user: JSON.parse(localStorage.getItem("user") || "null"),
  token: localStorage.getItem("token") || "",
  error: null,
  idUsuario: JSON.parse(localStorage.getItem("idUsuario") || "null"),
});

const login = async (credentials: RequestLoginDTO) => {
  try {
    const response = await axios.post(BASE_URL + "Acceso/Login", credentials);
    if (response.data.isAccess) {
      const token = response.data.token;
      const user = response.data.user;
      const idUsuario = response.data.idUsuario;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("idUsuario", JSON.stringify(idUsuario));

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
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("idUsuario");

  stateAuth.user = null;
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
    login,
    logout,
    isAuthenticated,
    getUser,
    getidUsuario,
    getError,
  };
}
