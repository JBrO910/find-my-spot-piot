import type { Actions } from '@sveltejs/kit'
import type { PageServerLoad } from '../../../../../.svelte-kit/types/src/routes/(app)/user/register/$types'
import { getUsersToRegister } from '$lib/server/api'
import type { PageLoadProps } from './types'

export const load: PageServerLoad = async ({locals}): Promise<PageLoadProps> => {
  const { data: users, error } = await getUsersToRegister()
  return {
    users: users ?? [],
    page: {
      name: "Register Cards",
      // @ts-ignore
      user: locals.user,
      error
    }
  }
}

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData()
    const data = Object.fromEntries(formData.entries())
    console.log({data})
    // const {data, error} = await addGarage(garageData)
    //
    // if(error) {
    //   return invalid(404, { error })
    // }
    // if(!data) {
    //   const error = {message: "Unexpected error occurred during garage registration", code: "error"}
    //   return invalid(500, {error})
    // }
    //
    // throw redirect(307, `/garage/${data}/setup`)
  }
}

