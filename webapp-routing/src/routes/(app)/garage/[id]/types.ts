import type { ApiError, PageProps, CombinedSpot, Garage } from '$lib/types'

export interface PageLoadProps extends PageProps {
  garage?: Garage
  spots?: Record<string, CombinedSpot>
  error?: ApiError
  socketAuth?: string
}
