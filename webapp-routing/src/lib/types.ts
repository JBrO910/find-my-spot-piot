export interface ApiError {
  message?: string
  description?: string
  code?: string
}

export type WithError<T> = { data?: T, error?: ApiError }

export interface Garage {
  id: string

  name: string
  address: string
  phoneNumber: string
  levelDescription: Array<{x: Number, y: Number}>
}

export interface GarageOverview extends Garage{
  totalSpots: number
  freeSpots: number
}

export interface Spot {
  id: string

  garage: string
  localIdentifier?: string
  x: number
  y: number
  z: number
}

export interface LiveSpot {
  id: string

  status: 0 | 1
  statusChangedAt: number
  lastKeepAlive: number
}

export type CombinedSpot = Spot & Partial<LiveSpot>
