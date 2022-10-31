import { getGarage, getGarageSpots } from '$lib/api'
import type { PageLoad } from './$types'
import type { PageLoadProps } from './types'

export const load: PageLoad = async ({ params }): Promise<PageLoadProps> => {
  const {
    data: garage,
    error: garageError,
  } = await getGarage(params.id)
  const {
    data: spots,
    error: spotError,
  } = await getGarageSpots(garage?.id)

  return {
    garage,
    spots,
    error: garageError ?? spotError,
  }
}
