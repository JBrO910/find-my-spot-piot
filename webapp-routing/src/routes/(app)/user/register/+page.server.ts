import { getGarageOverview, getUsersToRegister, putUserCard } from '$lib/server/api'
import { invalid } from '@sveltejs/kit'
import type { Actions } from '@sveltejs/kit'
import type { PageServerLoad } from '../../../../../.svelte-kit/types/src/routes/(app)/user/register/$types'
import type { PageLoadProps } from './types'

export const load: PageServerLoad = async ({ locals }): Promise<PageLoadProps> => {
  const {
    data: users,
    error,
  } = await getUsersToRegister(locals.axios)
  const {
    data: garages,
    error: garageError,
  } = await getGarageOverview(locals.axios)

  return {
    users: users ?? [],
    garages: garages ?? [],
    page: {
      name: 'Register Cards',
      user: locals.user,
      error: error ?? garageError,
    },
  }
}

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const formData = await request.formData()
    const { error } = await putUserCard(locals.axios, {
      cardID: formData.get('cardID') as string,
      balance: Number(formData.get('balance')),
      userID: formData.get('userID') as string,
    })
    if(error) {
      console.log("Error while writing card to user", error)
      return invalid(404, { error: error.message })
    }
  },
}

