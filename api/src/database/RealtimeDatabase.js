import {getRealtimeDatabase} from './firebaseClient.js'
import {child, push, update, set, remove, get, ref, onValue} from 'firebase/database'

export default class RealtimeDatabase {
    constructor() {
        this.realtimeDatabase = getRealtimeDatabase()
    }
    async addSerializable(table, element) {
        return push(child(ref(this.realtimeDatabase), table), element)
    }

    async setSerializable(id, element) {
        return await set(ref(this.realtimeDatabase, id), element)
    }

    async updateSerializable(id, element) {
        return await update(ref(this.realtimeDatabase, id), element)
    }

    async getAllOnce() {
        return await get(ref(this.realtimeDatabase))
    }

    async getOnce(id) {
        return await get(ref(this.realtimeDatabase, id))
    }

    async removeOnce(id) {
        return await remove(ref(this.realtimeDatabase, id))
    }

    subscribeTo(id, listener) {
        onValue(ref(this.realtimeDatabase, id), listener)
    }
}
