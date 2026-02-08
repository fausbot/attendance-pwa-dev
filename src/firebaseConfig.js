// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyATN3fVmJUpkpf7LKhoX780TeiihwQgu_0",
    authDomain: "control-de-entrada-3d85b.firebaseapp.com",
    projectId: "control-de-entrada-3d85b",
    storageBucket: "control-de-entrada-3d85b.firebasestorage.app",
    messagingSenderId: "770945112496",
    appId: "1:770945112496:web:cee48c2ac7e3e2f4f41e75",
    measurementId: "G-5EELJV0VLX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
const analytics = getAnalytics(app);
