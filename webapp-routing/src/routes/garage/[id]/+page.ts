import type { Load } from '@sveltejs/kit'
import { getGarage } from '../../../lib/api'

export const load: Load<{ id: string }> = async ({ params }) => {
  return {
    garage: await getGarage(params.id),
  }
}
