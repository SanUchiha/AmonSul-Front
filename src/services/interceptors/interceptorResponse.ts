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

// El hosting corta por IP si llegan muchas peticiones seguidas, como cuando todo un torneo toca el aviso de una ronda
// desde la misma wifi. El corte dura mientras siga entrando tráfico, unos 10 s en las pruebas: esperas largas para
// cubrirlo sin alargarlo. Las lecturas se repiten solas; de las escrituras, solo guardar el resultado de una partida,
// que lleva los mismos valores: si la primera llegó, la segunda no cambia nada
const ESPERAS_TRAS_CORTE_MS = [1500, 3000, 5000, 8000]
const CODIGOS_SERVIDOR_NO_DISPONIBLE = [502, 503, 504]
const RUTA_GUARDAR_PARTIDA = 'Torneo/Editar-Partida'

const sePuedeRepetir = (config: AxiosError['config']) => {
  const metodo = config?.method?.toLowerCase()
  return metodo === 'get' || (metodo === 'put' && config?.url === RUTA_GUARDAR_PARTIDA)
}

const esCorte = (err: AxiosError) => {
  const { config, response } = err
  return (
    sePuedeRepetir(config) &&
    !axios.isCancel(err) &&
    (!response || CODIGOS_SERVIDOR_NO_DISPONIBLE.includes(response.status))
  )
}

const repetirTrasCorte = async (config: InternalAxiosRequestConfig) => {
  for (const espera of ESPERAS_TRAS_CORTE_MS) {
    // Con algo de azar: si se ha cortado a muchos a la vez, que no vuelvan todos en el mismo momento
    await new Promise(resolve => setTimeout(resolve, espera * (0.5 + Math.random())))
    try {
      return await axios.request(config)
    }
    catch (errReintento) {
      if (!axios.isAxiosError(errReintento) || !esCorte(errReintento)) throw errReintento
    }
  }
  return null
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
): Promise<AxiosResponse> => {
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
    if (config && esCorte(err)) {
      try {
        const respuesta = await repetirTrasCorte(config)
        if (respuesta) return respuesta
      }
      catch (errReintento) {
        // Ya no es un corte (la sesión ha caducado, por ejemplo): se trata como cualquier otro error
        return interceptorResponseError(errReintento as interceptorError)
      }
    }
    if (errorCode === 401 && config && leerDatoSesion("refreshToken")) {
      const respuesta = await repetirConTokenNuevo(config)
      if (respuesta) return respuesta
    }
    funcErrors(errorCode)
  }
  return Promise.reject(err)
}
