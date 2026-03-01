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
                <td style="color:#aaa;">${rowIndex}</td>
                <td style="font-size: 0.75rem; color: #888;">${dateDisplay}</td>
                <td style="font-weight: 600;"></td>
                <td><span class="status-badge status-${statusClass}">${row.Asistencia || 'Pendiente'}</span></td>
                <td style="text-align:center">${row.Adultos || 0}</td>
                <td style="text-align:center">${row.Niños || 0}</td>
                <td style="text-align:center">
                    <span style="color: ${isActive ? '#4cd137' : '#e84118'}; font-weight: bold; font-size: 0.7rem;">
                        ${isActive ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                </td>
                <td style="text-align:center">
                    <div class="row-action copy-link-action" title="Copiar Link" style="display: flex; justify-content: center; cursor: pointer;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    </div>
                </td>
                <td style="text-align:center">
                    <div style="display: flex; gap: 8px; justify-content: center;">
                        <div class="row-action edit-btn" title="Editar">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </div>
                        <div class="row-action toggle-btn" title="Desactivar/Activar">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="9" y1="9" x2="15" y2="15"></line>
                                <line x1="15" y1="9" x2="9" y2="15"></line>
                            </svg>
                        </div>
                        <div class="row-action delete-btn" title="Eliminar Permanentemente" style="color: #ff4757;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                        </div>
                    </div>
                </td>
            `;

            tr.querySelector('td:nth-child(3)').textContent = row.Invitado || 'Sin nombre';

            tr.querySelector('.copy-link-action').addEventListener('click', () => {
                window.Utils.copyToClipboard(invitationLink, (ok, msg) => window.Utils.showToast('toast-container', msg, ok ? 'success' : 'error'));
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
            toggleBtn.style.color = isActive ? '#e84118' : '#4cd137';
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
