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
    }
};
