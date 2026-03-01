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
                const urlParams = new URL(window.location.href).searchParams;
                const isPreview = window !== window.parent || !urlParams.get('event');

                if (!isPreview) {
                    await this.store.saveGuest(formData);
                } else {
                    console.log("Simulación de RSVP exitosa en vista previa. (No guardado en DB)");
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
        if (attendanceSelect && details) {
            attendanceSelect.addEventListener('change', (e) => {
                details.style.display = e.target.value === 'yes' ? 'block' : 'none';
            });
        }
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
