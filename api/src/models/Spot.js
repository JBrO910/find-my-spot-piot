export default class Spot {
    id
    garage
    localIdentifier

    constructor(garage, localIdentifier, id) {
        this.id = id;
        this.garage = garage;
        this.localIdentifier = localIdentifier;
    }

    get serialised() {
        return {...this}
    }

    static fromSerialized({ id, garage, localIdentifier }) {
        return new Spot(garage, localIdentifier, id)
    }
}
