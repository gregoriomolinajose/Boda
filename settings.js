/**
 * Lógica para la configuración a pantalla completa y el timeline dinámico.
 */

let currentIconTargetId = null;

const ICON_LIST = [
    'fa-leaf', 'fa-heart', 'fa-champagne-glasses', 'fa-utensils', 'fa-music',
    'fa-camera', 'fa-rings-wedding', 'fa-church', 'fa-glass-cheers', 'fa-cake-candles',
    'fa-dove', 'fa-gift', 'fa-envelope', 'fa-map-location-dot', 'fa-clock',
    'fa-star', 'fa-moon', 'fa-sun', 'fa-cloud', 'fa-umbrella',
    'fa-car', 'fa-plane', 'fa-bus', 'fa-train', 'fa-ship',
    'fa-wine-glass', 'fa-martini-glass', 'fa-beer-mug-empty', 'fa-coffee', 'fa-mug-hot',
    'fa-dance', 'fa-users', 'fa-user-friends', 'fa-microphone', 'fa-sparkles',
    'fa-award', 'fa-crown', 'fa-gem', 'fa-anchor', 'fa-key'
];

function toggleSettings(show) {
    const page = document.getElementById('settings-page');
    const container = document.querySelector('.generator-container');

    if (show) {
        populateSettingsForm();
        if (page) page.style.display = 'flex';
        if (container) container.style.display = 'none';
        document.body.style.overflow = 'hidden';
    } else {
        if (page) page.style.display = 'none';
        if (container) container.style.display = 'grid';
        document.body.style.overflow = 'auto';
    }
}

function populateSettingsForm() {
    // Anfitriones
    document.getElementById('set-wedding-names').value = APP_CONFIG.wedding.names;

    // Fecha y Hora
    const weddingDateObj = new Date(APP_CONFIG.wedding.date);

    // Extraer componentes en local time
    const year = weddingDateObj.getFullYear();
    const month = String(weddingDateObj.getMonth() + 1).padStart(2, '0');
    const day = String(weddingDateObj.getDate()).padStart(2, '0');
    const hours = String(weddingDateObj.getHours()).padStart(2, '0');
    const minutes = String(weddingDateObj.getMinutes()).padStart(2, '0');

    const dateStr = `${year}-${month}-${day}`;
    const timeStr = `${hours}:${minutes}`;

    document.getElementById('set-wedding-date-picker').value = dateStr;
    document.getElementById('set-wedding-time-picker').value = timeStr;

    // Toggle Contador
    document.getElementById('set-show-countdown').checked = APP_CONFIG.ui.showCountdown !== false;

    // Otros
    document.getElementById('set-physical-location').value = APP_CONFIG.wedding.location.physical;
    document.getElementById('set-virtual-location').value = APP_CONFIG.wedding.location.virtual;
    document.getElementById('set-base-url').value = APP_CONFIG.ui.baseUrl;
    document.getElementById('set-webhook-url').value = APP_CONFIG.api.sheetWebhook;

    renderTimelineUI();
}

function renderTimelineUI() {
    const container = document.getElementById('timeline-builder-container');
    if (!container) return;

    container.innerHTML = '';

    const timeline = APP_CONFIG.timeline || [];
    timeline.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'timeline-builder-item';
        row.innerHTML = `
            <button class="icon-selector-btn" onclick="openIconPicker('timeline-icon-${index}')" id="timeline-icon-${index}" data-icon="${item.icon}">
                <i class="fas ${item.icon}"></i>
            </button>
            <input type="time" class="set-timeline-time" value="${item.time}">
            <input type="text" class="set-timeline-activity" value="${item.activity}" placeholder="Actividad">
            <div class="remove-item" onclick="removeTimelineItem(${index})">
                <i class="fas fa-trash-alt"></i>
            </div>
        `;
        container.appendChild(row);
    });
}

function addTimelineItem() {
    if (!APP_CONFIG.timeline) APP_CONFIG.timeline = [];
    APP_CONFIG.timeline.push({ time: "12:00", activity: "", icon: "fa-leaf" });
    renderTimelineUI();
}

function removeTimelineItem(index) {
    APP_CONFIG.timeline.splice(index, 1);
    renderTimelineUI();
}

function openIconPicker(targetId) {
    currentIconTargetId = targetId;
    const grid = document.getElementById('icon-grid');
    grid.innerHTML = '';

    ICON_LIST.forEach(icon => {
        const div = document.createElement('div');
        div.className = 'icon-option';
        div.innerHTML = `<i class="fas ${icon}"></i>`;
        div.onclick = () => selectIcon(icon);
        grid.appendChild(div);
    });

    document.getElementById('modal-icon-picker').style.display = 'flex';
}

function selectIcon(icon) {
    const btn = document.getElementById(currentIconTargetId);
    if (btn) {
        btn.innerHTML = `<i class="fas ${icon}"></i>`;
        btn.dataset.icon = icon;
    }
    closeIconPicker();
}

function closeIconPicker() {
    document.getElementById('modal-icon-picker').style.display = 'none';
}

function saveSettings() {
    const date = document.getElementById('set-wedding-date-picker').value;
    const time = document.getElementById('set-wedding-time-picker').value;

    // Actualizar objeto APP_CONFIG
    APP_CONFIG.wedding.names = document.getElementById('set-wedding-names').value;
    APP_CONFIG.wedding.date = `${date} ${time}`;
    APP_CONFIG.ui.showCountdown = document.getElementById('set-show-countdown').checked;

    APP_CONFIG.wedding.location.physical = document.getElementById('set-physical-location').value;
    APP_CONFIG.wedding.location.virtual = document.getElementById('set-virtual-location').value;
    APP_CONFIG.ui.baseUrl = document.getElementById('set-base-url').value;
    APP_CONFIG.api.sheetWebhook = document.getElementById('set-webhook-url').value;

    // Consolidar Timeline
    const items = document.querySelectorAll('.timeline-builder-item');
    const newTimeline = [];
    items.forEach(row => {
        newTimeline.push({
            time: row.querySelector('.set-timeline-time').value,
            activity: row.querySelector('.set-timeline-activity').value,
            icon: row.querySelector('.icon-selector-btn').dataset.icon
        });
    });
    APP_CONFIG.timeline = newTimeline;

    // Guardar en localStorage
    localStorage.setItem('app_settings', JSON.stringify(APP_CONFIG));

    Utils.showToast('toast-container', 'Configuración guardada correctamente.');
    toggleSettings(false);
}
