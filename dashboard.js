/**
 * Lógica del Dashboard de invitados.
 */
let allData = [];
let filteredData = [];
let currentPage = 1;
const rowsPerPage = 10;
let sortKey = 'Fecha/Hora';
let sortOrder = 'desc';

async function loadDashboard() {
    const loading = document.getElementById('loading');
    const refreshIcon = document.getElementById('refresh-icon');
    const eventId = window.store?.eventId || 'default';

    // Usar cache de localStorage para carga inmediata (específico por evento)
    const cachedData = localStorage.getItem(`rsvp_cache_${eventId}`);
    if (cachedData) {
        allData = JSON.parse(cachedData);
        filterDashboard();
    }

    if (!cachedData && loading) loading.style.display = 'block';
    if (refreshIcon) refreshIcon.classList.add('spin');

    try {
        if (!window.store) {
            console.error('Store not initialized');
            return;
        }

        // Obtener datos desde Firestore
        allData = await window.store.getGuests();

        // Guardar en cache especifico por evento
        const eventId = window.store?.eventId || 'default';
        localStorage.setItem(`rsvp_cache_${eventId}`, JSON.stringify(allData));
        filterDashboard();
    } catch (err) {
        console.error('Error loading dashboard from Firestore:', err);
        Utils.showToast('toast-container', 'Error al conectar con la base de datos', 'error');
    } finally {
        if (loading) loading.style.display = 'none';
        if (refreshIcon) refreshIcon.classList.remove('spin');
    }
}

function filterDashboard() {
    const searchInput = document.getElementById('dashboard-search');
    const search = searchInput ? searchInput.value.toLowerCase() : '';

    filteredData = allData.filter(item =>
        (item.Invitado || '').toLowerCase().includes(search)
    );

    applySort();
    currentPage = 1;
    renderTable();
}

function sortByColumn(key) {
    if (sortKey === key) {
        sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
        sortKey = key;
        sortOrder = 'asc';
    }

    updateHeaderIcons();
    applySort();
    renderTable();
}

