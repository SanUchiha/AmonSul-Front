import axios from 'axios'
import type { AxiosError } from 'axios'
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import router from '@/router/index'
import { useAuth } from '@/composables/useAuth'
import { leerDatoSesion } from '@/services/StorageService'

type errorCode = number | null
interface interceptorError extends AxiosError {
  errorType: string
  response: any
}

export const interceptorResponse = (
  response: AxiosResponse,
) => {
  return response
}

const funcErrors = (
  errorCode: errorCode,
) => {
  // define each generic errors
  const token = leerDatoSesion("token");
  if (errorCode === 403) {
    if (!token) {
      router.push({ name: "inicio-sesion" });
    }
    else {
      router.push({ name: "error" });
    }
  }
  else if (errorCode === 500) { router.push({ name: "error" }); }
  else if (errorCode === 401) {
    // La sesión guardada ya no vale (caduca a las 12 horas): se borra. A iniciar sesión solo si la página
    // la necesita; las públicas, como la de elegir una contraseña nueva desde el correo, siguen abiertas
    useAuth().logout();
    router.isReady().then(() => {
      if (router.currentRoute.value.meta.requiresAuth) router.push({ name: "inicio-sesion" });
    });
  }
  else if (errorCode === 404) { router.push({ name: "inicio-sesion" }); }
}

// Token caducado: se pide otro con el refresh token y se repite la petición una vez. Se repite con axios sin
// interceptores, que no vuelva a entrar aquí; si falla otra vez, se trata como cualquier otro error
const repetirConTokenNuevo = async (config: InternalAxiosRequestConfig) => {
  const tokenUsado = String(config.headers.Authorization ?? '').replace('Bearer ', '')
  if (!(await useAuth().renovarSesion(tokenUsado))) return null

  config.headers.Authorization = `Bearer ${leerDatoSesion("token")}`
  try {
    return await axios.request(config)
  }
  catch (errReintento) {
    if (axios.isAxiosError(errReintento)) funcErrors(errReintento.response?.status ?? null)
    throw errReintento
  }
}

export const interceptorResponseError = async (
  err: interceptorError,
) => {
  const errorCode: errorCode
    = err.response && err.response.status
      ? err.response.status
      : null
  err.errorType = ''
  const config = err.config
  // call canceled
  if (axios.isCancel(err)) {
    err.errorType = 'cancelled'
  }
  else {
    if (errorCode === 401 && config && leerDatoSesion("refreshToken")) {
      const respuesta = await repetirConTokenNuevo(config)
      if (respuesta) return respuesta
    }
    funcErrors(errorCode)
  }
  return Promise.reject(err)
}
