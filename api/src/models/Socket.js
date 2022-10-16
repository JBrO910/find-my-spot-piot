export default class Socket {
    #id
    #socketId
    #garage

    constructor(socketId, garage) {
        this.#socketId = socketId;
        this.#garage = garage;
    }

    get id() {
        return this.#id;
    }

    get socketId() {
        return this.#socketId;
    }

    set socketId(value) {
        this.#socketId = value;
    }

    get garage() {
        return this.#garage;
    }

    set garage(value) {
        this.#garage = value;
    }

    get serialised() {
        return {
            socketId: this.socketId,
            garage: this.garage
        }
    }

    get serialisedWithId() {
        return {
            id: this.id,
            socketId: this.socketId,
            garage: this.garage
        }
    }
}
