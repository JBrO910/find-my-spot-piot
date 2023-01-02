import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    runTransaction,
    setDoc,
    updateDoc,
    where,
    onSnapshot,
} from 'firebase/firestore'
import { getDocumentDatabase } from './firebaseClient.js'

export default class DocumentDatabase {

    constructor() {
        this.documentDatabase = getDocumentDatabase()
    }

    async addSerializable(table, element) {
        return await addDoc(collection(this.documentDatabase, table), element)
    }

    async setSerializable(table, id, element) {
        return await setDoc(doc(this.documentDatabase, table, id), element)
    }

    async updateSerializable(table, id, element) {
        return await updateDoc(doc(this.documentDatabase, table, id), element)
    }

    async getAllFrom(table, transform) {
        const query = await getDocs(collection(this.documentDatabase, table))
        return query.docs.map((doc) => transform({id: doc.id, ...doc.data()}))
    }

    async exists(table, id) {
        const query = await getDoc(doc(this.documentDatabase, table, id))
        return query.exists()
    }

    async onChange(table, transform, listener, type) {
        return onSnapshot(collection(this.documentDatabase, table), (snapshot) => {
            snapshot.docChanges().forEach(change => {
                if(!type || change.type !== type) return;

                const element = transform({id: change.doc.id, ...change.doc.data()})

                listener(element)
            })
        })
    }

    async getSingleFrom(table, id, transform) {
        const document = await getDoc(doc(this.documentDatabase, table, id))

        if (!document.exists()) return undefined

        return transform({id: document.id, ...document.data()})
    }

    async getWhere(table, transform, ...whereCommands) {
        const q = await query(
            collection(this.documentDatabase, table),
            ...whereCommands.map((command) => where(...command))
        )
        return await getDocs(q)
            .then(({docs}) =>
                docs
                    .map(
                        (document) =>
                            document.exists() &&
                            transform({id: document.id, ...document.data()}),
                    )
                    .filter((e) => e),
            )
    }

    async deleteWhere(table, whereColumn, whereCommand, whereValue) {
        await runTransaction(this.documentDatabase, async (transaction) => {
            const q = await query(
                collection(this.documentDatabase, table),
                where(whereColumn, whereCommand, whereValue),
            )
            const documents = await getDocs(q)
            documents.docs.forEach((doc) => transaction.delete(doc.ref))
        })
    }

    async deleteSingleFrom(table, id) {
        return deleteDoc(doc(this.documentDatabase, table, id))
    }
}
