import type { Actions } from '@sveltejs/kit'
import { invalid, redirect } from '@sveltejs/kit'
import { register } from '../../../lib/server/api'

export const actions: Actions = {
  register: async ({ request }) => {
    const formData = await request.formData()
    const {
      passwordRepeat,
      ...registerData
    } = Object.fromEntries(formData.entries())

    if (passwordRepeat !== registerData.password) {
      return invalid(400, {
        error: {
          field: 'passwordRepeat',
          message: 'Passwords do not match',
        },
      })
    }

    const {
      error,
    } = await register(registerData)

    if (!!error) {
      return invalid(400, { error })
    }

    throw redirect(307, '/login')
  },
}
