/**
 * Lógica para la configuración a pantalla completa y el timeline dinámico.
 */

let currentIconTargetId = null;
let cropper = null;

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

    // Estilos y Colores
    document.getElementById('set-primary-blue').value = APP_CONFIG.ui.primaryBlue || '#93afc2';
    document.getElementById('set-primary-olive').value = APP_CONFIG.ui.primaryOlive || '#6b705c';
    document.getElementById('set-icon-color').value = APP_CONFIG.ui.iconColor || '#80a040';
    document.getElementById('set-font-primary').value = APP_CONFIG.ui.fontPrimary || 'Montserrat';
    document.getElementById('set-font-script').value = APP_CONFIG.ui.fontScript || 'Great Vibes';

    const hostMessage = document.getElementById('set-wedding-message');
    if (hostMessage) hostMessage.value = APP_CONFIG.wedding.message || "";

    const hostSubject = document.getElementById('set-wedding-subject');
    if (hostSubject) hostSubject.value = APP_CONFIG.wedding.subject || "Nuestra Boda";

    const demoGuest = document.getElementById('set-demo-guest-name');
    if (demoGuest) demoGuest.value = APP_CONFIG.wedding.demoGuestName || "";

    // Logística y Detalles
    const dc = APP_CONFIG.wedding.dressCode || {};
    document.getElementById('set-dress-code-show').checked = dc.show !== false;
    document.getElementById('set-dress-code-title').value = dc.title || "";
    document.getElementById('set-dress-code-description').value = dc.description || "";
    document.getElementById('set-dress-code-tip').value = dc.tip || "";

    const gf = APP_CONFIG.wedding.gifts || {};
    document.getElementById('set-gifts-show').checked = gf.show !== false;
    document.getElementById('set-gifts-title').value = gf.title || "";
    document.getElementById('set-gifts-description').value = gf.description || "";

    // Foto del Anfitrión
    const photoPreview = document.getElementById('couple-photo-preview');
    if (photoPreview && APP_CONFIG.wedding.photo) {
        photoPreview.src = APP_CONFIG.wedding.photo;
    }

    renderTimelineUI();

    // Sincronización de color en tiempo real para el builder
    const colorPicker = document.getElementById('set-icon-color');
    if (colorPicker) {
        colorPicker.oninput = (e) => {
            const newColor = e.target.value;
            APP_CONFIG.ui.iconColor = newColor;
            document.querySelectorAll('.icon-selector-btn').forEach(btn => {
                btn.style.borderColor = newColor;
                const icon = btn.querySelector('i');
                if (icon) icon.style.color = newColor;
            });
            notifyPreview();
        };
    }

    // Preview para colores principales
    const primaryBluePicker = document.getElementById('set-primary-blue');
    if (primaryBluePicker) {
        primaryBluePicker.oninput = (e) => {
            document.documentElement.style.setProperty('--primary-blue', e.target.value);
            notifyPreview();
        };
    }

    const inputs = document.querySelectorAll('#settings-page input, #settings-page select, #settings-page textarea');
    inputs.forEach(input => {
        if (input.id !== 'photo-input') {
            input.addEventListener('input', notifyPreview);
        }
    });

    // Eventos para la foto
    const photoInput = document.getElementById('photo-input');
    if (photoInput) {
        photoInput.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    openCropper(event.target.result);
                };
                reader.readAsDataURL(file);
            }
        };
    }
}

function reEditPhoto() {
    if (APP_CONFIG.wedding.photo && !APP_CONFIG.wedding.photo.includes('placeholder')) {
        openCropper(APP_CONFIG.wedding.photo);
    } else {
        Utils.showToast('toast-container', 'Sube una foto primero para poder editarla.');
    }
}

