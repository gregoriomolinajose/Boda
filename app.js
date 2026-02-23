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
                btnScrollHero: document.getElementById('scroll-to-next'),
                mainContentSection: document.querySelector('main.content-card')
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
                    domElements.playIcon.classList.replace('fa-play', 'fa-pause');
                    // Add aria state update
                    domElements.musicToggleBtn.setAttribute('aria-pressed', 'true');
                } else {
                    domElements.audioInput.pause();
                    domElements.playIcon.classList.replace('fa-pause', 'fa-play');
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

                // Enviar RSVP al WhatsApp
                const submitBtn = domElements.formRsvp.querySelector('button[type="submit"]');

                domElements.formRsvp.addEventListener('submit', (e) => {
                    e.preventDefault();

                    // Prevenir doble clic y dar feedback
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Procesando...';

                    const name = document.getElementById('name').value.trim();
                    const kids = document.getElementById('kids').value;
                    const asistenciaStatus = document.getElementById('attendance').value;

                    let statusMsg = asistenciaStatus === 'yes' ? 'Confirmo mi asistencia' : 'Lamentablemente no podré asistir';
                    // El mensaje cambia según si asiste o no (sin acompañantes/niños si dice 'no')
                    let msg = `¡Hola! ${statusMsg} a la boda de Dora y Gregorio. \n\nInvitado: ${name}`;
                    if (asistenciaStatus === 'yes') {
                        msg += `\nAcompañantes/Niños: ${kids}`;
                    }

                    const numeroTelefono = "523312345678"; // <--- Ajustar número de WhatsApp destino

                    // setTimeout simula proceso asíncrono y permite feedback en UI
                    setTimeout(() => {
                        window.open(`https://wa.me/${numeroTelefono}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');

                        // Resetear formulario para cuando el usuario vuelva
                        domElements.formRsvp.reset();
                        document.getElementById('kids').classList.remove('hidden-field');
                        document.getElementById('kids').disabled = false;

                        submitBtn.disabled = false;
                        submitBtn.textContent = 'Confirmar';
                    }, 800);
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
                        domElements.playIcon.classList.replace('fa-pause', 'fa-play');
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

                // 2. Lógica Condicional: Ocultar campo de 'niños' si declina asistencia
                const attendanceSelect = document.getElementById('attendance');
                const kidsInput = document.getElementById('kids');
                attendanceSelect.addEventListener('change', (e) => {
                    if (e.target.value === 'no') {
                        kidsInput.classList.add('hidden-field');
                        kidsInput.disabled = true;
                    } else {
                        kidsInput.classList.remove('hidden-field');
                        kidsInput.disabled = false;
                    }
                });

                // 4. Animaciones al hacer Scroll (Intersection Observer)
                if ('IntersectionObserver' in window) {
                    const observerOptions = {
                        root: null,
                        threshold: 0.1,
                        rootMargin: "0px"
                    };
                    const observer = new IntersectionObserver((entries, observerObj) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                entry.target.classList.add('visible');
                                observerObj.unobserve(entry.target); // Animar solo una vez
                            }
                        });
                    }, observerOptions);

                    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
                }
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