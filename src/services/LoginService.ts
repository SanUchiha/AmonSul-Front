import { RequestLoginDTO, ResponseLoginDTO } from "@/interfaces/Login";
import axios from "axios";
import { appsettings } from "@/settings/appsettings";

const baseUrl: string = appsettings.apiUrl;

export const doLogin = async (login: RequestLoginDTO) => {
  const json = {
    usuario: "test@test.ru",
    password: "test",
  };
  await axios
    .post("https://tradernet.com/api/check-login-password", json)
    .then((response) => console.log(response))
    .catch((error) => console.log(error));
};
