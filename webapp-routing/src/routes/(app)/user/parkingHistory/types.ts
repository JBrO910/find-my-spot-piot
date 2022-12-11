import type { ParkingSession } from '../../../../lib/types'
import type { PageProps } from '../../../../lib/types'

export interface PageLoadProps extends PageProps {
  parkingHistory: Array<ParkingSession>
}
