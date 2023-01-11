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
  } = await getGarage(locals.axios, params.id)
  const {
    data: spots,
    error: spotError,
  } = await getGarageSpots(locals.axios, garage?.id)

  return {
    garage,
    spots,
    socketAuth: locals.socketAuth,
    page: {
      name: garage?.name ?? "",
      user: locals.user,
      error: garageError ?? spotError,
    },
  }
}
