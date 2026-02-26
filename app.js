/**
 * Módulo principal de la Landing Page de Boda Dora & Gregorio
 */
(() => {
    'use strict';

    // Se asume que config.js y utils.js han sido cargados previamente en el HTML

    const domElements = {
        splash: document.getElementById('splash'),
        enterBtn: document.getElementById('enter-site'),
        audioInput: document.getElementById('wedding-song'),
        musicToggleBtn: document.getElementById('music-toggle'),
        playIcon: document.getElementById('play-icon'),
        btnCalendario: document.getElementById('add-to-calendar'),
        formRsvp: document.getElementById('wedding-rsvp'),
        btnScrollHero: document.getElementById('scroll-indicator'),
        particlesContainer: document.getElementById('particles-container'),
        rsvpDetails: document.getElementById('rsvp-details'),
        adultsInput: document.getElementById('adults'),
        kidsInput: document.getElementById('kids'),
        attendanceSelect: document.getElementById('attendance'),
        guestWelcome: document.getElementById('guest-welcome'),
        finalMsgYes: document.getElementById('final-msg-yes'),
        finalMsgNo: document.getElementById('final-msg-no'),
        mainContentSection: document.getElementById('invitation-content') // Asegurar id en HTML
    };

    // Parámetros de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const GUEST_DATA = {
        name: urlParams.get('n') || 'Invitado',
        id: urlParams.get('u') || '',
        adults: parseInt(urlParams.get('ca')) || 1,
        kids: parseInt(urlParams.get('cc')) || 0,
        type: urlParams.get('t') || 'f'
    };

    let isPlaying = false;
    let scrollObserver = null;

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

        if (!ui.d) return;

        const updateTime = () => {
            const now = new Date().getTime();
            const weddingTime = new Date(APP_CONFIG.wedding.date).getTime();
            const dist = weddingTime - now;

            if (dist < 0) {
                Object.values(ui).forEach(el => { if (el) el.innerText = "00"; });
                return;
            }

            ui.d.innerText = Math.floor(dist / (1000 * 60 * 60 * 24)).toString().padStart(2, '0');
            ui.h.innerText = Math.floor((dist % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
            ui.m.innerText = Math.floor((dist % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
            ui.s.innerText = Math.floor((dist % (1000 * 60)) / 1000).toString().padStart(2, '0');
        };

        updateTime();
        setInterval(updateTime, 1000);
    };

    /**
     * Inicializa las partículas ambientales
     */
    const initParticles = () => {
        if (!domElements.particlesContainer) return;

        const createParticle = () => {
            const p = document.createElement('div');
            p.className = 'particle';

            const size = Math.random() * 5 + 2 + 'px';
            p.style.width = size;
            p.style.height = size;

            p.style.left = Math.random() * 100 + 'vw';
            const duration = Math.random() * 10 + 10 + 's';
            p.style.animationDuration = duration;

            domElements.particlesContainer.appendChild(p);

            setTimeout(() => {
                p.remove();
            }, parseFloat(duration) * 1000);
        };

        // Crear partículas iniciales
        for (let i = 0; i < 15; i++) {
            setTimeout(createParticle, Math.random() * 5000);
        }

        setInterval(createParticle, 1500);
    };

    /**
     * Controlador del estado y la UI del reproductor de música
     */
    const toggleMusic = () => {
        if (!domElements.audioInput) return;
        const isPaused = domElements.audioInput.paused;

        if (isPaused) {
            domElements.audioInput.play().catch(e => console.warn('Bloqueo de Auto-play.', e));
            if (domElements.musicToggleBtn) domElements.musicToggleBtn.classList.add('playing');
        } else {
            domElements.audioInput.pause();
            if (domElements.musicToggleBtn) domElements.musicToggleBtn.classList.remove('playing');
        }
        isPlaying = !isPaused;
    };

    /**
     * Coordina el Splash Screen
     */
    const initSplashScreen = () => {
        if (!domElements.enterBtn) return;

        if (domElements.audioInput) {
            domElements.audioInput.volume = APP_CONFIG.ui.musicVolume;
        }

        domElements.enterBtn.addEventListener('click', () => {
            if (GUEST_DATA.name && GUEST_DATA.name !== 'Invitado' && domElements.guestWelcome) {
                domElements.guestWelcome.innerText = GUEST_DATA.name;
            }

            if (GUEST_DATA.type === 'd') {
                const elementsToHide = ['location-box', 'view-map-btn', 'dress-code-section'];
                elementsToHide.forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.classList.add('hidden-field');
                });
            }

            document.body.classList.add('show-content');
            toggleMusic();
        });
    };

    /**
     * Manejador de eventos de usuario
     */
    const initUserActions = () => {
        if (domElements.musicToggleBtn) domElements.musicToggleBtn.addEventListener('click', toggleMusic);

        if (domElements.btnScrollHero) {
            domElements.btnScrollHero.addEventListener('click', () => {
                const target = document.querySelector('.content-card') || domElements.mainContentSection;
                if (target) target.scrollIntoView({ behavior: 'smooth' });
            });
        }

        if (domElements.btnCalendario) {
            domElements.btnCalendario.addEventListener('click', (e) => {
                e.preventDefault();
                let calendarUrl = '';
                const weddingDateObj = new Date(APP_CONFIG.wedding.date);
                const dateStr = weddingDateObj.toISOString().replace(/-|:|\.\d\d\d/g, "");

                if (GUEST_DATA.type === 'd') {
                    calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(APP_CONFIG.wedding.names + ' (Virtual)')}&dates=${dateStr}/${dateStr}&details=Boda+Virtual&location=${encodeURIComponent(APP_CONFIG.wedding.location.virtual)}`;
                } else {
                    calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(APP_CONFIG.wedding.names)}&dates=${dateStr}/${dateStr}&location=${encodeURIComponent(APP_CONFIG.wedding.location.physical)}&details=Lugar:+${encodeURIComponent(APP_CONFIG.wedding.location.physical)}`;
                }
                window.open(calendarUrl, '_blank', 'noopener,noreferrer');
            });
        }

        // RSVP Logic
        if (domElements.formRsvp) {
            const submitBtn = domElements.formRsvp.querySelector('button[type="submit"]');
            domElements.formRsvp.addEventListener('submit', (e) => {
                e.preventDefault();
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Enviando...';
                }

                const attendance = domElements.attendanceSelect.value;
                const data = {
                    id: GUEST_DATA.id,
                    guest: GUEST_DATA.name,
                    attendance: attendance === 'yes' ? 'Confirma' : 'Declina',
                    adults: attendance === 'yes' ? domElements.adultsInput.value : 0,
                    kids: attendance === 'yes' ? domElements.kidsInput.value : 0,
                    allergies: attendance === 'yes' ? (document.getElementById('allergies')?.value || 'N/A') : 'N/A',
                    link: window.location.href
                };

                fetch(APP_CONFIG.api.sheetWebhook, {
                    method: 'POST',
                    mode: 'no-cors',
                    cache: 'no-cache',
                    headers: { 'Content-Type': 'text/plain' },
                    body: JSON.stringify(data)
                }).then(() => {
                    domElements.formRsvp.reset();
                    if (domElements.rsvpDetails) domElements.rsvpDetails.classList.add('hidden-field');
                    if (submitBtn) submitBtn.textContent = '¡Gracias!';

                    if (attendance === 'yes') {
                        if (domElements.finalMsgYes) domElements.finalMsgYes.classList.remove('hidden-field');
                        if (domElements.finalMsgNo) domElements.finalMsgNo.classList.add('hidden-field');
                    } else {
                        if (domElements.finalMsgYes) domElements.finalMsgYes.classList.add('hidden-field');
                        if (domElements.finalMsgNo) domElements.finalMsgNo.classList.remove('hidden-field');
                    }

                    setTimeout(() => {
                        const finalSection = document.getElementById('final-screen');
                        if (finalSection) finalSection.scrollIntoView({ behavior: 'smooth' });
                    }, 800);
                }).catch(error => {
                    console.error('Error al enviar RSVP:', error);
                    if (submitBtn) {
                        submitBtn.textContent = 'Error';
                        submitBtn.disabled = false;
                    }
                });
            });
        }
    };

    /**
     * Mejoras UX y Animaciones
     */
    const initEnhancements = () => {
        // Pausar música en blur
        window.addEventListener("blur", () => {
            if (isPlaying && domElements.audioInput && !domElements.audioInput.paused) {
                domElements.audioInput.pause();
                if (domElements.musicToggleBtn) domElements.musicToggleBtn.classList.remove('playing');
            }
        });

        if (domElements.attendanceSelect) {
            domElements.attendanceSelect.addEventListener('change', (e) => {
                if (e.target.value === 'yes' && domElements.rsvpDetails) {
                    domElements.rsvpDetails.classList.remove('hidden-field');
                    domElements.adultsInput.value = GUEST_DATA.adults;
                    domElements.kidsInput.value = GUEST_DATA.kids;
                } else if (domElements.rsvpDetails) {
                    domElements.rsvpDetails.classList.add('hidden-field');
                }
            });
        }

        // Intersection Observer
        if ('IntersectionObserver' in window) {
            scrollObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible', 'active');
                    }
                });
            }, { threshold: 0.1 });

            document.querySelectorAll('.animate-on-scroll, .reveal, .stagger-item').forEach(el => scrollObserver.observe(el));
        }
    };

    /**
     * Aplica estilos dinámicos (colores y fuentes) basados en la configuración
     */
    const applyDynamicStyles = () => {
        const ui = APP_CONFIG.ui;
        const root = document.documentElement;

        // Aplicar Colores
        if (ui.primaryBlue) root.style.setProperty('--primary-blue', ui.primaryBlue);
        if (ui.primaryOlive) {
            root.style.setProperty('--primary-olive', ui.primaryOlive);
            // También calcular un color de fondo ultra-suave basado en el olivo
            root.style.setProperty('--primary-olive-light', `${ui.primaryOlive}15`); // 15 es aprox 8% de opacidad en hex
        }

        // Aplicar Fuentes
        if (ui.fontPrimary) root.style.setProperty('--font-primary', `'${ui.fontPrimary}', sans-serif`);
        if (ui.fontScript) root.style.setProperty('--font-script', `'${ui.fontScript}', cursive`);

        // Cargar Google Fonts dinámicamente si no están ya
        const fontsToLoad = [];
        if (ui.fontPrimary && ui.fontPrimary !== 'Montserrat') fontsToLoad.push(ui.fontPrimary);
        if (ui.fontScript && ui.fontScript !== 'Great Vibes') fontsToLoad.push(ui.fontScript);

        if (fontsToLoad.length > 0) {
            const fontFamilies = fontsToLoad.map(f => `family=${f.replace(/ /g, '+')}:wght@300;400;600`).join('&');
            const linkId = 'dynamic-google-fonts';
            let link = document.getElementById(linkId);
            if (!link) {
                link = document.createElement('link');
                link.id = linkId;
                link.rel = 'stylesheet';
                document.head.appendChild(link);
            }
            link.href = `https://fonts.googleapis.com/css2?${fontFamilies}&display=swap`;
        }
    };

    /**
     * Renderiza dinámicamente el contenido basado en la configuración
     */
    const renderDynamicContent = () => {
        applyDynamicStyles();

        // Nombres (múltiples lugares)
        const hostElements = ['wedding-names-main', 'host-names-splash', 'host-names-hero', 'host-names-final'];
        hostElements.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerText = APP_CONFIG.wedding.names;
        });

        // Nombre del Invitado (Solo para Demo en Preview)
        const guestNameEl = document.getElementById('guest-welcome');
        if (guestNameEl && APP_CONFIG.wedding.demoGuestName) {
            guestNameEl.innerText = APP_CONFIG.wedding.demoGuestName;
        } else if (guestNameEl && GUEST_DATA.name && GUEST_DATA.name !== 'Invitado') {
            guestNameEl.innerText = GUEST_DATA.name;
        }

        // Mensaje de Bienvenida (Palabras del anfitrión)
        const messageEl = document.getElementById('wedding-message-display');
        if (messageEl) {
            messageEl.innerText = APP_CONFIG.wedding.message || "";
        }

        // Título del Evento (Motivo)
        const subjectEl = document.getElementById('wedding-subject-display');
        if (subjectEl) {
            subjectEl.innerText = APP_CONFIG.wedding.subject || "Nuestra Boda";
        }

        // --- Logística y Detalles ---
        // Código de Vestimenta
        const dressCodeSection = document.getElementById('dress-code-section');
        if (dressCodeSection) {
            const dc = APP_CONFIG.wedding.dressCode || {};
            dressCodeSection.style.display = dc.show !== false ? 'flex' : 'none';

            const dcTitle = document.getElementById('dress-code-title');
            if (dcTitle) dcTitle.innerText = dc.title || "Código de vestimenta";

            const dcDesc = document.getElementById('dress-code-description');
            if (dcDesc) dcDesc.innerText = dc.description || "Formal Cocktail";

            const dcTip = document.getElementById('dress-code-tip');
            if (dcTip) dcTip.innerText = dc.tip || "¡Luce tu mejor Look!";
        }

        // Regalos
        const giftsSection = document.getElementById('gifts-section');
        const gf = APP_CONFIG.wedding.gifts || {};
        if (giftsSection) {
            giftsSection.style.display = gf.show !== false ? 'block' : 'none';

            const gfTitle = document.getElementById('gifts-title');
            if (gfTitle) gfTitle.innerText = gf.title || "Regalos";

            const gfDesc = document.getElementById('gifts-description');
            if (gfDesc) gfDesc.innerText = gf.description || "Lo más importante es tu presencia.";
        }

        // --- Regla: Ocultar sección completa si ambos están desactivados ---
        const logisticsSection = document.getElementById('logistics-section');
        if (logisticsSection) {
            const dc = APP_CONFIG.wedding.dressCode || {};
            const showDress = dc.show !== false;
            const showGifts = gf.show !== false;
            logisticsSection.style.display = (showDress || showGifts) ? 'block' : 'none';
        }

        // Foto del Anfitrión (Hero)
        const heroImg = document.getElementById('hero-img-display');
        if (heroImg) {
            const photoUrl = APP_CONFIG.wedding.photo || '';
            if (photoUrl && !photoUrl.includes('placeholder')) {
                heroImg.style.backgroundImage = `url('${photoUrl}')`;
                heroImg.style.backgroundSize = 'cover';
            } else {
                // Background por defecto si no hay foto
                heroImg.style.backgroundImage = '';
            }
        }

        // Ubicación (Texto)
        const locEl = document.getElementById('wedding-location-physical');
        if (locEl) locEl.innerText = APP_CONFIG.wedding.location.physical || "";

        const virtEl = document.getElementById('wedding-location-virtual');
        if (virtEl) {
            if (APP_CONFIG.wedding.location.virtual) {
                virtEl.innerText = APP_CONFIG.wedding.location.virtual;
                virtEl.style.display = 'block';
            } else {
                virtEl.style.display = 'none';
            }
        }

        // Fecha (Texto y Hero)
        const weddingDate = new Date(APP_CONFIG.wedding.date);

        // Formato para sección "Cuándo"
        const dateEl = document.getElementById('wedding-date-display');
        if (dateEl) {
            const options = { day: 'numeric', month: 'long', year: 'numeric' };
            const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
            dateEl.innerHTML = `${weddingDate.toLocaleDateString('es-ES', options)}<br>${weddingDate.toLocaleTimeString('es-ES', timeOptions)}`;
        }

        // Formato para Hero (VIERNES | 13 MARZO | 2026)
        const heroDateEl = document.getElementById('event-date-hero');
        if (heroDateEl) {
            const dayName = weddingDate.toLocaleDateString('es-ES', { weekday: 'long' }).toUpperCase();
            const day = weddingDate.getDate();
            const monthName = weddingDate.toLocaleDateString('es-ES', { month: 'long' }).toUpperCase();
            const year = weddingDate.getFullYear();
            heroDateEl.innerText = `${dayName} | ${day} ${monthName} | ${year}`;
        }

        // Toggle Contador
        const timer = document.getElementById('countdown');
        if (timer) {
            const shouldShow = APP_CONFIG.ui.showCountdown !== false;
            timer.style.display = shouldShow ? 'flex' : 'none';
            // También ocultar el texto decorativo si se apaga
            const tagline = document.querySelector('.tagline-style');
            if (tagline) tagline.style.display = shouldShow ? 'block' : 'none';
        }

        // Renderizar Timeline
        const timelineContainer = document.getElementById('timeline-container');
        if (timelineContainer && APP_CONFIG.timeline) {
            timelineContainer.innerHTML = '';
            const iconColor = APP_CONFIG.ui.iconColor || '#80a040';

            APP_CONFIG.timeline.forEach(item => {
                const row = document.createElement('div');
                row.className = 'timeline-item animate-on-scroll';
                row.innerHTML = `
                    <div class="timeline-icon" style="background-color: white; border: 2px solid ${iconColor}">
                        <i class="fa-solid ${item.icon}" style="color: ${iconColor}; font-weight: 900;"></i>
                    </div>
                    <div class="timeline-content">
                        <div class="time">${item.time}</div>
                        <div class="event">${item.activity}</div>
                    </div>
                `;
                timelineContainer.appendChild(row);
                if (scrollObserver) scrollObserver.observe(row);
            });
        }
    };

    // Arranque
    document.addEventListener('DOMContentLoaded', () => {
        // Cargar configuración persistente si existe
        const saved = localStorage.getItem('app_settings');
        if (saved) {
            const parsed = JSON.parse(saved);
            Object.assign(APP_CONFIG.wedding, parsed.wedding);
            Object.assign(APP_CONFIG.ui, parsed.ui);
            Object.assign(APP_CONFIG.api, parsed.api);
            APP_CONFIG.timeline = parsed.timeline || APP_CONFIG.timeline;
        }

        renderDynamicContent();
        initCountdown();
        initParticles();
        initSplashScreen();
        initUserActions();
        initEnhancements();

        // Escuchar actualizaciones en tiempo real desde el generador (Preview)
        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'UPDATE_CONFIG') {
                const newConfig = event.data.config;
                // Mezclar la nueva configuración con la actual
                if (newConfig.wedding) Object.assign(APP_CONFIG.wedding, newConfig.wedding);
                if (newConfig.ui) Object.assign(APP_CONFIG.ui, newConfig.ui);
                if (newConfig.timeline) APP_CONFIG.timeline = newConfig.timeline;

                renderDynamicContent();
            }
        });
    });
})();