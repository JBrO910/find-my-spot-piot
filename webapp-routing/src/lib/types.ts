export interface ApiError {
  message?: string
  description?: string
  code?: string
}
export interface FieldError {
  message?: string
  field?: string
}

export interface PageProps {
  page: {
    name: string
    user?: User
    error?: ApiError
  }
}

export type WithError<T> = { data?: T, error?: ApiError }

export interface User {
  username: string,
  isAdmin: boolean,
  adminGarageId: string,
}

export interface Garage {
  id: string

  name: string
  address: string
  phoneNumber: string
  levelDescription: Array<{x: Number, y: Number}>
}

export interface GarageCreationData {
  name: string
  address: string
  phoneNumber: string

  openingHoursWorkdays?: [string, string]
  openingHoursWeekend?: [string, string]
  hourlyRate: number
  maxRate: number
  ensureUserBalance: boolean
  payOnExit: boolean
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
  type: "Normal" | "Accessible" | "Wide" | "Small" | "Family"
}

export interface LiveSpot {
  id: string

  status: 0 | 1
  isTurnedOff: boolean
  statusChangedAt: number
  lastKeepAlive: number
  hasLostConnection: boolean
  hasNotChangedWarning: boolean
}

export type CombinedSpot = Spot & Partial<LiveSpot>
