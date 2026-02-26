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

        // Nombres en el Hero y Farewell
        if (this.domElements.heroNames) this.domElements.heroNames.innerText = wedding.names;
        if (this.domElements.hostNamesFinal) this.domElements.hostNamesFinal.innerText = wedding.names;

        // Foto del Anfitrión
        if (this.domElements.heroImg) {
            const photoUrl = wedding.photo || '';
            if (photoUrl && !photoUrl.includes('placeholder')) {
                this.domElements.heroImg.style.backgroundImage = `url('${photoUrl}')`;
            } else {
                this.domElements.heroImg.style.backgroundImage = '';
            }
        }

        // --- RSVP Section ---
        const rsvp = wedding.rsvp || {};
        if (this.domElements.rsvpTitle) this.domElements.rsvpTitle.innerText = rsvp.title || "Confirmar Asistencia";
        if (this.domElements.rsvpDescription) this.domElements.rsvpDescription.innerText = rsvp.description || "";

        if (this.domElements.wrapperAdults)
            this.domElements.wrapperAdults.style.display = rsvp.showAdults !== false ? 'block' : 'none';
        if (this.domElements.wrapperKids)
            this.domElements.wrapperKids.style.display = rsvp.showKids !== false ? 'block' : 'none';
        if (this.domElements.wrapperAllergies)
            this.domElements.wrapperAllergies.style.display = rsvp.showAllergies !== false ? 'block' : 'none';

        // --- Gifts Section ---
        const gf = wedding.gifts || {};
        const giftsSection = document.getElementById('logistics-section'); // Contenedor padre
        if (giftsSection) {
            const dc = wedding.dressCode || {};
            giftsSection.style.display = (dc.show !== false || gf.show !== false) ? 'block' : 'none';
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
        this.renderTimeline(state.timeline, ui.iconColor);

        // --- Countdown ---
        this.initCountdown(wedding.date);
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
    renderTimeline(timeline = [], iconColor = '#80a040') {
        const container = document.getElementById('timeline-container');
        if (!container) return;

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
