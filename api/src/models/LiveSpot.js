export const KEEP_ALIVE_INTERVAL = 1000 * 60 * 20 // 20 Minutes
export const MAX_KEEP_ALIVE_GAP = 3 * KEEP_ALIVE_INTERVAL
export const STATUS_CHANGE_WARNING_DURATION = 1000 * 60 * 60 * 12 // 12 Hours

export default class LiveSpot {
  id
  status
  garage
  statusChangedAt
  lastKeepAlive
  isTurnedOff

  constructor(
    status,
    garage,
    id,
    statusChangedAt = new Date().getTime(),
    lastKeepAlive = new Date().getTime(),
      isTurnedOff=false
  ) {
    this.id = id
    this.status = status
    this.garage = garage
    this.statusChangedAt = statusChangedAt
    this.lastKeepAlive = lastKeepAlive
    this.isTurnedOff = isTurnedOff
  }

  get hasLostConnection() {
    return !this.isTurnedOff && new Date().getTime() - this.lastKeepAlive > MAX_KEEP_ALIVE_GAP
  }

  get hasNotChangedWarning() {
    return !this.isTurnedOff && new Date().getTime() - this.statusChangedAt > STATUS_CHANGE_WARNING_DURATION
  }

  get serialised() {
    return {
      ...this,
      hasLostConnection: this.hasLostConnection,
      hasNotChangedWarning: this.hasNotChangedWarning,
    }
  }

  static fromSerialized({ status, garage, id, statusChangedAt, lastKeepAlive, isTurnedOff }) {
    return new LiveSpot(status, garage, id, statusChangedAt, lastKeepAlive, isTurnedOff)
  }
}
