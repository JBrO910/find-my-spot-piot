import type { PageServerLoad } from '../../../../../../.svelte-kit/types/src/routes/(app)/$types'
import { getGarage } from '$lib/server/api'
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

  return {
    garage,
    page: {
      name: garage?.name ? `Setup garage "${garage?.name}"` : "Garage not found",
      // @ts-ignore
      user: locals.user,
      error: garageError,
    },
  }
}
