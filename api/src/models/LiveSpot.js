export const KEEP_ALIVE_INTERVAL = 1000 * 60 * 20 // 20 Minutes
export const MAX_KEEP_ALIVE_GAP = 3 * KEEP_ALIVE_INTERVAL

export default class LiveSpot {
  id
  garage
  status
  statusChangedAt
  lastKeepAlive

  constructor(
    garage,
    status,
    id,
    statusChangedAt = new Date().getTime(),
    lastKeepAlive = new Date().getTime(),
  ) {
    this.id = id
    this.garage = garage
    this.status = status
    this.statusChangedAt = statusChangedAt
    this.lastKeepAlive = lastKeepAlive
  }

  get isFree() {
    const isStatusFree = this.status > 0
    const isAlive =
      new Date().getTime() - this.lastKeepAlive > MAX_KEEP_ALIVE_GAP
    return isStatusFree && isAlive
  }

  get serialised() {
    return {
      garage: this.garage,
      status: this.status,
      isFree: this.isFree,
      statusChangedAt: this.statusChangedAt,
      lastKeepAlive: this.lastKeepAlive,
    }
  }

  static fromSerialized({ garage, status, id, statusChangedAt, lastKeepAlive }) {
    return new LiveSpot(garage, status, id, statusChangedAt, lastKeepAlive)
  }
}
