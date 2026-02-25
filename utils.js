/**
 * Funciones de utilidad comunes.
 */
const Utils = {
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
     * Muestra una notificación toast (requiere un contenedor en el DOM).
     */
    showToast: function (containerId, message, type = 'success') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast';

        const icon = type === 'success'
            ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4cd137" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>'
            : (type === 'info'
                ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3498db" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12.01" y2="16"></line><path d="M12 12V8"></path></svg>'
                : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e84118" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>');

        toast.innerHTML = `${icon} <span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = '0.5s';
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    },

    /**
     * Formatea una fecha de Google Sheets para mostrar.
     */
    formatSheetDate: function (fullDate) {
        if (!fullDate) return '-';
        const parts = fullDate.split(/[ T]/);
        if (parts.length >= 1) {
            const d = parts[0].split(/[/-]/);
            return d.length === 3 ? (d[0].length === 4 ? `${d[2]}/${d[1]} ${parts[1]?.substring(0, 5) || ''}` : `${d[0]}/${d[1]} ${parts[1]?.substring(0, 5) || ''}`) : parts[0];
        }
        return fullDate;
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}
