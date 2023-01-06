import { getGarage } from '$lib/server/api'
import type { PageLoadProps } from './types'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({
                                             params,
                                             locals,
                                           }): Promise<PageLoadProps> => {
  const {
    data: garage,
    error: garageError,
  } = await getGarage(locals.axios, params.id)

  return {
    garage,
    page: {
      name: garage?.name ? `Setup garage "${garage?.name}"` : "Garage not found",
      user: locals.user,
      error: garageError,
    },
  }
}
