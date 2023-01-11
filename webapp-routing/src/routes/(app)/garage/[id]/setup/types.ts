import type { ApiError, PageProps, Garage } from '$lib/types'

export interface PageLoadProps extends PageProps {
  garage?: Garage
  error?: ApiError
  socketAuth?: string
}
