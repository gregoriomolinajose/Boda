/**
 * app.js - v1.1
 */
import { Store } from './js/core/Store.js';
import { Renderer } from './js/modules/Renderer.js';
import { Helpers } from './js/utils/Helpers.js';

/**
 * Módulo principal de la Landing Page de Boda Dora & Gregorio
 */
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar Store con configuración global (asumiendo config.js carga APP_CONFIG)
    const store = new Store(window.APP_CONFIG || {});

    const domElements = {
        heroNames: document.getElementById('host-names-hero'),
        hostNamesFinal: document.getElementById('host-names-final'),
        heroImg: document.getElementById('hero-img-display'),
        // ... otros elementos necesarios ...
        rsvpTitle: document.getElementById('rsvp-title'),
        rsvpDescription: document.getElementById('rsvp-description'),
        wrapperAdults: document.getElementById('wrapper-adults'),
        wrapperKids: document.getElementById('wrapper-kids'),
        wrapperAllergies: document.getElementById('wrapper-allergies'),
    };

    const renderer = new Renderer(domElements);

    // Reaccionar a cambios en el estado
    store.subscribe((state) => {
        renderer.render(state);
    });

    // Renderizado inicial
    renderer.render(store.getState());

    // Escuchar actualizaciones desde el generador (postMessage)
    window.addEventListener('message', (event) => {
        if (event.data.type === 'UPDATE_CONFIG') {
            store.setState(event.data.config);
        }
    });

    // Lógica de Splash y Música
    const initSplash = () => {
        const enterBtn = document.getElementById('enter-site');
        const splash = document.getElementById('splash');
        const audio = document.getElementById('wedding-song');

        if (enterBtn && splash) {
            enterBtn.addEventListener('click', () => {
                splash.classList.add('hidden-splash');
                setTimeout(() => splash.style.display = 'none', 1000);
                if (audio) audio.play().catch(e => console.log("Audio prevented:", e));
            });
        }
    };

    initSplash();
    // Re-implementar initCountdown, initParticles, etc. de forma modular si es necesario
});
