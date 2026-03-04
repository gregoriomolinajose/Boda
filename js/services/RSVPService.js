import { Helpers } from '../utils/Helpers.js';

export class RSVPService {
    constructor(store) {
        this.store = store;
    }

    init() {
        const form = document.getElementById('wedding-rsvp');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.innerText;

            btn.innerText = 'Enviando...';
            btn.disabled = true;

            const state = this.store.getState();
            const authorizedAdults = state.wedding?.adultsCount || 0;
            const authorizedKids = state.wedding?.kidsCount || 0;

            const inputAdults = parseInt(document.getElementById('adults')?.value || 0);
            const inputKids = parseInt(document.getElementById('kids')?.value || 0);

            // Validar límites lógicos (seguridad)
            if (document.getElementById('attendance').value === 'yes') {
                if (inputAdults > authorizedAdults || inputKids > authorizedKids) {
                    Helpers.showToast('toast-container', `Máximo permitido: ${authorizedAdults} adultos y ${authorizedKids} niños.`, 'error');
                    btn.innerText = originalText;
                    btn.disabled = false;
                    return;
                }
            }

            const formData = {
                id: state.wedding?.guestUuid || 'UNKNOWN',
                action: 'confirm',
                guest: state.wedding?.demoGuestName || 'Invitado Desconocido',
                attendance: document.getElementById('attendance').value === 'yes' ? 'Confirma' : 'Declina',
                adults: inputAdults,
                kids: inputKids,
                allergies: document.getElementById('allergies')?.value || 'N/A'
            };

            try {
                const urlParams = new URL(window.location.href).searchParams;
                const isPreview = window !== window.parent || !urlParams.get('event');

                if (!isPreview) {
                    await this.store.saveGuest(formData);
                } else {
                    await new Promise(resolve => setTimeout(resolve, 800));
                }

                this.showFinalScreen(formData.attendance);
                Helpers.showToast('toast-container', '¡Asistencia confirmada!');
            } catch (err) {
                console.error("Error al enviar RSVP:", err);
                Helpers.showToast('toast-container', 'Error al enviar confirmación', 'error');
                btn.innerText = originalText;
                btn.disabled = false;
            }
        });

        const attendanceSelect = document.getElementById('attendance');
        const details = document.getElementById('rsvp-details');
        const inputAdults = document.getElementById('adults');
        const inputKids = document.getElementById('kids');

        if (attendanceSelect && details) {
            attendanceSelect.addEventListener('change', (e) => {
                details.style.display = e.target.value === 'yes' ? 'block' : 'none';
            });
        }

        // Refuerzo en tiempo real: No permitir escribir más del máximo
        [inputAdults, inputKids].forEach(input => {
            if (input) {
                input.addEventListener('input', () => {
                    const max = parseInt(input.getAttribute('max'));
                    const val = parseInt(input.value);
                    if (!isNaN(max) && val > max) {
                        input.value = max;
                        Helpers.showToast('toast-container', `El máximo permitido es ${max}.`, 'warning');
                    }
                });
            }
        });
    }

    showFinalScreen(attendanceStr) {
        const rsvpSection = document.getElementById('wedding-rsvp-section');
        if (rsvpSection) rsvpSection.style.display = 'none';

        const finalScreen = document.getElementById('final-screen');
        if (finalScreen) {
            finalScreen.style.display = 'flex';
            finalScreen.scrollIntoView({ behavior: 'smooth' });

            if (attendanceStr === 'Confirma' || attendanceStr === 'yes') {
                document.getElementById('final-msg-yes').style.display = 'block';
                document.getElementById('final-msg-no').style.display = 'none';
            } else {
                document.getElementById('final-msg-yes').style.display = 'none';
                document.getElementById('final-msg-no').style.display = 'block';
            }
        }
    }
}
