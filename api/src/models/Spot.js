export default class Spot {
    id
    garage
    localIdentifier
    x
    y
    z

    constructor(garage, localIdentifier, x, y, z, id) {
        this.id = id;
        this.garage = garage;
        this.localIdentifier = localIdentifier ?? id ?? "";
        this.x = x;
        this.y = y;
        this.z = z;
    }

    get serialised() {
        return {...this}
    }

    static fromSerialized(values) {
        const { id, garage, localIdentifier, x, y, z } = values
        return new Spot(garage, localIdentifier, x, y, z, id)
    }
}
