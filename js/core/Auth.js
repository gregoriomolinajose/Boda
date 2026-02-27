import {
    signInWithPopup,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { auth, googleProvider } from "./Firebase.js";

/**
 * Auth.js - Gestión de autenticación con Google.
 */
export const Auth = {
    /**
     * Inicia sesión con Google Popup.
     */
    async loginWithGoogle() {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            return result.user;
        } catch (error) {
            console.error("Error en login con Google:", error);
            throw error;
        }
    },

    /**
     * Cierra la sesión activa.
     */
    async logout() {
        try {
            await signOut(auth);
            window.location.href = 'login.html';
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    },

    /**
     * Monitorea el estado de la sesión.
     * @param {Function} callback Función que recibe el usuario o null.
     */
    onSessionChange(callback) {
        return onAuthStateChanged(auth, callback);
    },

    /**
     * Protege una página redirigiendo al login si no hay sesión.
     */
    requireAuth() {
        this.onSessionChange((user) => {
            if (!user) {
                console.warn("Acceso denegado: redireccionando a login.");
                window.location.href = 'login.html';
            }
        });
    }
};