function updateHeaderIcons() {
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

function applySort() {
    filteredData.sort((a, b) => {
        let valA = a[sortKey] || '';
        let valB = b[sortKey] || '';

        if (sortKey === 'Adultos' || sortKey === 'Niños' || sortKey === 'index') {
            valA = parseInt(valA) || 0;
            valB = parseInt(valB) || 0;
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });
}

function renderTable() {
    const tbody = document.getElementById('guest-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';
    renderStats();

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageData = filteredData.slice(start, end);

    if (pageData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:40px; color:#999;">No se encontraron invitados</td></tr>';
        renderPagination(0);
        return;
    }

    pageData.forEach((row, i) => {
        const tr = document.createElement('tr');
        const statusClean = (row.Asistencia || 'Pendiente').toLowerCase().trim();
        const statusClass = statusClean === 'confirma' ? 'confirma' : (statusClean === 'declina' ? 'declina' : 'pendiente');
        const invitationLink = row['Link'] || row.link || '';
        const rowIndex = allData.length - allData.findIndex(item => item === row);
        const isActive = (row['Estado de la liga'] || 'TRUE').toString().toUpperCase() === 'TRUE';
        const dateDisplay = Utils.formatSheetDate(row['Fecha/Hora']);

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
        tr.querySelector('.copy-link-action').onclick = () => Utils.copyToClipboard(invitationLink, (ok, msg) => Utils.showToast('toast-container', msg, ok ? 'success' : 'error'));
        tr.querySelector('.edit-btn').onclick = () => openInvitationModal({
            id: row.ID,
            guest: row.Invitado,
            adults: row.Adultos,
            kids: row.Niños,
            type: row.Tipo || 'f'
        });
        tr.querySelector('.toggle-btn').onclick = () => toggleActivation(row.ID, isActive);
        tr.querySelector('.toggle-btn').style.color = isActive ? '#e84118' : '#4cd137';
        tr.querySelector('.delete-btn').onclick = () => deleteInvitation(row.ID);

        tbody.appendChild(tr);
    });

    renderPagination(filteredData.length);
}

function renderStats() {
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

async function toggleActivation(id, currentStatus) {
    if (!confirm(`¿Estás seguro de que deseas ${currentStatus ? 'desactivar' : 'activar'} esta invitación?`)) return;

    Utils.showToast('toast-container', currentStatus ? 'Desactivando...' : 'Activando...', 'info');

    try {
        await window.store.toggleGuestStatus(id, !currentStatus);
        Utils.showToast('toast-container', `Invitación ${currentStatus ? 'desactivada' : 'activada'} correctamente`);
        loadDashboard();
    } catch (err) {
        console.error('Error:', err);
        Utils.showToast('toast-container', 'Error al procesar la acción', 'error');
    }
}

async function deleteInvitation(id) {
    if (!confirm('¿ESTÁS SEGURO? Esta acción eliminará permanentemente la invitación y no se puede deshacer.')) return;

    Utils.showToast('toast-container', 'Eliminando...', 'info');

    try {
        await window.store.deleteGuest(id);
        Utils.showToast('toast-container', 'Invitación eliminada permanentemente');
        loadDashboard();
    } catch (err) {
        console.error('Error:', err);
        Utils.showToast('toast-container', 'Error al eliminar', 'error');
    }
}

function renderPagination(totalRows) {
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

function changePage(page) {
    currentPage = page;
    renderTable();
    const tableContainer = document.querySelector('.table-container');
    if (tableContainer) {
        window.scrollTo({ top: tableContainer.offsetTop - 100, behavior: 'smooth' });
    }
}

/**
 * Importa invitados masivamente desde un archivo CSV.
 */
async function handleBulkImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!confirm('¿Deseas importar los invitados desde el archivo CSV? Esto actualizará o creará nuevos registros en Firestore.')) {
        event.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const text = e.target.result;
            const lines = text.split(/\r?\n/);
            if (lines.length < 2) throw new Error("El archivo está vacío o le faltan datos.");

            const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
            const dataRows = lines.slice(1).filter(line => line.trim() !== "");

            let successCount = 0;
            let errorCount = 0;

            Utils.showToast('toast-container', `Iniciando carga de ${dataRows.length} filas...`, 'info');

            for (const row of dataRows) {
                // Parser de CSV simple que respeta comillas básico
                const values = row.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
                const rowObject = {};

                headers.forEach((header, index) => {
                    rowObject[header] = values[index] || "";
                });

                if (!rowObject['Invitado']) continue;

                // Mapeo flexible para soportar diferentes nombres de columnas
                const guestData = {
                    id: rowObject['ID'] || rowObject['id'] || undefined,
                    guest: rowObject['Invitado'] || rowObject['Nombre'] || rowObject['guest'],
                    attendance: rowObject['Asistencia'] || rowObject['attendance'] || 'Pendiente',
                    adults: parseInt(rowObject['Adultos'] || rowObject['adults']) || 1,
                    kids: parseInt(rowObject['Niños'] || rowObject['kids']) || 0,
                    allergies: rowObject['Alergias/Notas'] || rowObject['allergies'] || 'N/A',
                    type: (rowObject['Link'] || rowObject['link'])?.includes('t=c') ? 'c' : 'f',
                    link: rowObject['Link'] || rowObject['link'] || '',
                    active: (rowObject['Estado de la liga'] || rowObject['active'] || 'TRUE').toUpperCase() === 'TRUE'
                };

                try {
                    await window.store.saveGuest(guestData);
                    successCount++;
                } catch (err) {
                    console.error('Error en fila:', row, err);
                    errorCount++;
                }
            }

            Utils.showToast('toast-container', `✅ Carga finalizada: ${successCount} exitosos, ${errorCount} errores.`, 'success');
            loadDashboard();
        } catch (err) {
            console.error('Error al procesar CSV:', err);
            Utils.showToast('toast-container', 'Error al procesar el archivo CSV. Revisa el formato.', 'error');
        } finally {
            event.target.value = '';
        }
    };
    reader.readAsText(file);
}
