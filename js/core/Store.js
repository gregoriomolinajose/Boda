import {
    doc, setDoc, getDoc, collection, getDocs, deleteDoc, updateDoc, query, orderBy, serverTimestamp, where
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "./Firebase.js";
import { Helpers } from "../utils/Helpers.js";

/**
 * Store.js - Módulo de gestión de estado reactivo (Patrón Observer).
 */
export class Store {
    constructor(initialState = {}, eventId = 'default', storageKey = 'app_settings') {
        this.state = initialState;
        this.eventId = eventId;
        this.storageKey = `${storageKey}_${eventId}`;
        this.subscribers = [];
        this.loadFromStorage();
    }

    /**
     * Suscribe una función para reaccionar a cambios en el estado.
     */
    subscribe(callback) {
        this.subscribers.push(callback);
        return () => {
            this.subscribers = this.subscribers.filter(sub => sub !== callback);
        };
    }

    /**
     * Actualiza una parte del estado de forma inmutable y notifica a los suscriptores.
     */
    setState(newState, skipCloud = false) {
        if (newState.wedding) {
            // Deep merge for wedding to preserve nested objects like location, rsvp, gifts, gallery
            this.state.wedding = Helpers.deepMerge(this.state.wedding || {}, newState.wedding);
        }
        if (newState.ui) {
            this.state.ui = Helpers.deepMerge(this.state.ui || {}, newState.ui);
        }
        if (newState.api) {
            this.state.api = { ...(this.state.api || {}), ...newState.api };
        }
        if (newState.timeline) this.state.timeline = newState.timeline;

        this.notify();
        this.saveToStorage();

        if (!skipCloud) {
            this.saveToCloud();
        }
    }

    getState() {
        return this.state;
    }

    notify() {
        this.subscribers.forEach(callback => callback(this.state));
    }

    saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.state));
        } catch (e) {
            console.error("Error saving state to storage:", e);
        }
    }

    loadFromStorage() {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (!this.state.wedding) this.state.wedding = {};
                if (!this.state.ui) this.state.ui = {};
                if (!this.state.api) this.state.api = {};

                if (parsed.wedding) Object.assign(this.state.wedding, parsed.wedding);
                if (parsed.ui) Object.assign(this.state.ui, parsed.ui);
                if (parsed.api) Object.assign(this.state.api, parsed.api);
                if (parsed.timeline) this.state.timeline = parsed.timeline;
            } catch (e) {
                console.error("Error loading state from storage:", e);
            }
        }
    }

    /**
     * Sincroniza el estado actual con Firestore en el documento del evento.
     */
    async saveToCloud() {
        try {
            if (this.state.wedding?.photo && (this.state.wedding.photo.includes('placehold.co') || this.state.wedding.photo.length < 100)) {
                this.state.wedding.photo = "";
            }

            const dataString = JSON.stringify(this.state);
            const sizeInBytes = new Blob([dataString]).size;

            if (sizeInBytes > 1040000) {
                console.error("⚠️ Estado demasiado grande para Firestore");
                return;
            }

            const docRef = doc(db, "events", this.eventId);
            await setDoc(docRef, {
                ...this.state,
                updatedAt: serverTimestamp(),
                eventId: this.eventId,
                eventName: this.state.wedding?.names || 'Evento sin nombre'
            }, { merge: true });

            console.log(`✅ Sincronización exitosa: events/${this.eventId}`);
        } catch (e) {
            console.error("❌ Error al guardar en Firestore:", e);
        }
    }

    /**
     * Carga el estado desde el documento del evento en Firestore.
     */
    async loadFromCloud() {
        try {
            const docRef = doc(db, "events", this.eventId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const cloudData = docSnap.data();
                this.setState(cloudData, true);

                // Sincronizar con el objeto global si existe
                if (window.APP_CONFIG) {
                    if (cloudData.wedding) window.APP_CONFIG.wedding = Helpers.deepMerge(window.APP_CONFIG.wedding || {}, cloudData.wedding);
                    if (cloudData.ui) window.APP_CONFIG.ui = Helpers.deepMerge(window.APP_CONFIG.ui || {}, cloudData.ui);
                    if (cloudData.api) window.APP_CONFIG.api = { ...(window.APP_CONFIG.api || {}), ...cloudData.api };
                    if (cloudData.timeline) window.APP_CONFIG.timeline = cloudData.timeline;
                }
            }
        } catch (e) {
            console.error("Error loading event from Firestore:", e);
        }
    }

    // ==========================================
    // SECCIÓN DE INVITADOS (Dinamizada por eventId)
    // ==========================================

    async getGuests() {
        try {
            const guestsCol = collection(db, "events", this.eventId, "guests");
            const q = query(guestsCol, orderBy("timestamp", "desc"));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                ID: doc.id,
                Invitado: doc.data().guest,
                Asistencia: doc.data().attendance,
                Adultos: doc.data().adults,
                Niños: doc.data().kids,
                'Fecha/Hora': doc.data().timestamp?.toDate() || new Date(),
                'Estado de la liga': doc.data().active ?? true,
                Link: doc.data().link
            }));
        } catch (e) {
            console.error("Error al obtener invitados:", e);
            return [];
        }
    }

    async saveGuest(guestData) {
        try {
            const guestId = guestData.id || Math.random().toString(36).substring(2, 6).toUpperCase();
            const docRef = doc(db, "events", this.eventId, "guests", guestId);

            const cleanData = {
                guest: guestData.guest || "",
                attendance: guestData.attendance || "Pendiente",
                adults: parseInt(guestData.adults) || 1,
                kids: parseInt(guestData.kids) || 0,
                allergies: guestData.allergies || "N/A",
                type: guestData.type || "f",
                link: guestData.link || "",
                active: guestData.active ?? true,
                timestamp: serverTimestamp()
            };

            await setDoc(docRef, cleanData, { merge: true });
            return guestId;
        } catch (e) {
            console.error("Error al guardar invitado:", e);
            throw e;
        }
    }

    async deleteGuest(guestId) {
        try {
            const docRef = doc(db, "events", this.eventId, "guests", guestId);
            await deleteDoc(docRef);
        } catch (e) {
            console.error("Error al eliminar invitado:", e);
            throw e;
        }
    }

    async toggleGuestStatus(guestId, isActive) {
        try {
            const docRef = doc(db, "events", this.eventId, "guests", guestId);
            await updateDoc(docRef, { active: isActive });
        } catch (e) {
            console.error("Error al cambiar estado:", e);
            throw e;
        }
    }

    // ==========================================
    // MÉTODOS ESTÁTICOS PARA EL PORTAL
    // ==========================================

    /**
     * Lista todos los eventos registrados para un usuario específico.
     * @param {string} userId El ID del usuario autenticado.
     */
    static async getEvents(userId) {
        if (!userId) {
            console.error("Se requiere un userId para obtener los eventos.");
            return [];
        }
        try {
            const eventsCol = collection(db, "events");
            const q = query(eventsCol, where("userId", "==", userId));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (e) {
            console.error("Error al obtener eventos:", e);
            return [];
        }
    }

    /**
     * Genera un nuevo evento inicial en la base de datos asociado a un usuario.
     */
    static async createEvent(id, name, type = 'wedding', userId) {
        if (!userId) {
            throw new Error("Se requiere un userId para crear un evento.");
        }
        try {
            const docRef = doc(db, "events", id);
            const initialConfig = {
                eventId: id,
                eventName: name,
                type: type,
                wedding: {
                    names: name,
                    subject: "Nuestra Boda",
                    date: "March 13, 2026 19:30:00",
                    location: { physical: "Barolo 8C Chapalita" }
                },
                ui: { showCountdown: true },
                userId: userId,
                createdAt: serverTimestamp()
            };
            await setDoc(docRef, initialConfig);
            return id;
        } catch (e) {
            console.error("Error al crear evento:", e);
            throw e;
        }
    }
}
