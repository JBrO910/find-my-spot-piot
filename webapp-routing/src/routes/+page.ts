import { getGarageOverview } from '$lib/api'
import type { PageLoad } from './$types'
import type { PageLoadProps } from './types'

export const load: PageLoad = async (): Promise<PageLoadProps> => {
  const {
    data: garages,
    error,
  } = await getGarageOverview()

  return {
    garages,
    error,
  }
}

