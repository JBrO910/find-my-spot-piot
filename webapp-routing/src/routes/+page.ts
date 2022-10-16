import type { Load } from '@sveltejs/kit'
import { getGarageOverview } from '../lib/api'

export const load: Load = async () => {
  return {
    garages: await getGarageOverview()
  };
}

