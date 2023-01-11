import { addGarage } from '$lib/server/api'
import type { GarageCreationData } from '$lib/types'
import type { Actions } from '@sveltejs/kit'
import { invalid, redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = ({locals}) => {
  if(!locals.user?.isAdmin) {
    throw redirect(307, '/')
  }
  return {
    page: {
      name: 'Register Garage',
    },
  }
}

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const formData = await request.formData()

    const garageData: GarageCreationData = {
      address: formData.get("address") as string,
      ensureUserBalance: formData.get("ensureUserBalance") === "on",
      hourlyRate: parseFloat(formData.get("hourlyRate") as string),
      maxRate: parseFloat(formData.get("maxRate") as string),
      name: formData.get("name") as string,
      openingHoursWeekend: formData.get("isOpen24HoursWeekends") !== "on" ? [(formData.get("openFromWeekends") as string), (formData.get("openToWeekends") as string)] : undefined,
      openingHoursWorkdays: formData.get("isOpen24HoursWorkdays") !== "on" ? [(formData.get("openFromWorkdays") as string), (formData.get("openToWorkdays") as string)] : undefined,
      payOnExit: formData.get("payOnExit") === "on",
      phoneNumber: formData.get("phoneNumber") as string,
      sleepTime: parseFloat(formData.get("sleepTime") as string)
    }

    if ((garageData.openingHoursWorkdays && garageData.openingHoursWorkdays[0] >= garageData.openingHoursWorkdays[1]) ||
      (garageData.openingHoursWeekend && garageData.openingHoursWeekend[0] >= garageData.openingHoursWeekend[1])) {
      const error = {
        message: 'Opening hours must be valid',
        code: 'error',
      }
      return invalid(404, { error })
    }
    if (garageData.hourlyRate > garageData.maxRate) {
      const error = {
        message: 'Hourly rate must be lower than max rate',
        code: 'error',
      }
      return invalid(404, { error })
    }
    if (garageData.hourlyRate < 0 || garageData.maxRate < 0) {
      const error = {
        message: 'Hourly rate and max rate must be positive numbers',
        code: 'error',
      }
      return invalid(404, { error })
    }
    if (garageData.sleepTime <= 0) {
      const error = {
        message: 'Sleep time must be a positive number',
        code: 'error',
      }
      return invalid(404, { error })
    }

    const {
      data,
      error,
    } = await addGarage(locals.axios, garageData)

    if (error) {
      return invalid(404, { error })
    }
    if (!data) {
      const error = {
        message: 'Unexpected error occurred during garage registration',
        code: 'error',
      }
      return invalid(500, { error })
    }

    console.log("Garage was created with the following environment\n\n", `GARAGE_ID=${data.id}\n`, `API_KEY=${data.apiKey}\n\n`)

    throw redirect(307, `/garage/${ data.id }/setup`)
  },
}
