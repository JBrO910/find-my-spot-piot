import {documentDatabase} from './firebaseClient.js'
import {addDoc, updateDoc, setDoc, collection, doc, getDoc, getDocs} from 'firebase/firestore'

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

    async getSingleFrom(table, id, transform) {
        const document = await getDoc(doc(documentDatabase, table, id))
        return transform({id: document.id, ...document.data()})
    }
}
