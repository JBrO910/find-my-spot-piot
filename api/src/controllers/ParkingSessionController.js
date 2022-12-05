import DocumentDatabase from "../database/DocumentDatabase.js";
import Garage from "../models/Garage.js";
import ParkingSession from '../models/ParkingSession.js'
import User from '../models/User.js'

export default class ParkingSessionController {
    static TABLE = "parking-session"
    #database

    constructor() {
        this.#database = new DocumentDatabase();
    }

    async getOpenSession(id, garageId) {
        return this.#database.getWhere(ParkingSessionController.TABLE, ParkingSession.fromSerialized,
            ["userId", "==", id],
            ["garageId", "==", garageId],
            ["status", "==", "open"]
        ).then(res => res)
    }

    async getAll() {
        return this.#database.getAllFrom(ParkingSessionController.TABLE, ParkingSession.fromSerialized)
    }

    async getSingle(id) {
        return this.#database.getSingleFrom(ParkingSessionController.TABLE, id, ParkingSession.fromSerialized)
    }

    async deleteSingle(id) {
        return this.#database.deleteSingleFrom(ParkingSessionController.TABLE, id)
    }

    addOne(parkingSession) {
        return this.#database.addSerializable(ParkingSessionController.TABLE, parkingSession.serialised)
    }

    updateOne(parkingSession) {
        return this.#database.updateSerializable(ParkingSessionController.TABLE, parkingSession.id, parkingSession.serialised)
    }
}
