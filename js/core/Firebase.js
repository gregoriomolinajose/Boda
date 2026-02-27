/**
 * Firebase.js - Configuración e inicialización de Firebase (Versión Browser).
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Tu configuración de Firebase Web App
const firebaseConfig = {
    apiKey: "AIzaSyAsbrZn2FEKiIweJTBS0q09HyEfgQdTiE8",
    authDomain: "invitations-7c9cb.firebaseapp.com",
    projectId: "invitations-7c9cb",
    storageBucket: "invitations-7c9cb.firebasestorage.app",
    messagingSenderId: "759741305756",
    appId: "1:759741305756:web:9a250f55273712063aee59"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar base de datos y auth
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
