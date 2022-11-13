import type { PageServerLoad } from '../../../../../.svelte-kit/types/src/routes/(app)/$types'
import { getGarage, getGarageSpots } from '../../../../lib/server/api'
import type { PageLoadProps } from './types'

export const load: PageServerLoad = async ({
                                             params,
                                             locals,
                                           }): Promise<PageLoadProps> => {
  const {
    data: garage,
    error: garageError,
    // @ts-ignore
  } = await getGarage(params.id)
  const {
    data: spots,
    error: spotError,
  } = await getGarageSpots(garage?.id)

  return {
    garage,
    spots,
    page: {
      name: garage?.name ?? "",
      // @ts-ignore
      user: locals.user,
      error: garageError ?? spotError,
    },
  }
}
