// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCNQ_kQQTB0JhSezG-mnlrKzUb7W9vrC8Q",
  authDomain: "connect-1a3eb.firebaseapp.com",
  projectId: "connect-1a3eb",
  storageBucket: "connect-1a3eb.firebasestorage.app",
  messagingSenderId: "379721578510",
  appId: "1:379721578510:web:a111da8bb5b683cf92245f",
  measurementId: "G-PNWJ7KF1HB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);