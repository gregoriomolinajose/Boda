export class ExportService {
    constructor(store) {
        this.store = store;
    }

    handleBulkExport(guestsData) {
        if (!guestsData || guestsData.length === 0) {
            window.Utils?.showToast?.('toast-container', 'No hay datos para exportar', 'warning');
            return;
        }

        // Definir los encabezados del CSV
        const headers = [
            'ID',
            'Invitado',
            'Asistencia',
            'Adultos',
            'Niños',
            'Alergias/Notas',
            'Tipo',
            'Link',
            'Estado de la liga',
            'Fecha/Hora Creación'
        ];

        // Crear las filas de datos
        const csvRows = [];
        // Añadir encabezados
        csvRows.push(headers.join(','));

        for (const guest of guestsData) {
            // Limpiar datos para evitar errores con comas en el CSV
            const sanitize = (str) => {
                if (str === null || str === undefined) return '';
                const cleanStr = String(str).replace(/"/g, '""'); // Escapar comillas dobles
                return `"${cleanStr}"`; // Envolver en comillas para permitir comas en el texto
            };

            const link = guest.Link || guest.link || '';
            const type = guest.type === 'c' ? 'Ceremonia' : (guest.type === 'f' ? 'Fiesta' : guest.type);
            const active = guest['Estado de la liga'] !== undefined ? guest['Estado de la liga'] : guest.active;
            const creationDate = guest['Fecha/Hora'] ? window.Utils.formatSheetDate(guest['Fecha/Hora']) : '';

            const row = [
                sanitize(guest.ID || guest.id),
                sanitize(guest.Invitado || guest.guest || guest.Nombre),
                sanitize(guest.Asistencia || guest.attendance),
                sanitize(guest.Adultos || guest.adults),
                sanitize(guest.Niños || guest.kids),
                sanitize(guest.allergies || guest['Alergias/Notas']),
                sanitize(type),
                sanitize(link),
                sanitize(active ? 'TRUE' : 'FALSE'),
                sanitize(creationDate)
            ];

            csvRows.push(row.join(','));
        }

        // Convertir array a string CSV
        const csvString = csvRows.join('\n');

        // Añadir BOM (Byte Order Mark) para que Excel reconozca UTF-8 garantizando acentos
        const bom = '\uFEFF';
        const blob = new Blob([bom + csvString], { type: 'text/csv;charset=utf-8;' });

        // Crear el nombre del archivo
        const dateStr = new Date().toISOString().split('T')[0];
        const fileName = `Invitados_Boda_${dateStr}.csv`;

        // Descargar el archivo
        const linkElem = document.createElement('a');
        if (navigator.msSaveBlob) { // Para IE 10+
            navigator.msSaveBlob(blob, fileName);
        } else {
            const url = URL.createObjectURL(blob);
            if (linkElem.download !== undefined) {
                linkElem.setAttribute('href', url);
                linkElem.setAttribute('download', fileName);
                linkElem.style.visibility = 'hidden';
                document.body.appendChild(linkElem);
                linkElem.click();
                document.body.removeChild(linkElem);
                URL.revokeObjectURL(url);
            }
        }

        window.Utils?.showToast?.('toast-container', 'Exportación completada', 'success');
    }
}
