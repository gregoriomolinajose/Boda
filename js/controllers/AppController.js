import { Store } from '../core/Store.js';
import { Renderer } from '../modules/Renderer.js';
import { AnimationView } from '../views/AnimationView.js';
import { RSVPService } from '../services/RSVPService.js';

export class AppController {
    constructor() {
        this.store = null;
        this.renderer = null;
        this.animationView = null;
        this.rsvpService = null;
    }

    async init() {
        const urlParams = new URLSearchParams(window.location.search);
        const eventId = urlParams.get('event') || 'default';

        this.store = new Store(window.APP_CONFIG || {}, eventId);

        const guestData = {
            wedding: {
                demoGuestName: urlParams.get('n') || "",
                guestUuid: urlParams.get('u') || "",
                adultsCount: parseInt(urlParams.get('ca')) || 0,
                kidsCount: parseInt(urlParams.get('cc')) || 0,
                invType: urlParams.get('t') || 'f'
            }
        };

        this.initRenderer();

        this.animationView = new AnimationView(this.store);
        this.animationView.init();

        this.rsvpService = new RSVPService(this.store);
        this.rsvpService.init();

        this.initPostMessageListener();

        // Inicializar conectividad y cache local unificado
        await this.store.initialize();

        // Aplicar datos del invitado desde URL después de la inicialización 
        // para asegurar que prevalezcan sobre el caché local (localStorage) o Cloud data
        // Aplicar datos del invitado desde URL siempre que existan parámetros
        if (urlParams.has('n') || urlParams.has('t') || urlParams.has('u') || urlParams.has('ca')) {
            this.store.setState(guestData, true);
        }

        this.renderer.render(this.store.getState());
        this.animationView.renderParticles(this.store.getState());
    }

    initRenderer() {
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

        this.renderer = new Renderer(domElements);

        this.store.subscribe((state) => {
            this.renderer.render(state);
        });
    }



    initPostMessageListener() {
        window.addEventListener('message', (event) => {
            if (event.data.type === 'UPDATE_CONFIG') {
                this.store.setState(event.data.config, true);

                const rsvpSection = document.getElementById('wedding-rsvp-section');
                if (rsvpSection) rsvpSection.style.display = '';

                const finalScreen = document.getElementById('final-screen');
                if (finalScreen) finalScreen.style.display = 'none';

                setTimeout(() => {
                    this.animationView.reObserve();
                }, 100);
            } else if (event.data.type === 'SIMULATE_RSVP') {
                this.rsvpService.showFinalScreen(event.data.state);
            }
        });
    }
}
