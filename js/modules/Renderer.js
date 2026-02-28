/**
 * Renderer.js - Maneja el renderizado de la invitación basado en el estado.
 */
import { Helpers } from '../utils/Helpers.js';

export class Renderer {
    constructor(domElements) {
        this.domElements = domElements;
    }

    /**
     * Renderiza todo el contenido dinámico de la invitación.
     * @param {Object} state - El estado central de la aplicación.
     */
    render(state) {
        const wedding = state.wedding || {};
        const ui = state.ui || {};

        // --- Splash & Hero ---
        if (this.domElements.hostNamesSplash) this.domElements.hostNamesSplash.innerText = wedding.names || "";
        if (this.domElements.heroNames) this.domElements.heroNames.innerText = wedding.names || "";
        if (this.domElements.hostNamesFinal) this.domElements.hostNamesFinal.innerText = wedding.names || "";

        if (this.domElements.eventDateHero) this.domElements.eventDateHero.innerText = Helpers.formatHeroDate(wedding.date);
        if (this.domElements.weddingSubject) this.domElements.weddingSubject.innerText = wedding.subject || "Nuestra Boda";
        if (this.domElements.weddingMessage) this.domElements.weddingMessage.innerText = wedding.message || "";
        if (this.domElements.guestWelcome) this.domElements.guestWelcome.innerText = wedding.demoGuestName || "";

        // Foto del Anfitrión
        if (this.domElements.heroImg) {
            const photoUrl = wedding.photo || '';
            if (photoUrl && !photoUrl.includes('placeholder') && !photoUrl.includes('placehold.co')) {
                this.domElements.heroImg.style.backgroundImage = `url("${photoUrl}")`;
            } else {
                this.domElements.heroImg.style.backgroundImage = '';
            }
        }

        // --- Details ---
        if (this.domElements.locationPhysical) this.domElements.locationPhysical.innerText = wedding.location?.physical || "";
        if (this.domElements.dateDisplay) this.domElements.dateDisplay.innerHTML = Helpers.formatDisplayDate(wedding.date);

        // Agendar Button (Google Calendar Link)
        const addToCalendarBtn = document.getElementById('add-to-calendar');
        if (addToCalendarBtn) {
            addToCalendarBtn.href = Helpers.generateCalendarLink(wedding);
        }

        // --- RSVP Section ---
        const rsvp = wedding.rsvp || {};
        if (this.domElements.rsvpTitle) this.domElements.rsvpTitle.innerText = rsvp.title || "Confirmar Asistencia";
        if (this.domElements.rsvpDescription) this.domElements.rsvpDescription.innerText = rsvp.description || "";

        if (this.domElements.wrapperAdults)
            this.domElements.wrapperAdults.style.display = (rsvp.showAdults !== false && String(rsvp.showAdults) !== 'false') ? 'block' : 'none';
        if (this.domElements.wrapperKids)
            this.domElements.wrapperKids.style.display = (rsvp.showKids !== false && String(rsvp.showKids) !== 'false') ? 'block' : 'none';
        if (this.domElements.wrapperAllergies)
            this.domElements.wrapperAllergies.style.display = (rsvp.showAllergies !== false && String(rsvp.showAllergies) !== 'false') ? 'block' : 'none';

        // --- Populate RSVP fields from URL data if available ---
        const inputAdults = document.getElementById('adults');
        const inputKids = document.getElementById('kids');
        if (inputAdults && wedding.adultsCount && !inputAdults.dataset.initialized) {
            inputAdults.value = wedding.adultsCount;
            inputAdults.dataset.initialized = "true";
        }
        if (inputKids && wedding.kidsCount !== undefined && !inputKids.dataset.initialized) {
            inputKids.value = wedding.kidsCount;
            inputKids.dataset.initialized = "true";
        }

        // --- Final Messages ---
        const conf = wedding.confirmation || {};
        if (this.domElements.finalTitleYes) this.domElements.finalTitleYes.innerText = conf.yes?.title || "Te esperamos";
        if (this.domElements.finalDescYes) this.domElements.finalDescYes.innerText = conf.yes?.description || "";
        if (this.domElements.finalTitleNo) this.domElements.finalTitleNo.innerText = conf.no?.title || "¡Te extrañaremos!";
        if (this.domElements.finalDescNo) this.domElements.finalDescNo.innerText = conf.no?.description || "";

        // --- Gifts Section ---
        const gf = wedding.gifts || {};
        const logsSection = document.getElementById('logistics-section');
        if (logsSection) {
            const dc = wedding.dressCode || {};
            logsSection.style.display = (dc.show !== false || gf.show !== false) ? 'flex' : 'none';

            // Update Dress Code labels
            const dcTitle = document.getElementById('dress-code-title');
            const dcDesc = document.getElementById('dress-code-description');
            const dcTip = document.getElementById('dress-code-tip');
            if (dcTitle) dcTitle.innerText = dc.title || "Código de vestimenta";
            if (dcDesc) dcDesc.innerText = dc.description || "";
            if (dcTip) dcTip.innerText = dc.tip || "";

            // Update Gift labels
            const gfTitle = document.getElementById('gifts-title');
            const gfDesc = document.getElementById('gifts-description');
            if (gfTitle) gfTitle.innerText = gf.title || "Regalos";
            if (gfDesc) gfDesc.innerText = gf.description || "";
        }

        const btnRegistry = document.getElementById('btn-gift-registry');
        const btnBank = document.getElementById('btn-bank-details');
        if (btnRegistry) {
            const reg = gf.registryButton || {};
            btnRegistry.style.display = (reg.show !== false && reg.url) ? 'flex' : 'none';
            btnRegistry.href = reg.url || "#";
        }
        if (btnBank) {
            const bank = gf.bankButton || {};
            btnBank.style.display = (bank.show !== false && bank.details) ? 'flex' : 'none';
            const bankCont = document.getElementById('bank-details-container');
            if (bankCont) bankCont.innerText = bank.details || "";
        }

        // --- Timeline ---
        this.renderTimeline(state.timeline, ui.iconColor, ui.timelineAlign);

        // --- Countdown ---
        const countdownContainer = document.getElementById('countdown');
        if (countdownContainer) {
            countdownContainer.style.display = ui.showCountdown !== false ? 'flex' : 'none';
            if (ui.showCountdown !== false) {
                this.initCountdown(wedding.date);
            }
        }
    }

    /**
     * Inicializa el contador regresivo.
     */
    initCountdown(targetDate) {
        const ui = {
            d: document.getElementById("days"),
            h: document.getElementById("hours"),
            m: document.getElementById("minutes"),
            s: document.getElementById("seconds")
        };

        if (!ui.d) return;

        const updateTime = () => {
            const now = new Date().getTime();
            const weddingTime = new Date(targetDate).getTime();
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

        if (this.countdownInterval) clearInterval(this.countdownInterval);
        updateTime();
        this.countdownInterval = setInterval(updateTime, 1000);
    }

    /**
     * Renderiza el itinerario dinámico.
     */
    renderTimeline(timeline = [], iconColor = '#80a040', alignment = 'center') {
        const container = document.getElementById('timeline-container');
        if (!container) return;

        container.className = `timeline-container align-${alignment}`;
        container.innerHTML = '';
        timeline.forEach(item => {
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
            container.appendChild(row);
        });
    }
}
