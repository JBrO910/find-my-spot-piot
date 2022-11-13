export const KEEP_ALIVE_INTERVAL = 1000 * 60 * 20 // 20 Minutes
export const MAX_KEEP_ALIVE_GAP = 3 * KEEP_ALIVE_INTERVAL
export const STATUS_CHANGE_WARNING_DURATION = 1000 * 60 * 60 * 12 // 12 Hours

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

  get hasLostConnection() {
    return new Date().getTime() - this.lastKeepAlive > MAX_KEEP_ALIVE_GAP
  }

  get hasNotChangedWarning() {
    return new Date().getTime() - this.statusChangedAt > STATUS_CHANGE_WARNING_DURATION
  }

  get serialised() {
    return {
      id: this.id,
      status: this.status,
      hasLostConnection: this.hasLostConnection,
      hasNotChangedWarning: this.hasNotChangedWarning,
      statusChangedAt: this.statusChangedAt,
      lastKeepAlive: this.lastKeepAlive,
    }
  }

  static fromSerialized({ status, id, statusChangedAt, lastKeepAlive }) {
    return new LiveSpot(status, id, statusChangedAt, lastKeepAlive)
  }
}
