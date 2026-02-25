/**
 * Lógica para el modal de configuración de parámetros.
 */
function openSettingsModal() {
    const modal = document.getElementById('modal-settings');

    // Cargar valores actuales de APP_CONFIG en el formulario
    document.getElementById('set-wedding-date').value = APP_CONFIG.wedding.date;
    document.getElementById('set-wedding-names').value = APP_CONFIG.wedding.names;
    document.getElementById('set-physical-location').value = APP_CONFIG.wedding.location.physical;
    document.getElementById('set-virtual-location').value = APP_CONFIG.wedding.location.virtual;
    document.getElementById('set-base-url').value = APP_CONFIG.ui.baseUrl;
    document.getElementById('set-webhook-url').value = APP_CONFIG.api.sheetWebhook;
    document.getElementById('set-music-volume').value = APP_CONFIG.ui.musicVolume;

    if (modal) modal.style.display = 'flex';
}

function closeSettingsModal() {
    const modal = document.getElementById('modal-settings');
    if (modal) modal.style.display = 'none';
}

function saveSettings() {
    // Actualizar objeto APP_CONFIG en memoria
    APP_CONFIG.wedding.date = document.getElementById('set-wedding-date').value;
    APP_CONFIG.wedding.names = document.getElementById('set-wedding-names').value;
    APP_CONFIG.wedding.location.physical = document.getElementById('set-physical-location').value;
    APP_CONFIG.wedding.location.virtual = document.getElementById('set-virtual-location').value;
    APP_CONFIG.ui.baseUrl = document.getElementById('set-base-url').value;
    APP_CONFIG.api.sheetWebhook = document.getElementById('set-webhook-url').value;
    APP_CONFIG.ui.musicVolume = parseFloat(document.getElementById('set-music-volume').value);

    // Guardar en localStorage para persistencia local
    localStorage.setItem('app_settings', JSON.stringify(APP_CONFIG));

    Utils.showToast('toast-container', 'Configuración guardada correctamente. Algunos cambios pueden requerir recargar la página.');
    closeSettingsModal();
}

/**
 * Carga la configuración guardada al iniciar.
 */
function loadPersistedSettings() {
    const saved = localStorage.getItem('app_settings');
    if (saved) {
        const parsed = JSON.parse(saved);
        // Mezclar con la configuración por defecto
        Object.assign(APP_CONFIG.wedding, parsed.wedding);
        Object.assign(APP_CONFIG.api, parsed.api);
        Object.assign(APP_CONFIG.ui, parsed.ui);
    }
}

// Cargar configuración al inicio del script
loadPersistedSettings();
