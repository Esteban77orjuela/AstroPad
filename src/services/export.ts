import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';
import { Alert, Platform } from 'react-native';
import { Note } from '../types/note';

// Directorio temporal para archivos
type FileSystemWithDirs = typeof FileSystem & {
    cacheDirectory?: string | null;
    documentDirectory?: string | null;
};

const FS = FileSystem as FileSystemWithDirs;

const getFileUri = (fileName: string) => {
    const dir = FS.cacheDirectory || FS.documentDirectory || '';
    return `${dir}${fileName}`;
};

export class ExportService {
    /**
     * Exporta todas las notas a formato Excel (.xlsx)
     */
    static async exportToExcel(notes: Note[]): Promise<void> {
        try {
            if (notes.length === 0) {
                Alert.alert('Sin notas', 'No hay notas para exportar.');
                return;
            }

            // Preparar datos para Excel
            const data = notes.map(note => ({
                Titulo: note.title || 'Sin título',
                Categoria: note.category,
                Contenido: note.content || '',
                'Fecha de Creación': new Date(note.createdAt).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                'Última Modificación': new Date(note.updatedAt).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })
            }));

            // Crear workbook
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Notas');

            // Ajustar ancho de columnas
            const wscols = [
                { wch: 30 }, // Titulo
                { wch: 15 }, // Categoria
                { wch: 50 }, // Contenido
                { wch: 20 }, // Fecha de Creación
                { wch: 20 }  // Última Modificación
            ];
            ws['!cols'] = wscols;

            // Generar archivo
            const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
            const fileName = `AstraPad_Backup_${new Date().toISOString().split('T')[0]}.xlsx`;
            const fileUri = getFileUri(fileName);

            await FileSystem.writeAsStringAsync(fileUri, wbout, {
                encoding: 'base64',
            });

            // Compartir archivo
            const isAvailable = await Sharing.isAvailableAsync();
            if (isAvailable) {
                await Sharing.shareAsync(fileUri, {
                    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    dialogTitle: 'Exportar Notas',
                    UTI: 'com.microsoft.excel.xlsx'
                });
            } else {
                Alert.alert('Error', 'No se puede compartir archivos en este dispositivo.');
            }
        } catch (error) {
            console.error('Error al exportar a Excel:', error);
            Alert.alert('Error', 'No se pudo exportar las notas a Excel.');
        }
    }

    /**
     * Exporta todas las notas a formato CSV
     */
    static async exportToCSV(notes: Note[]): Promise<void> {
        try {
            if (notes.length === 0) {
                Alert.alert('Sin notas', 'No hay notas para exportar.');
                return;
            }

            // Crear CSV manualmente
            let csv = 'Titulo,Categoria,Contenido,Fecha de Creación,Última Modificación\n';

            notes.forEach(note => {
                const title = (note.title || 'Sin título').replace(/"/g, '""');
                const content = (note.content || '').replace(/"/g, '""').replace(/\n/g, ' ');
                const createdAt = new Date(note.createdAt).toLocaleDateString('es-ES');
                const updatedAt = new Date(note.updatedAt).toLocaleDateString('es-ES');

                csv += `"${title}","${note.category}","${content}","${createdAt}","${updatedAt}"\n`;
            });

            const fileName = `AstraPad_Backup_${new Date().toISOString().split('T')[0]}.csv`;
            const fileUri = getFileUri(fileName);

            await FileSystem.writeAsStringAsync(fileUri, csv, {
                encoding: 'utf8',
            });

            const isAvailable = await Sharing.isAvailableAsync();
            if (isAvailable) {
                await Sharing.shareAsync(fileUri, {
                    mimeType: 'text/csv',
                    dialogTitle: 'Exportar Notas (CSV)',
                });
            }
        } catch (error) {
            console.error('Error al exportar a CSV:', error);
            Alert.alert('Error', 'No se pudo exportar las notas a CSV.');
        }
    }

    /**
     * Exporta todas las notas a formato JSON (backup completo)
     */
    static async exportToJSON(notes: Note[]): Promise<void> {
        try {
            if (notes.length === 0) {
                Alert.alert('Sin notas', 'No hay notas para exportar.');
                return;
            }

            const backup = {
                version: '1.0.0',
                exportDate: new Date().toISOString(),
                totalNotes: notes.length,
                notes: notes
            };

            const fileName = `AstraPad_Backup_${new Date().toISOString().split('T')[0]}.json`;
            const fileUri = getFileUri(fileName);

            await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(backup, null, 2), {
                encoding: 'utf8',
            });

            const isAvailable = await Sharing.isAvailableAsync();
            if (isAvailable) {
                await Sharing.shareAsync(fileUri, {
                    mimeType: 'application/json',
                    dialogTitle: 'Exportar Backup Completo',
                });
            }
        } catch (error) {
            console.error('Error al exportar a JSON:', error);
            Alert.alert('Error', 'No se pudo exportar el backup.');
        }
    }

    /**
     * Exporta una nota individual como texto plano
     */
    static async exportNoteAsText(note: Note): Promise<void> {
        try {
            const content = `
═══════════════════════════════════════
${note.title || 'Sin Título'}
═══════════════════════════════════════

Categoría: ${note.category}
Fecha: ${new Date(note.createdAt).toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}

───────────────────────────────────────

${note.content || 'Sin contenido'}

───────────────────────────────────────
Exportado desde AstraPad
            `.trim();

            const fileName = `${note.title?.substring(0, 30) || 'Nota'}_${Date.now()}.txt`;
            const fileUri = getFileUri(fileName);

            await FileSystem.writeAsStringAsync(fileUri, content, {
                encoding: 'utf8',
            });

            const isAvailable = await Sharing.isAvailableAsync();
            if (isAvailable) {
                await Sharing.shareAsync(fileUri, {
                    mimeType: 'text/plain',
                    dialogTitle: 'Compartir Nota',
                });
            }
        } catch (error) {
            console.error('Error al exportar nota:', error);
            Alert.alert('Error', 'No se pudo exportar la nota.');
        }
    }

    /**
     * Muestra un menú de opciones de exportación
     */
    static showExportMenu(notes: Note[], onSelect: (format: 'excel' | 'csv' | 'json') => void): void {
        Alert.alert(
            'Exportar Notas',
            `Selecciona el formato para exportar ${notes.length} nota${notes.length !== 1 ? 's' : ''}`,
            [
                {
                    text: 'Excel (.xlsx)',
                    onPress: () => onSelect('excel'),
                },
                {
                    text: 'CSV (.csv)',
                    onPress: () => onSelect('csv'),
                },
                {
                    text: 'Backup JSON',
                    onPress: () => onSelect('json'),
                },
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
            ],
            { cancelable: true }
        );
    }
}
