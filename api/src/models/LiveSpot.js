export const KEEP_ALIVE_INTERVAL = 1000 * 60 * 20 // 20 Minutes
export const MAX_KEEP_ALIVE_GAP = 3 * KEEP_ALIVE_INTERVAL

export default class LiveSpot {
  id
  status
  statusChangedAt
  lastKeepAlive

  constructor(
    status,
    id,
    statusChangedAt = new Date().getTime(),
    lastKeepAlive = new Date().getTime(),
  ) {
    this.id = id
    this.status = status
    this.statusChangedAt = statusChangedAt
    this.lastKeepAlive = lastKeepAlive
  }

  get isFree() {
    const isStatusFree = this.status > 0
    const isAlive =
      new Date().getTime() - this.lastKeepAlive < MAX_KEEP_ALIVE_GAP
    return isStatusFree && isAlive
  }

  get serialised() {
    return {
      status: this.status,
      statusChangedAt: this.statusChangedAt,
      lastKeepAlive: this.lastKeepAlive,
    }
  }

  static fromSerialized({ status, id, statusChangedAt, lastKeepAlive }) {
    return new LiveSpot(status, id, statusChangedAt, lastKeepAlive)
  }
}
