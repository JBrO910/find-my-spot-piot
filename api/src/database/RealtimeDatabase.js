import {realtimeDatabase} from './firebaseClient.js'
import {child, push, update, set, get, ref, onValue} from 'firebase/database'

export default class RealtimeDatabase {
    async addSerializable(table, element) {
        return push(child(ref(realtimeDatabase), table), element)
    }

    async setSerializable(id, element) {
        return await set(ref(realtimeDatabase, id), element)
    }

    async updateSerializable(id, element) {
        return await update(ref(realtimeDatabase, id), element)
    }

    async getAllOnce() {
        return await get(ref(realtimeDatabase))
    }

    async getOnce(id) {
        return await get(ref(realtimeDatabase, id))
    }

    subscribeTo(id, listener) {
        onValue(ref(realtimeDatabase, id), listener)
    }
}
