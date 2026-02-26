/**
 * Helpers.js - Utilidades comunes y utilidades de DOM.
 */
export const Helpers = {
    /**
     * Muestra una notificación toast.
     */
    showToast: (containerId, message, type = 'success') => {
        const container = document.getElementById(containerId);
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerText = message;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '1';
        }, 100);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    },

    /**
     * Formatea una fecha ISO a string legible.
     */
    formatDate: (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    },

    /**
     * Debounce para limitar la frecuencia de ejecución de una función.
     */
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Verifica si un objeto está vacío.
     */
    isEmpty: (obj) => {
        return Object.keys(obj).length === 0;
    },

    /**
     * Formatea la fecha para el Hero (MAYÚSCULAS)
     */
    formatHeroDate: (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        const parts = date.toLocaleDateString('es-ES', options).toUpperCase().split(' ');
        // Ej: VIERNES | 13 MARZO | 2026
        return `${parts[0]} | ${parts[2]} ${parts[3]} | ${parts[5]}`;
    },

    /**
     * Formatea la fecha para el Itinerario (Salto de línea)
     */
    formatDisplayDate: (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const day = date.getDate();
        const month = date.toLocaleDateString('es-ES', { month: 'long' });
        const year = date.getFullYear();
        const time = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true });
        return `${day} de ${month}, ${year}<br>${time.toUpperCase()}`;
    }
};
