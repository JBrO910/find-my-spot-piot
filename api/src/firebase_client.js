// https://firebase.google.com/docs/web/setup#available-libraries
import {initializeApp as initializeFirebaseApp} from "firebase/app";
import {getAnalytics} from "firebase/analytics";
import {getDatabase} from "firebase/database";

const {initializeApp, applicationDefault, cert} = require('firebase-admin/app');
const {getFirestore, Timestamp, FieldValue} = require('firebase-admin/firestore');

const firebaseConfig = {
    apiKey: "AIzaSyD5whHxEyC6Im2sRks1hXALJ_294REhbeA",
    authDomain: "findmyspot-606a5.firebaseapp.com",
    projectId: "findmyspot-606a5",
    storageBucket: "findmyspot-606a5.appspot.com",
    messagingSenderId: "668153040488",
    appId: "1:668153040488:web:56c83f16d8b8dc15d375dd",
    measurementId: "G-Y5EDC61W14",
    databaseURL: "https://findmyspot-606a5-default-rtdb.europe-west1.firebasedatabase.app/",
};

// Initialize Firebase
const app = initializeFirebaseApp(firebaseConfig);
const analytics = getAnalytics(app);

initializeApp({
    credential: applicationDefault()
});

module.exports = {
    documentDatabase: getFirestore(),
    realtimeDatabase: getDatabase(app),
}

