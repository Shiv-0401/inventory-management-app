// Import the functions you need from the SDKs you need
import {initializeApp} from 'firebase/app'
import {getFirestore} from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDesNYMQUKuEJEFaNlYzHMw3MmWCUhJT-o",
  authDomain: "pantry-tracker-80217.firebaseapp.com",
  projectId: "pantry-tracker-80217",
  storageBucket: "pantry-tracker-80217.appspot.com",
  messagingSenderId: "6578134485",
  appId: "1:6578134485:web:fded506da4c43839c1315c",
  measurementId: "G-6CXMY2CKEF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app)
export{app, firestore}