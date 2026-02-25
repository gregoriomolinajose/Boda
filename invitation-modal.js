/**
 * Lógica para el modal de creación y edición de invitaciones.
 */
function openInvitationModal(editData = null) {
    const modal = document.getElementById('modal-invitation');
    const title = document.getElementById('modal-title');
    const btn = document.getElementById('generate-btn');

    if (editData) {
        title.innerText = 'Editar Invitación';
        btn.innerText = 'Actualizar Invitación';
        document.getElementById('edit-id').value = editData.id;
        document.getElementById('guestName').value = editData.guest;
        document.getElementById('adults').value = editData.adults;
        document.getElementById('kids').value = editData.kids;

        const type = editData.type || 'f';
        const radioType = document.getElementById(`type-${type}`);
        if (radioType) radioType.checked = true;
    } else {
        title.innerText = 'Nueva Invitación';
        btn.innerText = 'Generar e Inscribir';
        document.getElementById('edit-id').value = '';
        document.getElementById('guestName').value = '';
        document.getElementById('adults').value = 2;
        document.getElementById('kids').value = 0;
        document.getElementById('type-f').checked = true;
    }

    const nameGroup = document.getElementById('group-guestName');
    if (nameGroup) nameGroup.classList.remove('has-error');

    const resultDiv = document.getElementById('result');
    if (resultDiv) resultDiv.style.display = 'none';

    if (modal) modal.style.display = 'flex';
}

function closeInvitationModal() {
    const modal = document.getElementById('modal-invitation');
    if (modal) modal.style.display = 'none';
}

function generateInvitationLink() {
    let baseName = document.getElementById('guestName').value.trim();
    const adults = document.getElementById('adults').value;
    const kids = document.getElementById('kids').value;
    const invitationType = document.querySelector('input[name="inv-type"]:checked').value;
    const editId = document.getElementById('edit-id').value;

    const nameGroup = document.getElementById('group-guestName');
    if (!baseName) {
        if (nameGroup) nameGroup.classList.add('has-error');
        document.getElementById('guestName').focus();
        return;
    }
    if (nameGroup) nameGroup.classList.remove('has-error');

    const isEditing = !!editId;
    const uuid = isEditing ? editId : Math.random().toString(36).substring(2, 6).toUpperCase();

    // Usar base URL de la configuración
    const baseUrl = APP_CONFIG.ui.baseUrl;
    const params = `?n=${encodeURIComponent(baseName)}&u=${uuid}&ca=${adults}&cc=${kids}&t=${invitationType}`;
    const fullUrl = baseUrl + params;

    const linkDisplay = document.getElementById('link-display');
    if (linkDisplay) linkDisplay.innerText = fullUrl;

    const resultDiv = document.getElementById('result');
    if (resultDiv) resultDiv.style.display = 'block';

    const btn = document.getElementById('generate-btn');
    const originalText = btn.innerText;
    btn.innerText = 'Guardando...';
    btn.disabled = true;

    const data = {
        id: uuid,
        action: isEditing ? 'update' : 'create',
        guest: baseName,
        attendance: isEditing ? undefined : 'Pendiente',
        adults: adults,
        kids: kids,
        allergies: isEditing ? undefined : 'N/A',
        type: invitationType,
        link: fullUrl,
        active: isEditing ? undefined : true
    };

    fetch(APP_CONFIG.api.sheetWebhook, {
        method: 'POST',
        mode: 'no-cors',
        cache: 'no-cache',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(data)
    }).then(() => {
        Utils.showToast('toast-container', isEditing ? '¡Invitación actualizada!' : '¡Invitación registrada con éxito!');
        if (typeof loadDashboard === 'function') loadDashboard();

        setTimeout(() => {
            btn.innerText = originalText;
            btn.disabled = false;
        }, 1000);
    }).catch(err => {
        console.error('Error al guardar:', err);
        Utils.showToast('toast-container', 'Error al conectar con la lista', 'error');
        btn.innerText = originalText;
        btn.disabled = false;
    });
}

function copyGeneratedLink(e) {
    if (e) e.preventDefault();
    const linkDisplay = document.getElementById('link-display');
    const link = linkDisplay ? linkDisplay.innerText : '';
    Utils.copyToClipboard(link, (ok, msg) => Utils.showToast('toast-container', msg, ok ? 'success' : 'error'));
}
