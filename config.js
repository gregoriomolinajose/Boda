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
        message: "Nos encantaría que seas parte de este momento tan especial para nosotros. Un brindis íntimo para celebrar nuestra unión civil.",
        subject: "Nuestra Boda",
        photo: "https://placehold.co/600x600?text=Foto+de+los+Novios",
        dressCode: {
            show: true,
            title: "Código de vestimenta",
            description: "Formal Cocktail",
            tip: "¡Luce tu mejor look!"
        },
        gifts: {
            show: true,
            title: "Regalos",
            description: "Lo más importante es tu presencia.",
            registryButton: {
                show: true,
                url: ""
            },
            bankButton: {
                show: true,
                details: ""
            }
        },
        gallery: {
            show: true,
            title: "! Captura los Mejores Momentos !",
            description: "Queremos revivir este día tan especial a través de tus ojos. Ayúdanos a crear un álbum lleno de recuerdos inolvidables subiendo tus fotos.",
            uploadButton: {
                show: true,
                text: "Subir Fotos",
                url: "https://photos.app.goo.gl/LqatfysFetmxUcgK8"
            },
            albumButton: {
                show: true,
                text: "Ver Álbum",
                url: "https://photos.app.goo.gl/LqatfysFetmxUcgK8"
            }
        },
        rsvp: {
            title: "Confirmar Asistencia",
            description: "Por favor, confirma tu asistencia ¡Esperamos que estés!",
            showKids: true,
            showAllergies: true
        },
        confirmation: {
            yes: {
                title: "Te esperamos",
                description: ""
            },
            no: {
                title: "¡Te extrañaremos!",
                description: "Valoramos mucho tu cariño y, aunque nos encantaría celebrar juntos, entendemos que a veces los tiempos no coinciden. Gracias por acompañarnos siempre."
            }
        }
    },
    api: {
        sheetWebhook: "https://script.google.com/macros/s/AKfycbxkpWVeOerWCwX0JECPFc3I3RwZ-GyiACxh0BaDlhNDzq8OC4DJVs4acDx0s30ZAulIJg/exec"
    },
    ui: {
        baseUrl: window.location.origin + "/",
        musicVolume: 0.2,
        showCountdown: true,
        iconColor: "#80a040",
        primaryBlue: "#93afc2",
        primaryOlive: "#6b705c",
        fontPrimary: "Montserrat",
        fontScript: "Great Vibes",
        timelineAlign: "left",
        bgAnimation: {
            enabled: true,
            type: "particles",
            size: 15,
            opacity: 0.15,
            color: "#6b705c"
        }
    },
    timeline: [
        { time: "19:30", activity: "Recepción", icon: "fa-leaf" },
        { time: "20:00", activity: "Ceremonia", icon: "fa-heart" },
        { time: "20:30", activity: "Brindis", icon: "fa-champagne-glasses" },
        { time: "21:00", activity: "Cena", icon: "fa-utensils" }
    ]
};

// Exportar si se usa en un entorno de módulos, o dejar global para compatibilidad
window.APP_CONFIG = APP_CONFIG;
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APP_CONFIG;
}
