// @ts-ignore
import { PUBLIC_API_URL } from '$env/static/public'
import axios from 'axios'
import type { Garage, GarageOverview } from './types'

const instance = axios.create({
  baseURL: PUBLIC_API_URL,
  withCredentials: false,
})

export const getGarageOverview = async (): Promise<Array<GarageOverview>> => {
  return instance.get<Array<GarageOverview>>('garage/overview')
    .then(res => res.data)
}

export const getGarage = async (id: string): Promise<Garage> => {
  return instance.get<GarageOverview>(`garage/${id}`)
    .then(res => res.data)
}
