export class GuestTableView {
    constructor(controller) {
        this.controller = controller;
    }

    render(allData, filteredData, currentPage, rowsPerPage) {
        const tbody = document.getElementById('guest-table-body');
        if (!tbody) return;

        tbody.innerHTML = '';
        this.renderStats(allData);

        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const pageData = filteredData.slice(start, end);

        if (pageData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:40px; color:#999;">No se encontraron invitados</td></tr>';
            this.renderPagination(0, currentPage, rowsPerPage);
            return;
        }

        pageData.forEach((row) => {
            const tr = document.createElement('tr');
            const statusClean = (row.Asistencia || 'Pendiente').toLowerCase().trim();
            const statusClass = statusClean === 'confirma' ? 'confirma' : (statusClean === 'declina' ? 'declina' : 'pendiente');
            const baseUrl = window.APP_CONFIG?.ui?.baseUrl || window.location.origin + "/";
            const currentEventId = this.controller.store?.eventId || 'default';
            const params = `?event=${currentEventId}&n=${encodeURIComponent(row.Invitado || '')}&u=${row.ID}&ca=${row.Adultos || 0}&cc=${row.Niños || 0}&t=${row.type || row.Tipo || 'f'}`;
            const invitationLink = baseUrl + params;
            const rowIndex = allData.length - allData.findIndex(item => item === row);
            const isActive = (row['Estado de la liga'] || 'TRUE').toString().toUpperCase() === 'TRUE';
            const dateDisplay = window.Utils.formatSheetDate(row['Fecha/Hora']);

            tr.innerHTML = `
                <td style="color:var(--md-sys-color-outline); font-weight: 500;">${rowIndex}</td>
                <td style="white-space: nowrap;">
                    <div style="font-weight: 600; color: var(--md-sys-color-on-surface);">${row.Invitado || 'Sin nombre'}</div>
                    <div style="font-size: 0.75rem; color: var(--md-sys-color-outline); margin-top: 4px;">${dateDisplay}</div>
                </td>
                <td><span class="status-badge status-${statusClass}">${row.Asistencia || 'Pendiente'}</span></td>
                <td style="text-align:center; font-weight: 600;">${row.Adultos || 0}</td>
                <td style="text-align:center; font-weight: 600;">${row.Niños || 0}</td>
                <td style="text-align:center">
                    <span style="font-size: 0.7rem; font-weight: 800; color: ${isActive ? '#4cd137' : '#e84118'}; padding: 4px 8px; border-radius: 4px; border: 1px solid currentColor;">
                        ${isActive ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                </td>
                <td style="text-align:center">
                    <button class="icon-btn-mini copy-link-action" title="Copiar Link" style="margin: 0 auto;">
                        <i class="fas fa-link"></i>
                    </button>
                </td>
                <td style="text-align:center">
                    <div style="display: flex; gap: 8px; justify-content: center;">
                        <button class="icon-btn-mini edit-btn" title="Editar">
                            <i class="fas fa-pen"></i>
                        </button>
                        <button class="icon-btn-mini toggle-btn" title="${isActive ? 'Desactivar' : 'Activar'}" style="color: ${isActive ? 'var(--md-sys-color-error)' : '#4cd137'}">
                            <i class="fas ${isActive ? 'fa-toggle-on' : 'fa-toggle-off'}"></i>
                        </button>
                        <button class="icon-btn-mini delete-btn" title="Eliminar" style="color: var(--md-sys-color-error);">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;

            // EVENT LISTENERS
            tr.querySelector('.copy-link-action').addEventListener('click', (e) => {
                e.preventDefault();
                window.Utils.copyToClipboard(invitationLink, (ok, msg) => {
                    window.Utils.showToast('toast-container', msg, ok ? 'success' : 'error');
                });
            });

            tr.querySelector('.edit-btn').addEventListener('click', () => {
                if (window.openInvitationModal) {
                    window.openInvitationModal({
                        id: row.ID,
                        guest: row.Invitado,
                        adults: row.Adultos,
                        kids: row.Niños,
                        type: row.Tipo || 'f'
                    });
                }
            });

            const toggleBtn = tr.querySelector('.toggle-btn');
            toggleBtn.addEventListener('click', () => {
                this.controller.toggleActivation(row.ID, isActive);
            });

            tr.querySelector('.delete-btn').addEventListener('click', () => {
                this.controller.deleteInvitation(row.ID);
            });

            tbody.appendChild(tr);
        });

        this.renderPagination(filteredData.length, currentPage, rowsPerPage);
    }

    renderStats(allData) {
        let confirmedAdults = 0;
        let confirmedKids = 0;
        let totalInvitedAdults = 0;
        let totalInvitedKids = 0;
        let acceptedInvites = 0;
        let declinedInvites = 0;

        allData.forEach(row => {
            const isActive = (row['Estado de la liga'] || 'TRUE').toString().toUpperCase() === 'TRUE';
            if (!isActive) return;

            const adults = parseInt(row.Adultos || 0);
            const kids = parseInt(row.Niños || 0);

            totalInvitedAdults += adults;
            totalInvitedKids += kids;

            const status = (row.Asistencia || '').toLowerCase().trim();
            if (status === 'confirma') {
                confirmedAdults += adults;
                confirmedKids += kids;
                acceptedInvites++;
            } else if (status === 'declina') {
                declinedInvites++;
            }
        });

        const totalActiveInvites = allData.filter(r => (r['Estado de la liga'] || 'TRUE').toString().toUpperCase() === 'TRUE').length;

        const setRatio = (id, current, total) => {
            const el = document.getElementById(id);
            if (el) el.innerText = `${current} / ${total}`;
        };

        setRatio('stat-ratio-adults', confirmedAdults, totalInvitedAdults);
        setRatio('stat-ratio-kids', confirmedKids, totalInvitedKids);
        setRatio('stat-ratio-declined', declinedInvites, totalActiveInvites);
        setRatio('stat-ratio-accepted', acceptedInvites, totalActiveInvites);
    }

    renderPagination(totalRows, currentPage, rowsPerPage) {
        const container = document.getElementById('pagination');
        if (!container) return;

        const totalPages = Math.ceil(totalRows / rowsPerPage);

        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let html = `<button class="page-btn" onclick="changePage(1)" ${currentPage === 1 ? 'disabled' : ''}>«</button>`;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
            } else if (i === currentPage - 2 || i === currentPage + 2) {
                html += `<span style="color:#ccc">...</span>`;
            }
        }

        html += `<button class="page-btn" onclick="changePage(${totalPages})" ${currentPage === totalPages ? 'disabled' : ''}>»</button>`;
        container.innerHTML = html;
    }

    updateHeaderIcons(sortKey, sortOrder) {
        document.querySelectorAll('th.sortable').forEach(th => {
            th.classList.remove('sorted-asc', 'sorted-desc');
        });
        const headers = {
            'index': 0, 'Fecha/Hora': 1, 'Invitado': 2, 'Asistencia': 3, 'Adultos': 4, 'Niños': 5
        };
        const index = headers[sortKey];
        const ths = document.querySelectorAll('th.sortable');
        if (ths[index]) ths[index].classList.add(sortOrder === 'asc' ? 'sorted-asc' : 'sorted-desc');
    }
}
