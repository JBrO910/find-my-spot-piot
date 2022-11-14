import { invalid, redirect } from '@sveltejs/kit'
import type { Actions } from '@sveltejs/kit'
import { login, setTokenOnAxios } from '../../../lib/server/api'

export const actions: Actions = {
  login: async ({ request, cookies, locals }) => {
    const formData = await request.formData()
    const { keepLoggedIn, ...loginData } = Object.fromEntries(formData.entries())

    const {
      data,
      error,
    } = await login(loginData)

    if(error) {
      return invalid(404, { error })
    }
    if(!data) {
      const error = {message: "Unexpected error occurred during login", code: "error"}
      return invalid(500, {error})
    }

    cookies.set("keepLoggedIn", keepLoggedIn as string, {
      path: "/",
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    })
    // TODO Refresh token if necessary
    // TODO In production remove secure: false
    cookies.set("token", data.token, {
      path: "/",
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    })

    // @ts-ignore
    locals.user = data.user
    setTokenOnAxios(data.token)

    throw redirect(307, "/")
  },
  logout: async ({ cookies, locals }) => {
    cookies.set("keepLoggedIn", "", {
      maxAge: 0
    })
    cookies.set("token", "", {
      maxAge: 0
    })

    // @ts-ignore
    locals.user = undefined
    setTokenOnAxios("")

    throw redirect(307, "/login")
  }
}
