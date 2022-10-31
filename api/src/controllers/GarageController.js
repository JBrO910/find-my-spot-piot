import DocumentDatabase from "../database/DocumentDatabase.js";
import Garage from "../models/Garage.js";

export default class GarageController {
    static TABLE = "garage"
    #database

    constructor() {
        this.#database = new DocumentDatabase();
    }

    async getAll() {
        return this.#database.getAllFrom(GarageController.TABLE, Garage.fromSerialized)
    }

    async getSingle(id) {
        return this.#database.getSingleFrom(GarageController.TABLE, id, Garage.fromSerialized)
    }

    async deleteSingle(id) {
        return this.#database.deleteSingleFrom(GarageController.TABLE, id)
    }

    addOne(garage) {
        return this.#database.addSerializable(GarageController.TABLE, garage.serialised)
    }

    updateOne(garage) {
        return this.#database.updateSerializable(GarageController.TABLE, garage.id, garage.serialised)
    }
}
