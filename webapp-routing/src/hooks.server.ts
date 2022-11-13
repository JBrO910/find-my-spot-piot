import type { Handle } from '@sveltejs/kit'
import { getUser, setTokenOnAxios } from './lib/server/api'

export const handle: Handle = async ({
                                       event,
                                       resolve,
                                     }) => {
  const token = event.cookies.get('token')
  const isAuthenticationPage = ['(auth)/login', '(auth)/register'].includes(event.routeId ?? "")

  if (!token && !isAuthenticationPage) {
    return new Response(
      'Redirect', {
        status: 307,
        headers: { Location: '/login' },
      })
  }

  // This is not really secure and so on... but I know not to use it
  if (!!event.cookies.get('keepLoggedIn') && !!token) {
    const { data: user } = await getUser()
    // @ts-ignore
    event.locals.user = user
    setTokenOnAxios(token)
  }

  return resolve(event)
}
