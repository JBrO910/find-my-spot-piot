import RealtimeDatabase from '../database/RealtimeDatabase.js'
import LiveSpot from '../models/LiveSpot.js'

export default class LiveSpotController {
  #database

  constructor() {
    this.#database = new RealtimeDatabase()
  }

  onStatusChangeRaw(garage, spotCallback) {
    return this.#database.subscribeTo(garage, (res) => spotCallback(res.val()))
  }

  onStatusChange(garage, spotCallback) {
    return this.onStatusChangeRaw(
      garage,
      (values) =>
        values &&
        spotCallback(
          Object.entries(values)
            .map(([key, value]) => ({ id: key, ...value }))
            .map(LiveSpot.fromSerialized),
        ),
    )
  }

  setLiveSpot(liveSpot) {
    return this.#database.setSerializable(
      `${liveSpot.garage}/${liveSpot.id}`,
      liveSpot.serialised,
    )
  }

  setLiveSpotStatus(garage, id, value) {
    return this.#database.updateSerializable(`${garage}/${id}`, {
      status: value,
      statusChangedAt: new Date().getTime(),
    })
  }

  keepAlive(garage, id) {
    return this.#database.updateSerializable(`${garage}/${id}`, {
      lastKeepAlive: new Date().getTime(),
    })
  }

  getGarageSpotsOnce(garageId) {
    return this.#database
      .getOnce(garageId)
      .then((res) => res.val())
      .then(
        (garage) =>
          garage &&
          Object.entries(garage)
            .map(([key, value]) => ({ id: key, ...value }))
            .map(LiveSpot.fromSerialized),
      )
  }

  getAllOnce() {
    return this.#database
      .getAllOnce()
      .then((res) => res.val())
      .then((db) =>
        Object.fromEntries(
          Object.entries(db).map(([key, values]) => [
            key,
            Object.values(values).map(LiveSpot.fromSerialized),
          ]),
        ),
      )
  }
}
