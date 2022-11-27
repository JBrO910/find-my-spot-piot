export default class Spot {
    id
    garage
    localIdentifier
    x
    y
    z
    type

    constructor(garage, localIdentifier, x, y, z, type="", id) {
        this.id = id;
        this.garage = garage;
        this.localIdentifier = localIdentifier ?? id ?? "";
        this.x = x;
        this.y = y;
        this.z = z;
        this.type = type;
    }

    get serialised() {
        const data = {...this}
        if(!data.id) {
            delete data.id
        }
        return data
    }

    static fromSerialized(values) {
        const { id, garage, localIdentifier, x, y, z, type } = values
        return new Spot(garage, localIdentifier, x, y, z, type, id)
    }
}
