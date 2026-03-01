import { DashboardController } from './js/controllers/DashboardController.js';

let controllerInstance = null;

// The global proxy to maintain backward compatibility with `generator.html` script loading for now.
window.initDashboard = function () {
    if (controllerInstance) return;

    // Check if store is ready, if not wait a bit. window.store is initialized in generator.html context.
    // Wait... `generator.html` doesn't instantiate store directly. Wait it does, inside Auth flow normally.
    if (window.store) {
        controllerInstance = new DashboardController(window.store);
        controllerInstance.init();
    } else {
        setTimeout(window.initDashboard, 100);
    }
};

window.loadDashboard = function () {
    if (controllerInstance) {
        controllerInstance.loadDashboard();
    } else {
        window.initDashboard();
    }
}

// Inline compatibility hooks
window.handleBulkImport = function (event) {
    if (controllerInstance) {
        controllerInstance.importService.handleBulkImport(event);
    }
};

window.filterDashboard = function () {
    if (controllerInstance) {
        controllerInstance.filterDashboard();
    }
}
