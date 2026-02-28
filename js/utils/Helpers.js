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
     * Ej: VIERNES | 13 MARZO | 2026
     */
    formatHeroDate: (dateStr) => {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            const weekday = date.toLocaleDateString('es-ES', { weekday: 'long' }).toUpperCase();
            const day = date.getDate();
            const month = date.toLocaleDateString('es-ES', { month: 'long' }).toUpperCase();
            const year = date.getFullYear();

            return `${weekday} | ${day} ${month} | ${year}`;
        } catch (e) {
            console.error("Error formatting hero date:", e);
            return dateStr;
        }
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
    },

    /**
     * Genera un enlace de Google Calendar para el evento.
     */
    generateCalendarLink: (wedding) => {
        if (!wedding || !wedding.date) return '#';

        const title = encodeURIComponent(wedding.subject || "Nuestra Boda");
        const location = encodeURIComponent(wedding.location?.physical || "");
        const details = encodeURIComponent(wedding.message || "¡Te esperamos!");

        try {
            const startDate = new Date(wedding.date);
            // Asumimos 5 horas de duración por defecto para la boda
            const endDate = new Date(startDate.getTime() + 5 * 60 * 60 * 1000);

            // Formato de fecha requerido por Google Calendar: YYYYMMDDTHHMMSSZ
            const formatForCalendar = (d) => {
                return d.toISOString().replace(/-|:|\.\d\d\d/g, "");
            };

            const dates = `${formatForCalendar(startDate)}/${formatForCalendar(endDate)}`;

            return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
        } catch (e) {
            console.error("Error generating calendar link:", e);
            return '#';
        }
    }
};
