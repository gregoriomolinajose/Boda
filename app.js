/**
 * app.js - v1.8
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
        hostNamesSplash: document.getElementById('host-names-splash'),
        heroNames: document.getElementById('host-names-hero'),
        hostNamesFinal: document.getElementById('host-names-final'),
        heroImg: document.getElementById('hero-img-display'),
        eventDateHero: document.getElementById('event-date-hero'),
        weddingSubject: document.getElementById('wedding-subject-display'),
        weddingMessage: document.getElementById('wedding-message-display'),
        guestWelcome: document.getElementById('guest-welcome'),
        locationPhysical: document.getElementById('wedding-location-physical'),
        dateDisplay: document.getElementById('wedding-date-display'),
        rsvpTitle: document.getElementById('rsvp-title'),
        rsvpDescription: document.getElementById('rsvp-description'),
        wrapperAdults: document.getElementById('wrapper-adults'),
        wrapperKids: document.getElementById('wrapper-kids'),
        wrapperAllergies: document.getElementById('wrapper-allergies'),
        finalTitleYes: document.getElementById('final-title-yes'),
        finalDescYes: document.getElementById('final-desc-yes'),
        finalTitleNo: document.getElementById('final-title-no'),
        finalDescNo: document.getElementById('final-desc-no'),
    };

    const renderer = new Renderer(domElements);

    // --- Lógica de Partículas (Ambient Particles) ---
    const initParticles = () => {
        const container = document.getElementById('particles-container');
        if (!container) return;

        // Limpiar contenedor por si se reinicia
        container.innerHTML = '';

        const state = store.getState();
        const bgConfig = state.ui?.bgAnimation || {
            enabled: true,
            type: 'particles',
            size: 15,
            opacity: 0.15,
            color: '#6b705c'
        };

        if (bgConfig.enabled === false || bgConfig.type === 'none') {
            return;
        }

        const particleCount = 20;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';

            // Tamaño aleatorio basado en el máximo configurado
            const maxSize = bgConfig.size || 15;
            const size = Math.random() * (maxSize - 2) + 2;

            const left = Math.random() * 100;
            const duration = Math.random() * 20 + 10;
            const delay = Math.random() * 20;

            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${left}%`;
            particle.style.background = bgConfig.color || '#6b705c';
            particle.style.opacity = bgConfig.opacity || 0.15;
            particle.style.animationDuration = `${duration}s`;
            particle.style.animationDelay = `-${delay}s`;

            container.appendChild(particle);
        }
    };

    // Reaccionar a cambios en el estado
    store.subscribe((state) => {
        renderer.render(state);
        // Podríamos optimizar esto para que solo se llame si cambia bgAnimation,
        // pero por simplicidad lo reiniciamos si es necesario.
        initParticles();
    });

    // Renderizado inicial
    renderer.render(store.getState());
    initParticles();

    // Escuchar actualizaciones desde el generador (postMessage)
    window.addEventListener('message', (event) => {
        if (event.data.type === 'UPDATE_CONFIG') {
            store.setState(event.data.config);
        }
    });

    /**
     * Lógica de Revelado al hacer Scroll (IntersectionObserver)
     */
    const initScrollReveal = () => {
        const observerOptions = {
            threshold: 0.15,
            rootMargin: "0px 0px -50px 0px"
        };

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    entry.target.classList.add('visible'); // Compatibilidad con ambas clases

                    // Si es un contenedor de escalonado, activar hijos
                    if (entry.target.classList.contains('logistics-grid')) {
                        entry.target.querySelectorAll('.stagger-item').forEach((el, i) => {
                            setTimeout(() => el.classList.add('active'), i * 200);
                        });
                    }
                }
            });
        }, observerOptions);

        // Observar elementos con clase reveal o animate-on-scroll
        document.querySelectorAll('.reveal, .animate-on-scroll, .logistics-grid').forEach(el => {
            revealObserver.observe(el);
        });
    };

    // Lógica de Splash y Música
    const initSplash = () => {
        const enterBtn = document.getElementById('enter-site');
        const splash = document.getElementById('splash');
        const audio = document.getElementById('wedding-song');

        if (enterBtn && splash) {
            enterBtn.addEventListener('click', () => {
                document.body.classList.add('show-content'); // Clase que dispara transiciones CSS
                splash.style.opacity = '0';
                setTimeout(() => {
                    splash.style.display = 'none';
                    initScrollReveal(); // Iniciar observer después del splash
                }, 1000);
                if (audio) audio.play().catch(e => console.log("Audio prevented:", e));
            });
        }
    };

    initSplash();
});
