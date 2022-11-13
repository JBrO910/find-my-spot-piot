import { invalid, redirect } from '@sveltejs/kit'
import type { Actions } from '@sveltejs/kit'
import { addGarage } from '$lib/server/api'

export const load = () => {
  return {
    page: {
      name: "Register Garage"
    }
  }
}


export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData()
    const garageData = Object.fromEntries(formData.entries())

    const {data, error} = await addGarage(garageData)

    if(error) {
      return invalid(404, { error })
    }
    if(!data) {
      const error = {message: "Unexpected error occurred during garage registration", code: "error"}
      return invalid(500, {error})
    }

    throw redirect(307, `/garage/${data}/setup`)
  }
}
