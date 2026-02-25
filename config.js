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
        names: "Dora & Gregorio",
        photo: "https://via.placeholder.com/600x600?text=Foto+de+los+Novios"
    },
    api: {
        sheetWebhook: "https://script.google.com/macros/s/AKfycbxkpWVeOerWCwX0JECPFc3I3RwZ-GyiACxh0BaDlhNDzq8OC4DJVs4acDx0s30ZAulIJg/exec"
    },
    ui: {
        baseUrl: "https://boda-doraygregorio.vercel.app/",
        musicVolume: 0.2,
        showCountdown: true,
        iconColor: "#80a040",
        primaryBlue: "#93afc2",
        primaryOlive: "#6b705c",
        fontPrimary: "Montserrat",
        fontScript: "Great Vibes"
    },
    timeline: [
        { time: "19:30", activity: "Recepción", icon: "fa-leaf" },
        { time: "20:00", activity: "Ceremonia", icon: "fa-heart" },
        { time: "20:30", activity: "Brindis", icon: "fa-champagne-glasses" },
        { time: "21:00", activity: "Cena", icon: "fa-utensils" }
    ]
};

// Exportar si se usa en un entorno de módulos, o dejar global para compatibilidad
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APP_CONFIG;
}
