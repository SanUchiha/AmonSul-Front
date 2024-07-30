import axios from 'axios'
import type { AxiosError } from 'axios'
import type { AxiosResponse } from 'axios'
import router from '@/router/index'

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
  const token = localStorage.getItem("token");
  if (errorCode === 403) {
    if (!token) {
      router.push("inicio-sesion");
    }
    else {
      router.push("error");
    }
  }
  else if (errorCode === 500) { router.push("error"); }
  else if (errorCode === 401) { router.push("inicio-sesion"); }
  else if (errorCode === 404) { router.push("inicio-sesion"); }
}

export const interceptorResponseError = (
  err: interceptorError,
) => {
  const errorCode: errorCode
    = err.response && err.response.status
      ? err.response.status
      : null
  err.errorType = ''
  // call canceled
  if (axios.isCancel(err)) {
    err.errorType = 'cancelled'
  }
  else {
    funcErrors(errorCode)
  }
  return Promise.reject(err)
}
