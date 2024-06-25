import { reactive, computed } from "vue";
import axios from "axios";
import { RequestLoginDTO } from "@/interfaces/Login";
import { appsettings } from "@/settings/appsettings";

const BASE_URL: string = appsettings.apiUrl;

const stateAuth = reactive({
  user: null,
  token: localStorage.getItem("token") || "",
});

const login = async (credentials: RequestLoginDTO) => {
  try {
    console.log("credenctiales:", credentials);
    const response = await axios.post(BASE_URL + "Acceso/Login", credentials);
    if (response.data.isAccess) {
      const token = response.data.token;
      const user = response.data.user;

      localStorage.setItem("token", token);
      stateAuth.token = token;
      stateAuth.user = user;
      console.log("response:", response);
      console.log("localStorage:", localStorage);
      console.log("stateauth", stateAuth);
      console.log("localStorage.get:", localStorage.getItem("token"));
    }
  } catch (error) {
    console.error("Error in login:", error);
  }
};

const logout = () => {
  localStorage.removeItem("token");
  stateAuth.user = null;
  stateAuth.token = "";
};

const isAuthenticated = computed(() => !!stateAuth.token);
const getUser = computed(() => stateAuth.user);

export function useAuth() {
  return {
    stateAuth,
    login,
    logout,
    isAuthenticated,
    getUser,
  };
}
