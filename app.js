/**
 * app.js - v1.9.7
 */
import { Store } from './js/core/Store.js';
import { Renderer } from './js/modules/Renderer.js';
import { Helpers } from './js/utils/Helpers.js';

/**
 * Módulo principal de la Landing Page de Boda Dora & Gregorio
 */
document.addEventListener('DOMContentLoaded', () => {
    // Obtener ID del evento desde la URL
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('event') || 'default';

    // Inicializar Store con configuración global y ID de evento
    const store = new Store(window.APP_CONFIG || {}, eventId);

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
        initParticles();
    });

    // Renderizado inicial asíncrono (Prioridad Cloud)
    const initCloudData = async () => {
        try {
            await store.loadFromCloud('wedding_config_v2');
            console.log("App iniciada con datos de la nube.");
        } catch (e) {
            console.warn("Fallo carga cloud, usando local:", e);
        }

        // --- Lógica de Personalización (URL Params) ---
        const urlParams = new URLSearchParams(window.location.search);
        const guestData = {
            wedding: {
                demoGuestName: urlParams.get('n') || "",
                guestUuid: urlParams.get('u') || "",
                adultsCount: parseInt(urlParams.get('ca')) || 0,
                kidsCount: parseInt(urlParams.get('cc')) || 0,
                invType: urlParams.get('t') || 'f'
            }
        };

        // Si hay nombre en la URL, priorizarlo sobre el demoGuestName del store
        if (guestData.wedding.demoGuestName) {
            store.setState(guestData, true); // skipCloud=true para no sobrescribir la config global
        }

        renderer.render(store.getState());
        initParticles();
    };

    initCloudData();

    // --- Lógica de RSVP ---
    const initRSVP = () => {
        const form = document.getElementById('wedding-rsvp');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.innerText;

            btn.innerText = 'Enviando...';
            btn.disabled = true;

            const state = store.getState();
            const formData = {
                id: state.wedding?.guestUuid || 'UNKNOWN',
                action: 'confirm',
                guest: state.wedding?.demoGuestName || 'Invitado Desconocido',
                attendance: document.getElementById('attendance').value === 'yes' ? 'Confirma' : 'Declina',
                adults: document.getElementById('adults')?.value || 0,
                kids: document.getElementById('kids')?.value || 0,
                allergies: document.getElementById('allergies')?.value || 'N/A'
            };

            try {
                // Si estamos en el simulador (iframe) o no hay eventId en URL, no intentar guardar en la base de datos real
                const urlParams = new URL(window.location.href).searchParams;
                const isPreview = window !== window.parent || !urlParams.get('event');

                if (!isPreview) {
                    await store.saveGuest(formData);
                } else {
                    console.log("Simulación de RSVP exitosa en vista previa. (No guardado en DB)");
                    await new Promise(resolve => setTimeout(resolve, 800)); // Simulando latencia de red
                }

                // Mostrar pantalla final
                const rsvpSection = document.getElementById('wedding-rsvp-section');
                if (rsvpSection) rsvpSection.style.display = 'none';

                const finalScreen = document.getElementById('final-screen');
                if (finalScreen) {
                    finalScreen.style.display = 'flex';
                    finalScreen.scrollIntoView({ behavior: 'smooth' });

                    // Mostrar mensaje correspondiente
                    if (formData.attendance === 'Confirma') {
                        document.getElementById('final-msg-yes').style.display = 'block';
                        document.getElementById('final-msg-no').style.display = 'none';
                    } else {
                        document.getElementById('final-msg-yes').style.display = 'none';
                        document.getElementById('final-msg-no').style.display = 'block';
                    }
                }

                Helpers.showToast('toast-container', '¡Asistencia confirmada!');
            } catch (err) {
                console.error("Error al enviar RSVP:", err);
                Helpers.showToast('toast-container', 'Error al enviar confirmación', 'error');
                btn.innerText = originalText;
                btn.disabled = false;
            }
        });

        // Mostrar/ocultar detalles según asistencia
        const attendanceSelect = document.getElementById('attendance');
        const details = document.getElementById('rsvp-details');
        if (attendanceSelect && details) {
            attendanceSelect.addEventListener('change', (e) => {
                details.style.display = e.target.value === 'yes' ? 'block' : 'none';
            });
        }
    };

    initRSVP();

    // Escuchar actualizaciones desde el generador (postMessage)
    window.addEventListener('message', (event) => {
        if (event.data.type === 'UPDATE_CONFIG') {
            store.setState(event.data.config, true); // Forzar skipCloud en la invitación

            // Re-vincular el observador para elementos dinámicamente re-renderizados (como el Itinerario)
            setTimeout(() => {
                if (window.revealObserver) {
                    document.querySelectorAll('.reveal, .animate-on-scroll, .logistics-grid').forEach(el => {
                        window.revealObserver.observe(el);
                    });
                }
            }, 100);
        } else if (event.data.type === 'SIMULATE_RSVP') {
            // Ocultar sección de RSVP
            const rsvpSection = document.getElementById('wedding-rsvp-section');
            if (rsvpSection) rsvpSection.style.display = 'none';

            // Mostrar pantalla final
            const finalScreen = document.getElementById('final-screen');
            if (finalScreen) {
                finalScreen.style.display = 'flex';

                // Configurar mensaje de sí o no
                if (event.data.state === 'yes') {
                    document.getElementById('final-msg-yes').style.display = 'block';
                    document.getElementById('final-msg-no').style.display = 'none';
                } else {
                    document.getElementById('final-msg-yes').style.display = 'none';
                    document.getElementById('final-msg-no').style.display = 'block';
                }
            }
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

        window.revealObserver = new IntersectionObserver((entries) => {
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
            window.revealObserver.observe(el);
        });
    };

    // Lógica de Splash y Música
    const initSplash = () => {
        const enterBtn = document.getElementById('enter-site');
        const splash = document.getElementById('splash');
        const audio = document.getElementById('wedding-song');
        const musicBtn = document.getElementById('music-toggle');

        if (enterBtn && splash) {
            enterBtn.addEventListener('click', () => {
                document.body.classList.add('show-content'); // Clase que dispara transiciones CSS
                splash.style.opacity = '0';
                setTimeout(() => {
                    splash.style.display = 'none';
                    initScrollReveal(); // Iniciar observer después del splash
                }, 1000);

                if (audio) {
                    audio.play().then(() => {
                        if (musicBtn) musicBtn.classList.remove('paused');
                    }).catch(e => {
                        console.log("Audio prevented by browser policy:", e);
                        if (musicBtn) musicBtn.classList.add('paused');
                    });
                }
            });
        }

        // Control de botón de música en la interfaz
        if (musicBtn && audio) {
            musicBtn.addEventListener('click', () => {
                if (audio.paused) {
                    audio.play();
                    musicBtn.classList.remove('paused');
                    musicBtn.setAttribute('aria-pressed', 'true');
                } else {
                    audio.pause();
                    musicBtn.classList.add('paused');
                    musicBtn.setAttribute('aria-pressed', 'false');
                }
            });
        }
    };

    initSplash();
});
