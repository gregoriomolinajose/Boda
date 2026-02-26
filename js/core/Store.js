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
     * @param {Boolean} skipCloud Si es true, no sincroniza con la nube (útil durante la carga inicial).
     */
    setState(newState, skipCloud = false) {
        // Deep merge para proteger objetos anidados como 'wedding'
        if (newState.wedding) this.state.wedding = { ...this.state.wedding, ...newState.wedding };
        if (newState.ui) this.state.ui = { ...this.state.ui, ...newState.ui };
        if (newState.api) this.state.api = { ...this.state.api, ...newState.api };
        if (newState.timeline) this.state.timeline = newState.timeline;

        this.notify();
        this.saveToStorage();

        // Sincronización con la nube (Firestore)
        if (!skipCloud) {
            this.saveToCloud('wedding_config_v1');
        }
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
            // Protección extra: No guardar el placeholder en la nube nunca
            if (this.state.wedding?.photo && (this.state.wedding.photo.includes('placehold.co') || this.state.wedding.photo.length < 100)) {
                console.log("Store: Detectado placeholder, limpiando campo photo antes de subir a la nube.");
                this.state.wedding.photo = "";
            }

            const dataString = JSON.stringify(this.state);
            const sizeInBytes = new Blob([dataString]).size;
            const photoSize = this.state.wedding?.photo ? new Blob([this.state.wedding.photo]).size : 0;

            console.log(`Intentando guardar en Firestore (${docId}): Total=${(sizeInBytes / 1024).toFixed(2)} KB, Foto=${(photoSize / 1024).toFixed(2)} KB`);

            // Límite estricto de Firestore: 1,048,576 bytes
            if (sizeInBytes > 1040000) {
                const msg = `⚠️ La foto es demasiado grande para la nube (${(photoSize / 1024).toFixed(2)} KB). Intenta recortarla más o usar una calidad menor. No se sincronizará hasta reducir el tamaño.`;
                console.error(msg);
                if (window.Utils) Utils.showToast('toast-container', msg);
                else alert(msg);
                return;
            }

            const docRef = doc(db, "configurations", docId);
            await setDoc(docRef, this.state);
            console.log(`✅ Sincronización exitosa con Firestore (${docId})`);
        } catch (e) {
            console.error("❌ Error al guardar en Firestore:", e);
            alert("Error crítico al sincronizar con la nube. Revisa tu conexión.");
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
                const cloudData = docSnap.data();
                console.log(`☁️ Datos recuperados de la nube (${docId}):`, !!cloudData.wedding?.photo ? "Con foto" : "Sin foto");

                // Usar skipCloud=true para evitar el bucle de guardado inmediato
                this.setState(cloudData, true);

                // Sincronizar con el objeto global si existe
                if (window.APP_CONFIG) {
                    if (cloudData.wedding) window.APP_CONFIG.wedding = { ...window.APP_CONFIG.wedding, ...cloudData.wedding };
                    if (cloudData.ui) window.APP_CONFIG.ui = { ...window.APP_CONFIG.ui, ...cloudData.ui };
                    if (cloudData.api) window.APP_CONFIG.api = { ...window.APP_CONFIG.api, ...cloudData.api };
                    if (cloudData.timeline) window.APP_CONFIG.timeline = cloudData.timeline;
                }
            } else {
                console.log(`ℹ️ No hay datos previos en la nube (${docId}).`);
            }
        } catch (e) {
            console.error("Error loading from Firestore:", e);
        }
    }
}
