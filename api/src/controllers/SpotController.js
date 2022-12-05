import DocumentDatabase from "../database/DocumentDatabase.js";
import Spot from '../models/Spot.js'

export default class SpotController {
    static TABLE = "spot"
    #database

    constructor() {
        this.#database = new DocumentDatabase();
    }

    async getAll() {
        return this.#database.getAllFrom(SpotController.TABLE, Spot.fromSerialized)
    }

    setSpot(spot) {
        return this.#database.setSerializable(SpotController.TABLE, `${spot.garage}-${spot.id}`, spot.serialised)
    }

    async getSpot(garageId, spotId) {
        return this.#database.getSingleFrom(SpotController.TABLE, `${garageId}-${spotId}`, Spot.fromSerialized)
    }

    async getAllForGarage(garageId) {
        return this.#database.getWhere(SpotController.TABLE, Spot.fromSerialized, ["garage", "==", garageId])
    }

    async deleteForGarage(garageId) {
        return this.#database.deleteWhere(SpotController.TABLE, "garage", "==", garageId)
    }
}
