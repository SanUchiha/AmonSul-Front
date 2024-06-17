import { RequestLoginDTO, ResponseLoginDTO } from "@/interfaces/Login";
import axios from "axios";
import { appsettings } from "@/settings/appsettings";

const baseUrl: string = appsettings.apiUrl;

export const doLogin = async (login: RequestLoginDTO) => {
  await axios
    .post<ResponseLoginDTO>(baseUrl, { login })
    .then((response) => console.log(response))
    .catch((error) => console.log(error));
};
