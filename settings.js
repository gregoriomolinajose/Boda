import { Store } from './js/core/Store.js';
import { Auth } from './js/core/Auth.js';
import { FormSyncManager } from './js/modules/FormSyncManager.js';
import { TimelineBuilder } from './js/modules/TimelineBuilder.js';
import { PhotoCropperService } from './js/modules/PhotoCropperService.js';

Auth.requireAuth();

const urlParams = new URLSearchParams(window.location.search);
const eventId = urlParams.get('event') || 'default';

const store = new Store(window.APP_CONFIG, eventId);
window.store = store;

window.handleLogout = () => Auth.logout();

const formSyncManager = new FormSyncManager(store);
const timelineBuilder = new TimelineBuilder(formSyncManager);
const photoCropperService = new PhotoCropperService(formSyncManager);

formSyncManager.setTimelineBuilder(timelineBuilder);

window.toggleSettings = function (show) {
    const page = document.getElementById('settings-page');
    const container = document.querySelector('.generator-container');

    if (show) {
        formSyncManager.populateSettingsForm();
        if (page) page.style.display = 'flex';
        if (container) container.style.display = 'none';
        document.body.style.overflow = 'hidden';
    } else {
        if (page) page.style.display = 'none';
        if (container) container.style.display = 'grid';
        document.body.style.overflow = 'auto';
    }
};

window.saveSettings = () => formSyncManager.saveSettings();
window.reEditPhoto = () => photoCropperService.reEditPhoto();
window.deletePhoto = () => photoCropperService.deletePhoto();
window.addTimelineItem = () => timelineBuilder.add();
window.removeTimelineItem = (i) => timelineBuilder.remove(i);
window.openIconPicker = (tId) => timelineBuilder.openIconPicker(tId);
window.closeIconPicker = () => timelineBuilder.closeIconPicker();
window.toggleRatioMenu = () => photoCropperService.toggleRatioMenu();
window.setCropRatio = (r, l, b) => photoCropperService.setCropRatio(r, l, b);
window.closeCropper = () => photoCropperService.closeCropper();
window.applyCrop = () => photoCropperService.applyCrop();
window.simulatePreviewRsvp = (s) => formSyncManager.simulatePreviewRsvp(s);
window.syncTimelineData = () => timelineBuilder.sync();
window.notifyPreview = () => formSyncManager.notifyPreview();

async function initSettings() {
    formSyncManager.populateSettingsForm();
    try {
        await store.loadFromCloud('wedding_config_v2');
        console.log("Datos sincronizados con la nube (v2)");
        formSyncManager.populateSettingsForm();
    } catch (e) {
        console.warn("No se pudo conectar con Firestore, usando datos locales");
    }
}

initSettings();
