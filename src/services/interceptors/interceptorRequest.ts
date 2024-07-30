import type { AxiosError, InternalAxiosRequestConfig } from 'axios'

interface customAxiosRequestConfig extends InternalAxiosRequestConfig {
  headers: any
}

export const interceptorRequest = async (config: customAxiosRequestConfig) => {
  const token = localStorage.getItem("token");
  config.headers = {
    Authorization: `Bearer ${token}`,
  }
  return config
}

export const interceptorRequestError = (err: AxiosError) => {
  console.error(err)
  return Promise.reject(err)
}
