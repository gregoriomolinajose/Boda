/**
 * Configuración central del proyecto de boda.
 */
const APP_CONFIG = {
    wedding: {
        date: "March 13, 2026 19:30:00",
        location: {
            physical: "Barolo 8C Chapalita",
            virtual: "Google Meet"
        },
        names: "Dora & Gregorio"
    },
    api: {
        sheetWebhook: "https://script.google.com/macros/s/AKfycbxkpWVeOerWCwX0JECPFc3I3RwZ-GyiACxh0BaDlhNDzq8OC4DJVs4acDx0s30ZAulIJg/exec"
    },
    ui: {
        baseUrl: "https://boda-doraygregorio.vercel.app/",
        musicVolume: 0.2
    }
};

// Exportar si se usa en un entorno de módulos, o dejar global para compatibilidad
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APP_CONFIG;
}
