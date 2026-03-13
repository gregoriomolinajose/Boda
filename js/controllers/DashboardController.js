import { GuestTableView } from '../views/GuestTableView.js';
import { ImportService } from '../services/ImportService.js';
import { ExportService } from '../services/ExportService.js';

export class DashboardController {
    constructor(store) {
        this.store = store;
        this.allData = [];
        this.filteredData = [];
        this.currentPage = 1;
        this.rowsPerPage = 10;
        this.sortKey = 'Fecha/Hora';
        this.sortOrder = 'desc';

        this.view = new GuestTableView(this);
        this.importService = new ImportService(store, () => this.loadDashboard());
        this.exportService = new ExportService(store);
    }

    init() {
        this.setupEventListeners();
        this.loadDashboard();
    }

    setupEventListeners() {
        // Expose functions required by the inline standard HTML handlers (or replace them)
        // Ideally we should replace them, but for bridging we'll attach to the DOM.

        const searchInput = document.getElementById('dashboard-search');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.filterDashboard(searchInput.value.toLowerCase());
            });
        }

        const importInput = document.getElementById('bulk-import-input');
        if (importInput) {
            importInput.addEventListener('change', (e) => this.importService.handleBulkImport(e));
        }

        const refreshBtn = document.getElementById('refresh-dashboard-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadDashboard());
        }

        // Export to window for html inline attributes that still need it
        window.changePage = (page) => {
            this.currentPage = page;
            this.renderTable();
            const tableContainer = document.querySelector('.table-container');
            if (tableContainer) {
                window.scrollTo({ top: tableContainer.offsetTop - 100, behavior: 'smooth' });
            }
        };

        window.sortByColumn = (key) => {
            if (this.sortKey === key) {
                this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
            } else {
                this.sortKey = key;
                this.sortOrder = 'asc';
            }
            this.view.updateHeaderIcons(this.sortKey, this.sortOrder);
            this.applySort();
            this.renderTable();
        };
    }

    async loadDashboard() {
        const loading = document.getElementById('loading');
        const refreshIcon = document.getElementById('refresh-icon');
        const eventId = this.store?.eventId || 'default';

        const cachedData = localStorage.getItem(`rsvp_cache_${eventId}`);
        if (cachedData) {
            this.allData = JSON.parse(cachedData);
            this.filterDashboard();
        }

        if (!cachedData && loading) loading.style.display = 'block';
        if (refreshIcon) refreshIcon.classList.add('spin');

        try {
            if (!this.store) {
                console.error('Store not initialized');
                return;
            }

            this.allData = await this.store.getGuests();
            localStorage.setItem(`rsvp_cache_${eventId}`, JSON.stringify(this.allData));
            this.filterDashboard();
        } catch (err) {
            console.error('Error loading dashboard from Firestore:', err);
            window.Utils.showToast('toast-container', 'Error al conectar con la base de datos', 'error');
        } finally {
            if (loading) loading.style.display = 'none';
            if (refreshIcon) refreshIcon.classList.remove('spin');
        }
    }

    filterDashboard(searchTerm = '') {
        const searchInput = document.getElementById('dashboard-search');
        const search = searchTerm || (searchInput ? searchInput.value.toLowerCase() : '');

        this.filteredData = this.allData.filter(item =>
            (item.Invitado || '').toLowerCase().includes(search)
        );

        this.applySort();
        this.currentPage = 1;
        this.renderTable();
    }

    applySort() {
        this.filteredData.sort((a, b) => {
            let valA = a[this.sortKey] || '';
            let valB = b[this.sortKey] || '';

            if (this.sortKey === 'Adultos' || this.sortKey === 'Niños' || this.sortKey === 'index') {
                valA = parseInt(valA) || 0;
                valB = parseInt(valB) || 0;
            }

            if (this.sortKey === 'Tipo') {
                valA = (a.type || a.Tipo || 'f').toLowerCase() === 'd' ? 'Digital' : 'Presencial';
                valB = (b.type || b.Tipo || 'f').toLowerCase() === 'd' ? 'Digital' : 'Presencial';
            }

            if (valA < valB) return this.sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return this.sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }

    renderTable() {
        this.view.render(this.allData, this.filteredData, this.currentPage, this.rowsPerPage);
    }

    async toggleActivation(id, currentStatus) {
        if (!confirm(`¿Estás seguro de que deseas ${currentStatus ? 'desactivar' : 'activar'} esta invitación?`)) return;

        window.Utils.showToast('toast-container', currentStatus ? 'Desactivando...' : 'Activando...', 'info');

        try {
            await this.store.toggleGuestStatus(id, !currentStatus);
            window.Utils.showToast('toast-container', `Invitación ${currentStatus ? 'desactivada' : 'activada'} correctamente`);
            this.loadDashboard();
        } catch (err) {
            console.error('Error:', err);
            window.Utils.showToast('toast-container', 'Error al procesar la acción', 'error');
        }
    }

    async deleteInvitation(id) {
        if (!confirm('¿ESTÁS SEGURO? Esta acción eliminará permanentemente la invitación y no se puede deshacer.')) return;

        window.Utils.showToast('toast-container', 'Eliminando...', 'info');

        try {
            await this.store.deleteGuest(id);
            window.Utils.showToast('toast-container', 'Invitación eliminada permanentemente');
            this.loadDashboard();
        } catch (err) {
            console.error('Error:', err);
            window.Utils.showToast('toast-container', 'Error al eliminar', 'error');
        }
    }

    handleBulkExport() {
        if (this.exportService) {
            this.exportService.handleBulkExport(this.allData);
        }
    }
}
