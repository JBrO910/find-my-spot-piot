export interface Garage {
  id: string

  name: string
  address: string
  phoneNumber: string
}

export interface GarageOverview extends Garage{
  totalSpots: number
  freeSpots: number
}

export interface Spot {
  id: string

  garage: string
  status: 0 | 1
  statusChangedAt: number
  lastKeepAlive: number
}
