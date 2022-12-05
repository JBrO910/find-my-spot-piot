// @ts-ignore
import { PUBLIC_API_URL } from '$env/static/public'
import type { AxiosError, AxiosResponse } from 'axios'
import axios from 'axios'
import type { ApiError, CombinedSpot, Garage, GarageOverview, User, WithError } from '../types'

let instance = axios.create({
  baseURL: PUBLIC_API_URL,
  withCredentials: false,
})

export const setTokenOnAxios = (token: string) => {
  instance = axios.create({
    baseURL: PUBLIC_API_URL,
    withCredentials: false,
    headers: {
      Authorization: `Bearer ${ token }`,
    },
  })
}

const handleError = (axiosError: AxiosError): WithError<any> => {
  let error = {
    // @ts-ignore
    message: axiosError.response?.data?.message ?? axiosError.message,
    // @ts-ignore
    field: axiosError.response?.data?.field,
    code: axiosError.code,
  } as ApiError

  if (!axiosError.response) {
    error.message = 'API is not reachable'
    error.description = 'Please check your internet connection'
  }

  if(axiosError.response?.status === 401) {
    error.message = 'Unauthorized'
    error.description = 'Please log in to view the data'
  }

  return {
    data: undefined,
    error,
  }
}

const handleResponse = <T>({ data }: AxiosResponse<T>) => {
  return {
    data,
    error: undefined,
  }
}

type Response<T> = Promise<WithError<T | undefined>>

// TODO Error message

export const getGarageOverview = async (): Promise<WithError<Array<GarageOverview>>> => {
  return await instance.get<Array<GarageOverview>>('garage/overview')
    .then(handleResponse)
    .catch(handleError)
}

export const getGarage = async (id: string):Response<Garage> => {
  return await instance.get<Garage>(`garage/${ id }`)
    .then(handleResponse)
    .catch(handleError)
}

export const getGarageSpots = async (id?: string): Response<Record<string, CombinedSpot>> => {
  if (!id) {
    return {
      data: undefined,
      error: { message: 'Invalid id was provided' },
    }
  }

  return await instance.get<Record<string, CombinedSpot>>(`garage/${ id }/spots`)
    .then(handleResponse)
    .catch(handleError)
}

export const addGarage = async (garageData: any): Response<string> => {
  if (!garageData) {
    return {
      data: undefined,
      error: { message: 'No garage data was provided' },
    }
  }

  return await instance.post<string>(`garage`, garageData)
    .then(handleResponse)
    .catch(handleError)
}

export const login = async (loginData: any): Response<{ token: string }> => {
  if (!loginData) {
    return {
      data: undefined,
      error: { message: 'No login data was provided' },
    }
  }

  return await instance.post<{ token: string }>(`auth/login`, loginData)
    .then(handleResponse)
    .catch(handleError)
}

export const register = async (registerData: any): Response<{ token: string }> => {
  if (!registerData) {
    return {
      data: undefined,
      error: { message: 'No register data was provided' },
    }
  }

  return await instance.post<{ token: string }>(`auth/register`, registerData)
    .then(handleResponse)
    .catch(handleError)
}

export const getUser = async (): Response<User> => {
  return await instance.get<User>('auth/me')
    .then(handleResponse)
    .catch(handleError)
}

export const getUsersToRegister = async (): Response<Array<User>> => {
  return await instance.get<Array<User>>('user/toRegister')
    .then(handleResponse)
    .catch(handleError)
}

export const putUserCard = async ({ userID, ...data }: {userID: string, cardID: string, balance: number}): Response<void> => {
  return await instance.put<void>('user/' + userID, data)
    .then(handleResponse)
    .catch(handleError)
}