function openCropper(imageSrc) {
    const modal = document.getElementById('modal-cropper');
    const image = document.getElementById('cropper-image');
    image.src = imageSrc;
    modal.style.display = 'flex';

    if (cropper) cropper.destroy();

    cropper = new Cropper(image, {
        aspectRatio: 0.8, // 4:5 por defecto
        viewMode: 1,
        dragMode: 'move',
        guides: true,
        center: true,
        highlight: false,
        cropBoxMovable: true,
        cropBoxResizable: true,
        toggleDragModeOnDblclick: false,
        zoom: function (e) {
            // Sincronizar slider cuando se hace zoom con scroll/gestos
            const slider = document.getElementById('cropper-zoom-slider');
            if (slider) {
                // El zoom de cropper suele ir de 0.1 a 10. Mapeamos a 0-1 aproximado.
                // Usamos logaritmo para que se sienta más natural.
                const ratio = Math.log(e.detail.ratio) / Math.log(10) + 0.1;
                slider.value = Math.max(0, Math.min(1, ratio));
            }
        }
    });

    // Control de Slider de Zoom
    const zoomSlider = document.getElementById('cropper-zoom-slider');
    if (zoomSlider) {
        zoomSlider.value = 0; // Reset
        zoomSlider.oninput = (e) => {
            if (!cropper) return;
            // Mapeo inverso: de 0-1 a 1-10 de escala
            const zoomLevel = Math.pow(10, parseFloat(e.target.value) - 0.1);
            cropper.zoomTo(zoomLevel);
        };
    }

    // Resetear menu de ratios
    document.getElementById('ratio-options').classList.remove('active');
    document.querySelectorAll('.ratio-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('default-ratio-btn').classList.add('active');
}

function toggleRatioMenu() {
    const menu = document.getElementById('ratio-options');
    menu.classList.toggle('active');
}

function setCropRatio(ratio, label, btn) {
    if (!cropper) return;

    cropper.setAspectRatio(ratio);

    // UI feedback
    document.querySelectorAll('.ratio-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    toggleRatioMenu();
}

function closeCropper() {
    document.getElementById('modal-cropper').style.display = 'none';
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }
    // Reset input
    document.getElementById('photo-input').value = '';
}

function applyCrop() {
    if (!cropper) return;

    // Limitar dimensiones para evitar QuotaExceededError en localStorage
    // 1024px es suficiente para una portada nítida
    const canvas = cropper.getCroppedCanvas({
        maxWidth: 1024,
        maxHeight: 1280, // Proporción 4:5
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
    });

    // Calidad 0.7 para mayor compresión sin pérdida visual notable
    const croppedBase64 = canvas.toDataURL('image/jpeg', 0.7);

    // Actualizar preview en settings
    document.getElementById('couple-photo-preview').src = croppedBase64;
    APP_CONFIG.wedding.photo = croppedBase64;

    closeCropper();
    notifyPreview();
}

function deletePhoto() {
    if (confirm('¿Estás seguro de que deseas eliminar la foto de los novios?')) {
        const placeholder = "https://via.placeholder.com/600x600?text=Subir+Foto";
        APP_CONFIG.wedding.photo = placeholder;
        document.getElementById('couple-photo-preview').src = placeholder;
        notifyPreview();
    }
}

function notifyPreview() {
    const iframe = document.getElementById('preview-iframe');
    if (!iframe || !iframe.contentWindow) return;

    const date = document.getElementById('set-wedding-date-picker').value;
    const time = document.getElementById('set-wedding-time-picker').value;

    const configSnapshot = {
        wedding: {
            names: document.getElementById('set-wedding-names').value,
            date: `${date} ${time}`,
            location: {
                physical: document.getElementById('set-physical-location').value,
                virtual: document.getElementById('set-virtual-location').value
            },
            photo: document.getElementById('couple-photo-preview').src,
            message: document.getElementById('set-wedding-message').value,
            subject: document.getElementById('set-wedding-subject').value,
            demoGuestName: document.getElementById('set-demo-guest-name').value,
            dressCode: {
                show: document.getElementById('set-dress-code-show').checked,
                title: document.getElementById('set-dress-code-title').value,
                description: document.getElementById('set-dress-code-description').value,
                tip: document.getElementById('set-dress-code-tip').value
            },
            gifts: {
                show: document.getElementById('set-gifts-show').checked,
                title: document.getElementById('set-gifts-title').value,
                description: document.getElementById('set-gifts-description').value
            }
        },
        ui: {
            showCountdown: document.getElementById('set-show-countdown').checked,
            iconColor: document.getElementById('set-icon-color').value,
            primaryBlue: document.getElementById('set-primary-blue').value,
            primaryOlive: document.getElementById('set-primary-olive').value,
            fontPrimary: document.getElementById('set-font-primary').value,
            fontScript: document.getElementById('set-font-script').value
        },
        // Capturar el timeline actual
        timeline: []
    };

    const timelineItems = document.querySelectorAll('.timeline-builder-item');
    timelineItems.forEach(row => {
        configSnapshot.timeline.push({
            time: row.querySelector('.set-timeline-time').value,
            activity: row.querySelector('.set-timeline-activity').value,
            icon: row.querySelector('.icon-selector-btn').dataset.icon
        });
    });

    iframe.contentWindow.postMessage({
        type: 'UPDATE_CONFIG',
        config: configSnapshot
    }, '*');
}

function renderTimelineUI() {
    const container = document.getElementById('timeline-builder-container');
    if (!container) return;

    container.innerHTML = '';

    const timeline = APP_CONFIG.timeline || [];
    const iconColor = APP_CONFIG.ui.iconColor || '#80a040';

    timeline.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'timeline-builder-item';
        row.dataset.index = index;
        row.innerHTML = `
            <div class="timeline-builder-handle">
                <i class="fas fa-grip-vertical"></i>
            </div>
            <button class="icon-selector-btn" 
                    onclick="openIconPicker('timeline-icon-${index}')" 
                    id="timeline-icon-${index}" 
                    data-icon="${item.icon}"
                    style="border: 2px solid ${iconColor}">
                <i class="fa-solid ${item.icon}" style="color: ${iconColor}; font-weight: 900;"></i>
            </button>
            <input type="time" class="set-timeline-time" value="${item.time}">
            <input type="text" class="set-timeline-activity" value="${item.activity}" placeholder="Actividad">
            <div class="timeline-builder-actions">
                <div class="remove-item" onclick="removeTimelineItem(${index})" title="Eliminar">
                    <i class="fas fa-trash-alt"></i>
                </div>
            </div>
        `;
        container.appendChild(row);
    });

    // Inicializar Sortable
    if (window.Sortable) {
        new Sortable(container, {
            handle: '.timeline-builder-handle',
            animation: 150,
            ghostClass: 'sortable-ghost',
            onEnd: function () {
                // Sincronizar el array con el nuevo orden visual
                const items = container.querySelectorAll('.timeline-builder-item');
                const newTimeline = [];
                items.forEach(row => {
                    newTimeline.push({
                        time: row.querySelector('.set-timeline-time').value,
                        activity: row.querySelector('.set-timeline-activity').value,
                        icon: row.querySelector('.icon-selector-btn').dataset.icon
                    });
                });
                APP_CONFIG.timeline = newTimeline;
                // Re-renderizar para actualizar índices de eventos si es necesario
                renderTimelineUI();
                notifyPreview();
            }
        });
    }
    notifyPreview();
}

