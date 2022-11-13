import DocumentDatabase from "../database/DocumentDatabase.js";
import Garage from "../models/Garage.js";
import User from '../models/User.js'

export default class UserController {
    static TABLE = "user"
    #database

    constructor() {
        this.#database = new DocumentDatabase();
    }

    async getAll() {
        return this.#database.getAllFrom(UserController.TABLE, User.fromSerialized)
    }

    async getSingle(id) {
        return this.#database.getSingleFrom(UserController.TABLE, id, User.fromSerialized)
    }

    async getByUsername(username) {
        return this.#database.getWhere(UserController.TABLE, "username", "==", username, User.fromSerialized).then(res => res?.[0])
    }

    async deleteSingle(id) {
        return this.#database.deleteSingleFrom(UserController.TABLE, id)
    }

    addOne(user) {
        return this.#database.addSerializable(UserController.TABLE, user.serialised)
    }

    updateOne(user) {
        return this.#database.updateSerializable(UserController.TABLE, user.id, user.serialised)
    }
}
