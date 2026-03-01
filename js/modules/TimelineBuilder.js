export class TimelineBuilder {
    constructor(formSyncManager) {
        this.formSyncManager = formSyncManager;
        this.currentIconTargetId = null;
        this.ICON_LIST = [
            // Boda & Amor (20)
            'fa-heart', 'fa-rings-wedding', 'fa-church', 'fa-champagne-glasses', 'fa-dove',
            'fa-gift', 'fa-envelope-open-text', 'fa-cake-candles', 'fa-camera-retro', 'fa-music',
            'fa-gem', 'fa-crown', 'fa-kiss-wink-heart', 'fa-hand-holding-heart', 'fa-heart-pulse',
            'fa-comments', 'fa-images', 'fa-video', 'fa-bell', 'fa-star',
            // Evento & Fiesta (20)
            'fa-glass-cheers', 'fa-wine-glass', 'fa-martini-glass', 'fa-beer-mug-empty', 'fa-utensils',
            'fa-mug-hot', 'fa-coffee', 'fa-pizza-slice', 'fa-burger', 'fa-ice-cream',
            'fa-microphone-alt', 'fa-guitar', 'fa-compact-disc', 'fa-headphones', 'fa-volume-up',
            'fa-sparkles', 'fa-wand-magic-sparkles', 'fa-fire', 'fa-masks-theater', 'fa-ticket-alt',
            // Naturaleza & Ubicación (20)
            'fa-leaf', 'fa-tree', 'fa-seedling', 'fa-flower', 'fa-sun',
            'fa-moon', 'fa-cloud', 'fa-umbrella', 'fa-snowflake', 'fa-water',
            'fa-map-location-dot', 'fa-location-dot', 'fa-compass', 'fa-earth-americas', 'fa-route',
            'fa-building', 'fa-house', 'fa-hotel', 'fa-campground', 'fa-monument',
            // Transporte & Viajes (20)
            'fa-car', 'fa-plane', 'fa-bus', 'fa-train', 'fa-ship',
            'fa-motorcycle', 'fa-bicycle', 'fa-taxi', 'fa-helicopter', 'fa-rocket',
            'fa-suitcase-rolling', 'fa-passport', 'fa-ticket', 'fa-plane-departure', 'fa-plane-arrival',
            'fa-anchor', 'fa-gas-pump', 'fa-charging-station', 'fa-parking', 'fa-road',
            // Logística & Varios (20)
            'fa-clock', 'fa-calendar-alt', 'fa-calendar-check', 'fa-hourglass-half', 'fa-stopwatch',
            'fa-users', 'fa-user-friends', 'fa-user-tie', 'fa-child', 'fa-baby',
            'fa-shirt', 'fa-socks', 'fa-shoe-prints', 'fa-hat-wizard', 'fa-glasses',
            'fa-camera', 'fa-key', 'fa-lock', 'fa-wallet', 'fa-credit-card'
        ];
    }

    render() {
        const container = document.getElementById('timeline-builder-container');
        if (!container) return;

        container.innerHTML = '';

        const timeline = window.APP_CONFIG.timeline || [];
        const iconColor = window.APP_CONFIG.ui?.iconColor || '#80a040';

        timeline.forEach((item, index) => {
            const row = document.createElement('div');
            row.className = 'timeline-builder-item';
            row.dataset.index = index;
            row.innerHTML = `
                <div class="timeline-builder-handle">
                    <i class="fas fa-grip-vertical"></i>
                </div>
                <button type="button" class="icon-selector-btn" 
                        onclick="window.openIconPicker('timeline-icon-${index}')" 
                        id="timeline-icon-${index}" 
                        data-icon="${item.icon}"
                        style="border: 2px solid ${iconColor}">
                    <i class="fa-solid ${item.icon}" style="color: ${iconColor}; font-weight: 900;"></i>
                </button>
                <input type="time" class="set-timeline-time" value="${item.time}" oninput="window.syncTimelineData(); window.notifyPreview();">
                <input type="text" class="set-timeline-activity" value="${item.activity}" placeholder="Actividad" oninput="window.syncTimelineData(); window.notifyPreview();">
                <button type="button" class="remove-item" onclick="window.removeTimelineItem(${index});" aria-label="Eliminar" title="Eliminar actividad">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            `;
            container.appendChild(row);
        });

        if (window.Sortable) {
            new window.Sortable(container, {
                handle: '.timeline-builder-handle',
                animation: 150,
                ghostClass: 'sortable-ghost',
                onEnd: () => {
                    this.sync();
                    this.render(); // Re-render to update dynamic onclick index bindings
                    if (this.formSyncManager) this.formSyncManager.notifyPreview();
                }
            });
        }
    }

    add() {
        this.sync();
        if (!window.APP_CONFIG.timeline) window.APP_CONFIG.timeline = [];
        window.APP_CONFIG.timeline.push({ time: "12:00", activity: "", icon: "fa-leaf" });
        this.render();
        if (this.formSyncManager) this.formSyncManager.notifyPreview();
    }

    remove(index) {
        if (confirm('¿Estás seguro de que deseas eliminar esta actividad?')) {
            this.sync();
            window.APP_CONFIG.timeline.splice(index, 1);
            this.render();
            if (this.formSyncManager) this.formSyncManager.notifyPreview();
        }
    }

    sync() {
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
        window.APP_CONFIG.timeline = currentData;
    }

    openIconPicker(targetId) {
        this.currentIconTargetId = targetId;
        const grid = document.getElementById('icon-grid');
        if (!grid) return;

        grid.innerHTML = '';

        this.ICON_LIST.forEach(icon => {
            const div = document.createElement('div');
            div.className = 'icon-option';
            div.innerHTML = `<i class="fas ${icon}"></i>`;
            div.onclick = () => this.selectIcon(icon);
            grid.appendChild(div);
        });

        const modal = document.getElementById('modal-icon-picker');
        if (modal) modal.style.display = 'flex';
    }

    selectIcon(icon) {
        const btn = document.getElementById(this.currentIconTargetId);
        if (btn) {
            btn.innerHTML = `<i class="fa-solid ${icon}"></i>`;
            btn.dataset.icon = icon;
        }
        this.closeIconPicker();
        this.sync();
        if (this.formSyncManager) this.formSyncManager.notifyPreview();
    }

    closeIconPicker() {
        const modal = document.getElementById('modal-icon-picker');
        if (modal) modal.style.display = 'none';
    }
}
