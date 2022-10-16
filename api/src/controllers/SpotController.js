import DocumentDatabase from "../database/DocumentDatabase.js";
import Garage from "../models/Garage.js";
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
}
