import type { PageProps, User } from '../../../../lib/types'

export interface PageLoadProps extends PageProps {
  users: Array<User>
}
