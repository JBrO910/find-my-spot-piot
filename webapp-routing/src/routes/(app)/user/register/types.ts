import type { Garage, PageProps, User } from '$lib/types'

export interface PageLoadProps extends PageProps {
  users: Array<User>
  garages: Array<Garage>
  socketAuth?: string
}
