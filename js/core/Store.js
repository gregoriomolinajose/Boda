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
        // Deep merge simple para objetos anidados conocidos si es necesario, 
        // o reemplazo por niveles.
        this.state = { ...this.state, ...newState };
        this.notify();
        this.saveToStorage();
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
                this.state = { ...this.state, ...JSON.parse(saved) };
            } catch (e) {
                console.error("Error loading state from storage:", e);
            }
        }
    }
}
