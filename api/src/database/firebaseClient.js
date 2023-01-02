// https://firebase.google.com/docs/web/setup#available-libraries
import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { getFirestore } from 'firebase/firestore'
import { config } from 'dotenv'

config()

let app

export function getDocumentDatabase() {
    if(!app) {
        app = initializeApp(JSON.parse(process.env.API_KEY))
    }
    return getFirestore(app)
}
export function getRealtimeDatabase() {
    if(!app) {
        app = initializeApp(JSON.parse(process.env.API_KEY))
    }
    return getDatabase(app)
}
