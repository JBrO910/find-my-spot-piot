import type { ApiError,PageProps, GarageOverview, User } from '../../lib/types'

export interface PageLoadProps extends PageProps{
    garages?: Array<GarageOverview>
    error?: ApiError
    user?: User
}

