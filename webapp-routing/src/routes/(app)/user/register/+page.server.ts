import { getUsersToRegister, putUserCard } from '$lib/server/api'
import { invalid } from '@sveltejs/kit'
import type { Actions } from '@sveltejs/kit'
import type { PageServerLoad } from '../../../../../.svelte-kit/types/src/routes/(app)/user/register/$types'
import type { PageLoadProps } from './types'

export const load: PageServerLoad = async ({ locals }): Promise<PageLoadProps> => {
  const {
    data: users,
    error,
  } = await getUsersToRegister()
  return {
    users: users ?? [],
    page: {
      name: 'Register Cards',
      // @ts-ignore
      user: locals.user,
      error,
    },
  }
}

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData()
    const { error } = await putUserCard({
      cardID: formData.get('cardID') as string,
      balance: Number(formData.get('balance')),
    })
    if(error) {
      console.log("Error while writing card to user", error)
      return invalid(404, { error: error.message })
    }
  },
}

