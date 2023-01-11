import { PUBLIC_API_URL } from '$env/static/public'
import type { Handle } from '@sveltejs/kit'
import axios from 'axios'
import { getUser } from '$lib/server/api'

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

  const Authorization = `Bearer ${ token }`

  event.locals.axios =  axios.create({
    baseURL: PUBLIC_API_URL,
    withCredentials: false,
    headers: {
      Authorization,
    },
  })
  event.locals.socketAuth = Authorization

  const { data: user } = await getUser(event.locals.axios)
  event.locals.user = user

  return resolve(event)
}
