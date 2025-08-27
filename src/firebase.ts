// FIX: The errors about missing v9 modular exports (e.g., initializeApp, getAuth)
// suggest that the project is set up to use the Firebase v8 namespaced API.
// Switching to the v9 compat libraries allows using the v8 syntax (e.g., firebase.auth())
// while maintaining compatibility with v9 modular features used elsewhere in the app (like Firestore).
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDtU3r3CiHbxhajiBa7u7x1_T2PVSpUd0Q",
  authDomain: "novatalkchat.firebaseapp.com",
  projectId: "novatalkchat",
  storageBucket: "novatalkchat.firebasestorage.app",
  messagingSenderId: "492878372199",
  appId: "1:492878372199:web:6e27ad190da622e605a3c2",
  measurementId: "G-4FM7CFTZPE"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Export Firebase services using the v8-style API
export const auth = firebase.auth();
export const db = firebase.firestore();
