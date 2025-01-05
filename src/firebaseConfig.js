// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"; // For initializing the app
import { getAuth } from "firebase/auth"; // For Firebase Authentication
import { getFirestore } from "firebase/firestore"; // For Firestore Database
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDOV-bRcKpbSkEqXDrzV0ro4LpUTsTH3R8",
  authDomain: "typing-speed-checker.firebaseapp.com",
  projectId: "typing-speed-checker",
  storageBucket: "typing-speed-checker.firebasestorage.app",
  messagingSenderId: "646342960207",
  appId: "1:646342960207:web:8bdb82047863da9e1cf63a",
  measurementId: "G-ZSQRMB2J8K"
};

// Initialize Firebase
// Initialize Firebase App
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };