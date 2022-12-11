import type { Actions } from '@sveltejs/kit'
import type { PageServerLoad } from '../../../../../.svelte-kit/types/src/routes/(app)/user/register/$types'
import { getParkingSessions, payParkingSession, topUpBalance } from '$lib/server/api'
import type { PageLoadProps } from './types'

export const load: PageServerLoad = async ({ locals }): Promise<PageLoadProps> => {
  const {
    data: parkingHistory,
    error,
    // @ts-ignore
  } = await getParkingSessions(locals.user.id)

  return {
    parkingHistory: parkingHistory ?? [],
    page: {
      name: 'Parking History',
      // @ts-ignore
      user: locals.user,
      error,
    },
  }
}

export const actions: Actions = {
  pay: async ({ request, locals }) => {
    const formData = await request.formData()
    // @ts-ignore
    await payParkingSession(formData.get("sessionId") as string, locals.user.id)
  },
  topUp: async ({ request, locals }) => {
    const formData = await request.formData()
    // @ts-ignore
    await topUpBalance(locals.user.id, parseInt(formData.get("amount") as string))
  },
}

