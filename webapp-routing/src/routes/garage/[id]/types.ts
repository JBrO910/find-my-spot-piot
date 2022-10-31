import type { ApiError, CombinedSpot, Garage } from '$lib/types'

export interface PageLoadProps {
  garage?: Garage
  spots?: Record<string, CombinedSpot>
  error?: ApiError
}
