import axios from 'axios'
import {
  interceptorResponse,
  interceptorResponseError,
} from '@/services/interceptors/interceptorResponse'
import {
  interceptorRequest,
  interceptorRequestError,
} from '@/services/interceptors/interceptorRequest'
import { appsettings } from "@/settings/appsettings";

const baseUrl: string = appsettings.apiUrl;

export const http = axios.create({baseURL: baseUrl})

http.interceptors.request.use(
  interceptorRequest,
  interceptorRequestError,
)
http.interceptors.response.use(
  interceptorResponse,
  interceptorResponseError,
)
