import RealtimeDatabase from '../database/RealtimeDatabase.js'
import LiveSpot from '../models/LiveSpot.js'

export default class LiveSpotController {
  #database

  constructor() {
    this.#database = new RealtimeDatabase()
  }

  async #mapGarage(garage, values) {
    if(!values || !garage) return []

    return await Promise.all(
      Object.entries(values).map(async ([key, value]) => ({
        id: key,
        garage,
        ...value,
      })),
    ).then((res) => res.map(LiveSpot.fromSerialized))
  }

  getSpotId(garage, key) {
    return `${garage}/${key}`
  }

  onStatusChangeRaw(garage, spotCallback) {
    return this.#database.subscribeTo(garage, (res) => spotCallback(res.val()))
  }

  onStatusChange(garage, spotCallback) {
    return this.onStatusChangeRaw(
      garage,
      async (values) =>
        values && spotCallback(await this.#mapGarage(garage, values)),
    )
  }

  setLiveSpot(liveSpot) {
    return this.#database.setSerializable(
        this.getSpotId(liveSpot.garage, liveSpot.id),
      liveSpot.serialised,
    )
  }

  setLiveSpotStatus(garage, id, value) {
    return this.#database.updateSerializable(this.getSpotId(garage, id), {
      status: value,
      statusChangedAt: new Date().getTime(),
    })
  }

  keepAlive(garage, id) {
    return this.#database.updateSerializable(this.getSpotId(garage, id), {
      lastKeepAlive: new Date().getTime(),
    })
  }

  async getGarageSpotsOnce(garageId) {
    return this.#database
      .getOnce(garageId)
      .then((res) => res.val())
      .then(async (garage) => await this.#mapGarage(garageId, garage))
  }

  async removeForGarage(garageId) {
    return this.#database
      .removeOnce(garageId)
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
