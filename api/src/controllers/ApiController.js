import DocumentDatabase from "../database/DocumentDatabase.js";
import ApiKey from '../models/ApiKey.js'
import Garage from "../models/Garage.js";

export default class ApiController {
    static TABLE = "api_keys"
    #database

    constructor() {
        this.#database = new DocumentDatabase();
    }

    async get(token) {
        return this.#database.getWhere(ApiController.TABLE, ApiKey.fromSerialized, ["key", "==", token]).then(res => res?.[0])
    }

    async add(apiKey) {
        return this.#database.addSerializable(ApiController.TABLE, apiKey.serialised)
    }
}
