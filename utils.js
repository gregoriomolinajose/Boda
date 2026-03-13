export const Utils = {
    /**
     * Muestra una notificación toast.
     */
    showToast: function (containerId, message, type = 'success') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        let iconSvg = '';
        if (type === 'success') {
            iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4cd137" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        } else if (type === 'info') {
            iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3498db" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12.01" y2="16"></line><path d="M12 12V8"></path></svg>';
        } else {
            iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e84118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
        }

        toast.innerHTML = `${iconSvg} <span>${message}</span>`;
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
     * Copia texto al portapapeles con fallback.
     */
    copyToClipboard: function (text, callback) {
        if (!text) {
            if (callback) callback(false, 'No hay texto para copiar');
            return;
        }

        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(() => {
                if (callback) callback(true, '¡Enlace copiado al portapapeles!');
            }).catch(err => {
                console.error('Error al copiar:', err);
                this.fallbackCopyTextToClipboard(text, callback);
            });
        } else {
            this.fallbackCopyTextToClipboard(text, callback);
        }
    },

    fallbackCopyTextToClipboard: function (text, callback) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            if (callback) callback(true, '¡Enlace copiado al portapapeles!');
        } catch (err) {
            console.error('Error en fallback:', err);
            if (callback) callback(false, 'No se pudo copiar el enlace');
        }
        document.body.removeChild(textArea);
    },


    /**
     * Formatea una fecha de Google Sheets para mostrar.
     */
    formatSheetDate: function (fullDate) {
        if (!fullDate) return '-';

        // Si ya es un objeto Date (Nuevo Firestore)
        if (fullDate instanceof Date) {
            const d = fullDate.getDate().toString().padStart(2, '0');
            const m = (fullDate.getMonth() + 1).toString().padStart(2, '0');
            const h = fullDate.getHours().toString().padStart(2, '0');
            const min = fullDate.getMinutes().toString().padStart(2, '0');
            return `${d}/${m} ${h}:${min}`;
        }

        // Si es string (Legacy Sheets o fallback)
        if (typeof fullDate === 'string' && fullDate.includes) {
            const parts = fullDate.split(/[ T]/);
            if (parts.length >= 1) {
                const d = parts[0].split(/[/-]/);
                return d.length === 3 ? (d[0].length === 4 ? `${d[2]}/${d[1]} ${parts[1]?.substring(0, 5) || ''}` : `${d[0]}/${d[1]} ${parts[1]?.substring(0, 5) || ''}`) : parts[0];
            }
        }

        return fullDate;
    },
    /**
     * Genera un enlace de Google Calendar para el evento.
     */
    generateCalendarLink: function (wedding) {
        if (!wedding || !wedding.date) return '#';
        const isDigital = (wedding.invType || 'f').toLowerCase() === 'd';
        const locationStr = isDigital ? (wedding.location?.virtual || "") : (wedding.location?.physical || "");
        const title = encodeURIComponent(wedding.calendar?.title || wedding.subject || "Nuestra Boda");
        const location = encodeURIComponent(locationStr);
        const details = encodeURIComponent(wedding.calendar?.description || wedding.message || "¡Te esperamos!");

        // Simplified dynamic link for utils.js legacy
        return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
    }
};

window.Utils = Utils;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}
