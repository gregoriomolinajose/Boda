import {
    signInWithRedirect,
    getRedirectResult,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { auth, googleProvider, db } from "./Firebase.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

/**
 * Auth.js - Gestión de autenticación con Google y registro de perfiles.
 */
export const Auth = {
    /**
     * Inicia sesión con Google usando redirección para evitar bloqueos de Popups (COOP).
     */
    async loginWithGoogle() {
        try {
            await signInWithRedirect(auth, googleProvider);
        } catch (error) {
            console.error("Error al redireccionar a Google:", error);
            throw error;
        }
    },

    /**
     * Procesa el resultado de la redirección al volver a la página (se debe llamar on load).
     */
    async checkRedirectResult() {
        try {
            const result = await getRedirectResult(auth);
            if (result && result.user) {
                // Sincronizar perfil en Firestore (Registro/Actualización)
                await this.syncUserProfile(result.user);
                return result.user;
            }
            return null;
        } catch (error) {
            console.error("Error al procesar el redireccionamiento de Google:", error);
            throw error;
        }
    },

    /**
     * Crea o actualiza el perfil del usuario en Firestore.
     */
    async syncUserProfile(user) {
        if (!user) return;

        const userRef = doc(db, 'users', user.uid);
        const userData = {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            lastLogin: serverTimestamp()
        };

        // setDoc con merge: true para crear o actualizar
        await setDoc(userRef, userData, { merge: true });
        console.log("Perfil de usuario sincronizado:", user.email);
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
     * Espera a que el estado interno de la sesión se inicialice desde el caché local.
     */
    async waitForAuthInit() {
        return auth.authStateReady();
    },

    /**
     * Protege una página redirigiendo al login si no hay sesión.
     */
    async requireAuth() {
        await this.waitForAuthInit();
        this.onSessionChange((user) => {
            if (!user) {
                console.warn("Acceso denegado: redireccionando a login.");
                window.location.href = 'login.html';
            }
        });
    }
};
