import type { Actions } from '@sveltejs/kit'
import type { PageServerLoad } from '../../../../../.svelte-kit/types/src/routes/(app)/user/register/$types'
import { getParkingSessions, payParkingSession, topUpBalance } from '$lib/server/api'
import type { PageLoadProps } from './types'

export const load: PageServerLoad = async ({ locals }): Promise<PageLoadProps> => {
  const {
    data: parkingHistory,
    error,
  } = await getParkingSessions(locals.axios, locals.user?.id ?? "")

  return {
    parkingHistory: parkingHistory ?? [],
    page: {
      name: 'Parking History',
      user: locals.user,
      error,
    },
  }
}

export const actions: Actions = {
  pay: async ({ request, locals }) => {
    const formData = await request.formData()
    await payParkingSession(locals.axios, formData.get("sessionId") as string, locals.user?.id ?? "")
  },
  topUp: async ({ request, locals }) => {
    const formData = await request.formData()
    await topUpBalance(locals.axios, locals.user?.id ?? "", parseInt(formData.get("amount") as string))
  },
}