function addTimelineItem() {
    // Sincronizar datos actuales antes de añadir para no perder cambios de texto
    syncTimelineData();
    if (!APP_CONFIG.timeline) APP_CONFIG.timeline = [];
    APP_CONFIG.timeline.push({ time: "12:00", activity: "", icon: "fa-leaf" });
    renderTimelineUI();
    notifyPreview();
}

function syncTimelineData() {
    const container = document.getElementById('timeline-builder-container');
    if (!container) return;
    const items = container.querySelectorAll('.timeline-builder-item');
    const currentData = [];
    items.forEach(row => {
        currentData.push({
            time: row.querySelector('.set-timeline-time').value,
            activity: row.querySelector('.set-timeline-activity').value,
            icon: row.querySelector('.icon-selector-btn').dataset.icon
        });
    });
    APP_CONFIG.timeline = currentData;
}

function removeTimelineItem(index) {
    if (confirm('¿Estás seguro de que deseas eliminar esta actividad?')) {
        syncTimelineData();
        APP_CONFIG.timeline.splice(index, 1);
        renderTimelineUI();
        notifyPreview();
    }
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
    APP_CONFIG.wedding.message = document.getElementById('set-wedding-message').value;
    APP_CONFIG.wedding.subject = document.getElementById('set-wedding-subject').value;
    APP_CONFIG.wedding.demoGuestName = document.getElementById('set-demo-guest-name').value;

    // Logística y Detalles
    APP_CONFIG.wedding.dressCode = {
        show: document.getElementById('set-dress-code-show').checked,
        title: document.getElementById('set-dress-code-title').value,
        description: document.getElementById('set-dress-code-description').value,
        tip: document.getElementById('set-dress-code-tip').value
    };
    APP_CONFIG.wedding.gifts = {
        show: document.getElementById('set-gifts-show').checked,
        title: document.getElementById('set-gifts-title').value,
        description: document.getElementById('set-gifts-description').value
    };

    APP_CONFIG.wedding.location.physical = document.getElementById('set-physical-location').value;
    APP_CONFIG.wedding.location.virtual = document.getElementById('set-virtual-location').value;
    APP_CONFIG.api.sheetWebhook = document.getElementById('set-webhook-url').value;

    Object.assign(APP_CONFIG.ui, {
        baseUrl: document.getElementById('set-base-url').value,
        showCountdown: document.getElementById('set-show-countdown').checked,
        iconColor: document.getElementById('set-icon-color').value,
        primaryBlue: document.getElementById('set-primary-blue').value,
        primaryOlive: document.getElementById('set-primary-olive').value,
        fontPrimary: document.getElementById('set-font-primary').value,
        fontScript: document.getElementById('set-font-script').value
    });

    // Consolidar Timeline (para capturar cambios en inputs de texto/hora)
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

    // Guardar en localStorage con manejo de cuota
    try {
        localStorage.setItem('app_settings', JSON.stringify(APP_CONFIG));
        Utils.showToast('toast-container', 'Configuración guardada correctamente.');
        toggleSettings(false);
    } catch (e) {
        console.error("Error al guardar en localStorage:", e);
        if (e.name === 'QuotaExceededError') {
            alert('¡Error! La capacidad de almacenamiento del navegador está llena. Esto suele suceder si la foto es demasiado grande. Por favor, intenta usar una foto diferente o bórrala para poder guardar los demás cambios.');
        } else {
            alert('Hubo un problema al guardar la configuración. Por favor intenta de nuevo.');
        }
    }
}

// Cargar configuración al iniciar
function loadSettings() {
    const saved = localStorage.getItem('app_settings');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (parsed.wedding) Object.assign(APP_CONFIG.wedding, parsed.wedding);
            if (parsed.ui) Object.assign(APP_CONFIG.ui, parsed.ui);
            if (parsed.api) Object.assign(APP_CONFIG.api, parsed.api);
            if (parsed.timeline) APP_CONFIG.timeline = parsed.timeline;
        } catch (e) {
            console.error("Error al cargar configuración:", e);
        }
    }
}

// Iniciar carga
loadSettings();
