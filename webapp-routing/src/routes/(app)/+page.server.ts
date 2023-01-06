import type { PageServerLoad } from '../../../.svelte-kit/types/src/routes/(app)/$types'
import { getGarageOverview } from '../../lib/server/api'
import type { PageLoadProps } from './types'

export const load: PageServerLoad = async ({locals}): Promise<PageLoadProps> => {
  const {
    data: garages,
    error,
  } = await getGarageOverview(locals.axios)

  return {
    garages,
    page: {
      name: "Overview",
      user: locals.user,
      error,
    }
  }
}

