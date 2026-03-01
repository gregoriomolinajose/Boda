export class ImportService {
    constructor(store, onSuccessCallback) {
        this.store = store;
        this.onSuccessCallback = onSuccessCallback;
    }

    async handleBulkImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!confirm('¿Deseas importar los invitados desde el archivo CSV? Esto actualizará o creará nuevos registros en la base de datos.')) {
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

                window.Utils.showToast('toast-container', `Iniciando carga de ${dataRows.length} filas...`, 'info');

                for (const row of dataRows) {
                    const values = row.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
                    const rowObject = {};

                    headers.forEach((header, index) => {
                        rowObject[header] = values[index] || "";
                    });

                    if (!rowObject['Invitado'] && !rowObject['Nombre']) continue;

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
                        await this.store.saveGuest(guestData);
                        successCount++;
                    } catch (err) {
                        console.error('Error en fila:', row, err);
                        errorCount++;
                    }
                }

                window.Utils.showToast('toast-container', `✅ Carga finalizada: ${successCount} exitosos, ${errorCount} errores.`, 'success');
                if (this.onSuccessCallback) this.onSuccessCallback();
            } catch (err) {
                console.error('Error al procesar CSV:', err);
                window.Utils.showToast('toast-container', 'Error al procesar el archivo CSV. Revisa el formato.', 'error');
            } finally {
                event.target.value = '';
            }
        };
        reader.readAsText(file);
    }
}
