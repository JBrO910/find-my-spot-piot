import DocumentDatabase from "../database/DocumentDatabase.js";
import Garage from "../models/Garage.js";
import User from '../models/User.js'

export default class UserController {
    static TABLE = "user"
    #database

    constructor() {
        this.#database = new DocumentDatabase();
    }

    async userExists(id) {
        return this.#database.exists(UserController.TABLE, id)
    }

    async getAll() {
        return this.#database.getAllFrom(UserController.TABLE, User.fromSerialized)
    }

    async getSingle(id) {
        return this.#database.getSingleFrom(UserController.TABLE, id, User.fromSerialized)
    }

    async getByUsername(username) {
        return this.#database.getWhere(UserController.TABLE, User.fromSerialized, ["username", "==", username]).then(res => res?.[0])
    }

    async getByCard(cardID) {
        return this.#database.getWhere(UserController.TABLE, User.fromSerialized, ["cardID", "==", cardID].then(res => res?.[0]))
    }

    async getUsersToRegister() {
        return this.#database.getWhere(UserController.TABLE, User.fromSerialized, ["cardID", "==", "no-card"], ["isAdmin", "==", false])
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
