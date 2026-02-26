/**
 * SettingsController.js - Controla el panel de configuración (generador).
 */
import { Helpers } from '../utils/Helpers.js';

export class SettingsController {
    constructor(store, previewIframeId) {
        this.store = store;
        this.previewIframe = document.getElementById(previewIframeId);
        this.initEventListeners();
    }

    initEventListeners() {
        const form = document.getElementById('settings-page');
        if (!form) return;

        // Escuchar cambios en todos los inputs para actualizar el Preview
        form.addEventListener('input', Helpers.debounce(() => {
            this.syncToStore();
            this.notifyPreview();
        }, 300));

        // Botón de guardar
        const saveBtn = document.getElementById('save-settings-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.save());
        }
    }

    /**
     * Sincroniza los valores del formulario al Store.
     */
    syncToStore() {
        const state = this.store.getState();
        const newState = {
            wedding: {
                ...state.wedding,
                names: document.getElementById('set-wedding-names').value,
                // ... más mapeos aquí ...
            }
        };
        this.store.setState(newState);
    }

    /**
     * Envía un mensaje al preview iframe.
     */
    notifyPreview() {
        if (!this.previewIframe || !this.previewIframe.contentWindow) return;
        this.previewIframe.contentWindow.postMessage({
            type: 'UPDATE_CONFIG',
            config: this.store.getState()
        }, '*');
    }

    save() {
        this.syncToStore();
        Helpers.showToast('toast-container', 'Configuración guardada correctamente.');
    }
}
