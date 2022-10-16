// https://firebase.google.com/docs/web/setup#available-libraries
import { initializeApp } from 'firebase/app'
import { addDoc, collection, getFirestore, documentId } from 'firebase/firestore'
import { getDatabase } from 'firebase/database'

// TODO Figure out how to handle secrets
import firebaseConfig from '../../findmyspot-firebase-key.json' assert { type: 'json' }
import firestoreConfig from '../../findmyspot-firestore-key.json' assert { type: 'json' }

// Initialize Firebase
const app = initializeApp({ ...firebaseConfig, ...firestoreConfig })

export const documentDatabase = getFirestore(app)
export const realtimeDatabase = getDatabase(app)
