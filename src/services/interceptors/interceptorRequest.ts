import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { leerDatoSesion } from '@/services/StorageService'

interface customAxiosRequestConfig extends InternalAxiosRequestConfig {
  headers: any
}

export const interceptorRequest = async (config: customAxiosRequestConfig) => {
  const token = leerDatoSesion("token");
  config.headers = {
    Authorization: `Bearer ${token}`,
  }
  return config
}

export const interceptorRequestError = (err: AxiosError) => {
  console.error(err)
  return Promise.reject(err)
}
