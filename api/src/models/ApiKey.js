export default class ApiKey {
    id
    key
    garage

    constructor(key, garage, id) {
        this.key = key
        this.garage = garage
        this.id = id
    }

    get serialised() {
        const data = {...this}
        if (!data.id) {
            delete data.id
        }
        return data
    }

    static fromSerialized({
        id,
        garage,
        key,
    }) {
        return new ApiKey(
            key, garage, id
        )
    }
}
