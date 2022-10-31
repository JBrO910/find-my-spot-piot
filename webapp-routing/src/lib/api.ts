// @ts-ignore
import { PUBLIC_API_URL } from '$env/static/public'
import type { AxiosError, AxiosResponse } from 'axios'
import axios from 'axios'
import type { ApiError, CombinedSpot, Garage, GarageOverview, WithError } from './types'

const instance = axios.create({
  baseURL: PUBLIC_API_URL,
  withCredentials: false,
})

const handleError = (axiosError: AxiosError): WithError<any> => {
  let error = {
    message: axiosError.message,
    code: axiosError.code,
  } as ApiError

  if (!axiosError.response) {
    error.message = 'API is not reachable'
    error.description = 'Please check your internet connection'
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

// TODO Error message

export const getGarageOverview = async (): Promise<WithError<Array<GarageOverview>>> => {
  return await instance.get<Array<GarageOverview>>('garage/overview')
    .then(handleResponse)
    .catch(handleError)
}

export const getGarage = async (id: string): Promise<WithError<Garage | undefined>> => {
  return await instance.get<Garage>(`garage/${ id }`)
    .then(handleResponse)
    .catch(handleError)
}

export const getGarageSpots = async (id?: string): Promise<WithError<Record<string, CombinedSpot> | undefined>> => {
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
