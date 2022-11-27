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
import { documentDatabase } from './firebaseClient.js'

export default class DocumentDatabase {
    async addSerializable(table, element) {
        return await addDoc(collection(documentDatabase, table), element)
    }

    async setSerializable(table, id, element) {
        return await setDoc(doc(documentDatabase, table, id), element)
    }

    async updateSerializable(table, id, element) {
        return await updateDoc(doc(documentDatabase, table, id), element)
    }

    async getAllFrom(table, transform) {
        const query = await getDocs(collection(documentDatabase, table))
        return query.docs.map((doc) => transform({id: doc.id, ...doc.data()}))
    }

    async onChange(table, transform, listener, type) {
        return onSnapshot(collection(documentDatabase, table), (snapshot) => {
            snapshot.docChanges().forEach(change => {
                if(!type || change.type !== type) return;

                listener({id: change.doc.id, ...change.doc.data()})
            })
        })
    }

    async getSingleFrom(table, id, transform) {
        const document = await getDoc(doc(documentDatabase, table, id))

        if (!document.exists()) return undefined

        return transform({id: document.id, ...document.data()})
    }

    async getWhere(table, whereColumn, whereCommand, whereValue, transform) {
        const q = await query(
            collection(documentDatabase, table),
            where(whereColumn, whereCommand, whereValue),
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
        await runTransaction(documentDatabase, async (transaction) => {
            const q = await query(
                collection(documentDatabase, table),
                where(whereColumn, whereCommand, whereValue),
            )
            const documents = await getDocs(q)
            documents.docs.forEach((doc) => transaction.delete(doc.ref))
        })
    }

    async deleteSingleFrom(table, id) {
        return deleteDoc(doc(documentDatabase, table, id))
    }
}
