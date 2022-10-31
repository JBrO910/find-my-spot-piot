import type { ApiError, GarageOverview } from '../lib/types'

export interface PageLoadProps {
    garages?: Array<GarageOverview>
    error?: ApiError
}

