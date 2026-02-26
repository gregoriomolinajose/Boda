import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "./Firebase.js";

/**
 * Store.js - Módulo de gestión de estado reactivo (Patrón Observer).
 */
export class Store {
    constructor(initialState = {}, storageKey = 'app_settings') {
        this.state = initialState;
        this.storageKey = storageKey;
        this.subscribers = [];
        this.loadFromStorage();
    }

    /**
     * Suscribe una función para reaccionar a cambios en el estado.
     * @param {Function} callback 
     */
    subscribe(callback) {
        this.subscribers.push(callback);
        return () => {
            this.subscribers = this.subscribers.filter(sub => sub !== callback);
        };
    }

    /**
     * Actualiza una parte del estado de forma inmutable y notifica a los suscriptores.
     * @param {Object} newState 
     */
    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.notify();
        this.saveToStorage();

        // Sincronización con la nube (Firestore)
        // Usamos un ID fijo 'default' por ahora, o podrías usar uno dinámico
        this.saveToCloud('wedding_config');
    }

    /**
     * Obtiene el estado actual.
     */
    getState() {
        return this.state;
    }

    /**
     * Notifica a todos los suscriptores.
     * @private
     */
    notify() {
        this.subscribers.forEach(callback => callback(this.state));
    }

    /**
     * Guarda el estado en LocalStorage.
     * @private
     */
    saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.state));
        } catch (e) {
            console.error("Error saving state to storage:", e);
            if (e.name === 'QuotaExceededError') {
                console.warn("LocalStorage quota exceeded, photo might be too large.");
            }
        }
    }

    /**
     * Carga el estado desde LocalStorage.
     * @private
     */
    loadFromStorage() {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Asegurar que la estructura base exista antes de asignar
                if (!this.state.wedding) this.state.wedding = {};
                if (!this.state.ui) this.state.ui = {};
                if (!this.state.api) this.state.api = {};

                if (parsed.wedding) Object.assign(this.state.wedding, parsed.wedding);
                if (parsed.ui) Object.assign(this.state.ui, parsed.ui);
                if (parsed.api) Object.assign(this.state.api, parsed.api);
                if (parsed.timeline) this.state.timeline = parsed.timeline;

                console.log("State loaded successfully from storage");
            } catch (e) {
                console.error("Error loading state from storage:", e);
            }
        }
    }

    /**
     * Sincroniza el estado actual con Firestore.
     */
    async saveToCloud(docId) {
        try {
            const docRef = doc(db, "configurations", docId);
            await setDoc(docRef, this.state);
        } catch (e) {
            console.error("Error saving to Firestore:", e);
        }
    }

    /**
     * Carga el estado desde Firestore.
     */
    async loadFromCloud(docId) {
        try {
            const docRef = doc(db, "configurations", docId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                this.setState(docSnap.data());
            }
        } catch (e) {
            console.error("Error loading from Firestore:", e);
        }
    }
}
