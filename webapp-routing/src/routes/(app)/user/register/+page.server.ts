import type { PageServerLoad } from '../../../../../.svelte-kit/types/src/routes/(app)/user/register/$types'
import { getUsersToRegister } from '../../../../lib/server/api'
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

