import { PUBLIC_ENVIRONMENT } from '$env/static/public'
import { login } from '$lib/server/api'
import type { Actions } from '@sveltejs/kit'
import { invalid, redirect } from '@sveltejs/kit'

export const actions: Actions = {
  login: async ({
                  request,
                  cookies,
                }) => {
    const formData = await request.formData()
    const {
      keepLoggedIn,
      ...loginData
    } = Object.fromEntries(formData.entries())

    const {
      data,
      error,
    } = await login(loginData)

    if (error) {
      return invalid(404, { error })
    }
    if (!data) {
      const error = {
        message: 'Unexpected error occurred during login',
        code: 'error',
      }
      return invalid(500, { error })
    }

    cookies.set('token', data.token, {
      path: '/',
      httpOnly: PUBLIC_ENVIRONMENT === 'dev',
      secure: PUBLIC_ENVIRONMENT !== 'dev',
      sameSite: 'strict',
    })

    throw redirect(307, '/')
  },
  logout: async ({
                   cookies,
                   locals,
                 }) => {
    cookies.set('keepLoggedIn', '', {
      maxAge: 0,
    })
    cookies.set('token', '', {
      maxAge: 0,
    })

    locals.user = undefined

    throw redirect(307, '/login')
  },
}
