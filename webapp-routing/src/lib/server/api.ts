// @ts-ignore
import { PUBLIC_API_URL } from '$env/static/public'
import axios from 'axios'
import type { AxiosError, AxiosInstance, AxiosResponse } from 'axios'
import type { GarageCreationData } from '../types'
import type { ApiError, CombinedSpot, Garage, GarageOverview, User, WithError } from '../types'

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

export const getGarageOverview = async (instance: AxiosInstance): Promise<WithError<Array<GarageOverview>>> => {
  return await instance.get<Array<GarageOverview>>('garage/overview')
    .then(handleResponse)
    .catch(handleError)
}

export const getGarage = async (instance: AxiosInstance, id: string):Response<Garage> => {
  return await instance.get<Garage>(`garage/${ id }`)
    .then(handleResponse)
    .catch(handleError)
}

export const getGarageSpots = async (instance: AxiosInstance, id?: string): Response<Record<string, CombinedSpot>> => {
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

export const addGarage = async (instance: AxiosInstance, garageData: GarageCreationData): Response<{ id: string, apiKey: string }> => {
  if (!garageData) {
    return {
      data: undefined,
      error: { message: 'No garage data was provided' },
    }
  }

  return await instance.post<{ id: string, apiKey: string }>(`garage`, garageData)
    .then(handleResponse)
    .catch(handleError)
}

export const updateGarage = async (instance: AxiosInstance, id: string, garageData: Omit<GarageCreationData, "name" | "address" | "phoneNumber">): Response<string> => {
  if (!garageData) {
    return {
      data: undefined,
      error: { message: 'No garage data was provided' },
    }
  }

  return await instance.put<string>(`garage/${id}`, garageData)
    .then(handleResponse)
    .catch(handleError)
}

export const login = async (loginData: any): Response<{ token: string, user: User }> => {
  if (!loginData) {
    return {
      data: undefined,
      error: { message: 'No login data was provided' },
    }
  }
  const instance = axios.create({
    baseURL: PUBLIC_API_URL,
    withCredentials: false,
  })

  return await instance.post<{ token: string, user: User }>(`auth/login`, loginData)
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
  const instance = axios.create({
    baseURL: PUBLIC_API_URL,
    withCredentials: false,
  })

  return await instance.post<{ token: string }>(`auth/register`, registerData)
    .then(handleResponse)
    .catch(handleError)
}

export const getUser = async (instance: AxiosInstance): Response<User> => {
  return await instance.get<User>('auth/me')
    .then(handleResponse)
    .catch(handleError)
}

export const getUsersToRegister = async (instance: AxiosInstance): Response<Array<User>> => {
  return await instance.get<Array<User>>('user/toRegister')
    .then(handleResponse)
    .catch(handleError)
}

export const putUserCard = async (instance: AxiosInstance, { userID, ...data }: {userID: string, cardID: string, balance: number}): Response<void> => {
  return await instance.put<void>('user/' + userID, data)
    .then(handleResponse)
    .catch(handleError)
}

export const getParkingSessions = async (instance: AxiosInstance, userId: string): Response<Array<any>> => {
  return await instance.get<Array<any>>("parkingSession/history/" + userId)
    .then(handleResponse)
    .catch(handleError)
}

export const payParkingSession = async (instance: AxiosInstance, sessionId: string, userId: string): Response<void> => {
  return await instance.post<void>("parkingSession/pay/" + sessionId + "/user/" + userId)
    .then(handleResponse)
    .catch(handleError)
}

export const topUpBalance = async (instance: AxiosInstance, userId: string, amount: number): Response<void> => {
  return await instance.post<void>("user/topUp/" + userId, { amount })
    .then(handleResponse)
    .catch(handleError)
}
