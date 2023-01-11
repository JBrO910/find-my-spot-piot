import { getGarage } from '$lib/server/api'
import { redirect } from '@sveltejs/kit'
import type { PageLoadProps } from './types'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({
                                             params,
                                             locals,
                                           }): Promise<PageLoadProps> => {
  if(!locals.user?.isAdmin) {
    throw redirect(307, '/')
  }
  const {
    data: garage,
    error: garageError,
  } = await getGarage(locals.axios, params.id)

  return {
    garage,
    socketAuth: locals.socketAuth,
    page: {
      name: garage?.name ? `Setup garage "${garage?.name}"` : "Garage not found",
      user: locals.user,
      error: garageError,
    },
  }
}
