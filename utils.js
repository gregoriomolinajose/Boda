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
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}
