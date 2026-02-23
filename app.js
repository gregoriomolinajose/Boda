/**
         * Módulo principal que engloba toda la lógica de la Landing Page
         * utilizando un IIFE para evitar la contaminación del ámbito global.
         */
(() => {
    'use strict';

    // Documentación de elementos del DOM frecuentes
    const domElements = {
        splash: document.getElementById('splash'),
        enterBtn: document.getElementById('enter-site'),
        audioInput: document.getElementById('wedding-song'),
        musicToggleBtn: document.getElementById('music-toggle'),
        playIcon: document.getElementById('play-icon'),
        btnCalendario: document.getElementById('add-to-calendar'),
        formRsvp: document.getElementById('wedding-rsvp'),
        btnScrollHero: document.getElementById('scroll-indicator'),
        mainContentSection: document.querySelector('main.content-card'),
        particlesContainer: document.getElementById('particles-container'),
        rsvpDetails: document.getElementById('rsvp-details'),
        adultsInput: document.getElementById('adults'),
        kidsInput: document.getElementById('kids'),
        attendanceSelect: document.getElementById('attendance')
    };

    // Parámetros de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const GUEST_DATA = {
        name: urlParams.get('n') || 'Invitado',
        adults: parseInt(urlParams.get('ca')) || 1,
        kids: parseInt(urlParams.get('cc')) || 0
    };

    // Constantes Globales
    const APP_CONFIG = {
        fechaBoda: new Date("March 13, 2026 19:30:00").getTime(),
        volumenMusica: 0.2 // (20%)
    };

    let isPlaying = false;

    /**
     * Inicializa el módulo del contador regresivo
     */
    const initCountdown = () => {
        const ui = {
            d: document.getElementById("days"),
            h: document.getElementById("hours"),
            m: document.getElementById("minutes"),
            s: document.getElementById("seconds")
        };

        const updateTime = () => {
            const now = new Date().getTime();
            const dist = APP_CONFIG.fechaBoda - now;

            // Lógica para cuando la fecha ha expirado
            if (dist < 0) {
                Object.values(ui).forEach(el => el.innerText = "00");
                return;
            }

            // Cálculo matemático del tiempo
            ui.d.innerText = Math.floor(dist / (1000 * 60 * 60 * 24)).toString().padStart(2, '0');
            ui.h.innerText = Math.floor((dist % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
            ui.m.innerText = Math.floor((dist % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
            ui.s.innerText = Math.floor((dist % (1000 * 60)) / 1000).toString().padStart(2, '0');
        };

        // Actualizar inmediatamente y luego cada segundo
        updateTime();
        setInterval(updateTime, 1000);
    };

    /**
     * Controlador del estado y la UI del reproductor de música
     */
    const toggleMusic = () => {
        const isPaused = domElements.audioInput.paused;

        if (isPaused) {
            domElements.audioInput.play().catch(e => console.warn('Bloqueo de Auto-play detectado.', e));
            domElements.musicToggleBtn.classList.add('playing');
            // Add aria state update
            domElements.musicToggleBtn.setAttribute('aria-pressed', 'true');
        } else {
            domElements.audioInput.pause();
            domElements.musicToggleBtn.classList.remove('playing');
            // Add aria state update
            domElements.musicToggleBtn.setAttribute('aria-pressed', 'false');
        }
        isPlaying = !isPaused;
    };

    /**
     * Coordina las interacciones del área del Splash Screen (Bienvenida)
     */
    const initSplashScreen = () => {
        domElements.audioInput.volume = APP_CONFIG.volumenMusica;

        domElements.enterBtn.addEventListener('click', () => {
            // Revela el contenido debajo
            document.body.classList.add('show-content');
            // Inicia la música automáticamente
            toggleMusic();
            // Accesibilidad
            domElements.splash.setAttribute('aria-hidden', 'true');
        });
    };

    /**
     * Manejador de eventos para los botones de acción del usuario
     */
    const initUserActions = () => {
        // Alternar Música Manualmente
        domElements.musicToggleBtn.addEventListener('click', toggleMusic);

        // Scroll Automático (Flecha abajo del Hero)
        domElements.btnScrollHero.addEventListener('click', () => {
            if (domElements.mainContentSection) {
                domElements.mainContentSection.scrollIntoView({ behavior: 'smooth' });
            }
        });

        // Añadir al Calendario (Google Calendar Template URL)
        domElements.btnCalendario.addEventListener('click', (e) => {
            e.preventDefault();
            // Url Encoded Ring Emoji: %F0%9F%92%8D, Ampersand: %26
            const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=%F0%9F%92%8D+Boda+Dora+%26+Gregorio&dates=20260313T193000/20260314T000000&location=Barolo+8C+Chapalita&details=Lugar:+Barolo+8C+Chapalita`;
            window.open(calendarUrl, '_blank', 'noopener,noreferrer');
        });

        // Manejo de RSVP (Sin WhatsApp)
        const submitBtn = domElements.formRsvp.querySelector('button[type="submit"]');

        domElements.formRsvp.addEventListener('submit', (e) => {
            e.preventDefault();

            // Prevenir doble clic y dar feedback
            submitBtn.disabled = true;
            submitBtn.textContent = 'Enviando...';

            const attendance = domElements.attendanceSelect.value;
            const data = {
                guest: GUEST_DATA.name,
                attendance: attendance === 'yes' ? 'Confirma' : 'Declina',
                adults: attendance === 'yes' ? domElements.adultsInput.value : 0,
                kids: attendance === 'yes' ? domElements.kidsInput.value : 0,
                allergies: attendance === 'yes' ? document.getElementById('allergies').value : 'N/A'
            };

            const SHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbwiv7Tdgsnvv6K9qXfNMdo6QPubpmyg6FD5rznLRkld/exec'; // Cambiado de /dev a /exec para producción

            // Enviar datos a Google Sheets
            fetch(SHEET_WEBHOOK_URL, {
                method: 'POST',
                mode: 'no-cors', // Permite enviar datos incluso si el script no devuelve cabeceras CORS
                cache: 'no-cache',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            }).then(() => {
                // Feedback de éxito
                domElements.formRsvp.reset();
                domElements.rsvpDetails.classList.add('hidden-field');
                submitBtn.textContent = '¡Gracias!';

                setTimeout(() => {
                    const finalSection = document.getElementById('final-screen');
                    if (finalSection) {
                        finalSection.scrollIntoView({ behavior: 'smooth' });
                    }
                }, 500);
            }).catch(error => {
                console.error('Error al enviar RSVP:', error);
                submitBtn.textContent = 'Error';
                submitBtn.disabled = false;
            });
        });
    };

    /**
     * Lógica UX Adicional: Gestor de Pestañas, Condicional de RSVP y Animaciones de Scroll
     */
    const initEnhancements = () => {
        // 1. Pausar música automáticamente cuando la pestaña está inactiva o cambia de app en móvil
        const handleAppBackground = () => {
            if (isPlaying && !domElements.audioInput.paused) {
                domElements.audioInput.pause();
                domElements.musicToggleBtn.classList.remove('playing');
                domElements.musicToggleBtn.setAttribute('aria-pressed', 'false');
            }
        };

        const handleAppForeground = () => {
            // Only resume if it was explicitly playing before backgrounding
            if (isPlaying && document.visibilityState === 'visible') {
                domElements.audioInput.play().catch(e => console.warn('Auto-play blocked.', e));
                domElements.playIcon.classList.replace('fa-play', 'fa-pause');
                domElements.musicToggleBtn.setAttribute('aria-pressed', 'true');
            }
        };

        // Visibility API (Modern Desktop & Mobile) - Uso estricto de visibilityState
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === 'hidden') {
                handleAppBackground();
            } else if (document.visibilityState === 'visible') {
                handleAppForeground();
            }
        }, false);

        // Soporte extra para iOS Safari / Android Chrome
        window.addEventListener("pagehide", handleAppBackground, false);
        window.addEventListener("blur", handleAppBackground, false);
        window.addEventListener("focus", handleAppForeground, false);

        // 2. Lógica Condicional de RSVP: Mostrar detalles solo si asiste
        domElements.attendanceSelect.addEventListener('change', (e) => {
            if (e.target.value === 'yes') {
                domElements.rsvpDetails.classList.remove('hidden-field');
                // Pre-llenar con datos de URL si existen
                domElements.adultsInput.value = GUEST_DATA.adults;
                domElements.kidsInput.value = GUEST_DATA.kids;
            } else {
                domElements.rsvpDetails.classList.add('hidden-field');
            }
        });

        // 4. Animaciones al hacer Scroll (Intersection Observer Mejorado)
        if ('IntersectionObserver' in window) {
            const observerOptions = {
                root: null,
                threshold: 0.1,
                rootMargin: "0px"
            };
            const observer = new IntersectionObserver((entries, observerObj) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible', 'active');

                        // Trigger staggered children if any
                        const staggers = entry.target.querySelectorAll('.stagger-item');
                        staggers.forEach((item, index) => {
                            setTimeout(() => item.classList.add('active'), index * 150);
                        });

                        observerObj.unobserve(entry.target);
                    }
                });
            }, observerOptions);

            document.querySelectorAll('.animate-on-scroll, .reveal').forEach(el => observer.observe(el));
        }

        // 5. Partículas de Fondo
        const initParticles = () => {
            if (!domElements.particlesContainer) return;

            const particleCount = 20;
            for (let i = 0; i < particleCount; i++) {
                const p = document.createElement('div');
                p.className = 'particle';
                const size = Math.random() * 4 + 2 + 'px';
                p.style.width = size;
                p.style.height = size;
                p.style.left = Math.random() * 100 + '%';
                p.style.animationDuration = Math.random() * 10 + 10 + 's';
                p.style.animationDelay = Math.random() * 10 + 's';
                domElements.particlesContainer.appendChild(p);
            }
        };
        initParticles();
    };

    // === Arranque de la Aplicación ===
    const bootstrap = () => {
        initCountdown();
        initSplashScreen();
        initUserActions();
        initEnhancements();
    };

    bootstrap();
})();