import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { Note, Category } from '../../domain/entities/note';
import { storageService } from '../../data/repositories/storage';
import { firestoreService } from '../../data/repositories/firestore';
import { ExportService } from '../../data/repositories/export';
import { useSecurity } from '../context/SecurityContext';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as XLSX from 'xlsx';

const parseCsvLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const ch = line[i];

        if (ch === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (ch === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += ch;
        }
    }

    result.push(current);
    return result;
};

const parseCsv = (csv: string): any[] => {
    const lines = csv.split(/\r?\n/).filter((line) => line.trim().length > 0);
    if (lines.length === 0) return [];

    const headers = parseCsvLine(lines[0]).map((h) => h.replace(/^\uFEFF/, '').trim());

    return lines.slice(1).map((line) => {
        const cols = parseCsvLine(line);
        const row: any = {};

        headers.forEach((header, index) => {
            row[header] = cols[index] ?? '';
        });

        return row;
    });
};

export const useNotes = () => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<Category>('Todas');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const { masterKey } = useSecurity();

    const fetchNotes = useCallback(async () => {
        try {
            const localNotes = await storageService.getNotes(masterKey || undefined);
            
            let cloudNotes: Note[] = [];
            try {
                cloudNotes = await firestoreService.getNotes(masterKey || undefined);
            } catch (error) {
                console.warn('Sin conexión a la nube. Mostrando notas locales.');
            }

            const mergedMap = new Map<string, Note>();

            localNotes.forEach((note) => mergedMap.set(note.id, note));

            cloudNotes.forEach((cloudNote) => {
                const localNote = mergedMap.get(cloudNote.id);
                if (!localNote) {
                    mergedMap.set(cloudNote.id, cloudNote);
                    storageService.addNote(cloudNote, masterKey || undefined).catch(() => {});
                } else if (
                    cloudNote.updatedAt &&
                    localNote.updatedAt &&
                    cloudNote.updatedAt > localNote.updatedAt
                ) {
                    mergedMap.set(cloudNote.id, cloudNote);
                    storageService.updateNote(cloudNote, masterKey || undefined).catch(() => {});
                }
            });

            const finalNotes = Array.from(mergedMap.values()).sort(
                (a, b) => b.createdAt - a.createdAt,
            );

            const cloudIds = new Set(cloudNotes.map((n) => n.id));
            const unsyncedNotes = finalNotes.filter((n) => !cloudIds.has(n.id));

            if (unsyncedNotes.length > 0) {
                Promise.all(
                    unsyncedNotes.map((note) =>
                        firestoreService.syncNoteToCloud(note, masterKey || undefined),
                    ),
                ).catch((e) =>
                    console.log('Sincronización en segundo plano falló.', e),
                );
            }

            setNotes(finalNotes);
        } catch (error) {
            console.error('Error general al cargar notas:', error);
            const localNotesInfo = await storageService.getNotes(masterKey || undefined);
            setNotes(localNotesInfo);
        }
    }, [masterKey]);

    const handleImport = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: [
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'application/vnd.ms-excel',
                    'text/csv',
                    'text/comma-separated-values',
                    'text/plain',
                ],
                copyToCacheDirectory: true,
            });

            if (result.canceled) return;

            const file = result.assets[0];
            const uri = (file as any).fileCopyUri || file.uri;
            const fileName = file.name || '';
            const mimeType = file.mimeType || '';
            const extension = fileName.split('.').pop()?.toLowerCase() || '';

            let data: any[] = [];
            const isCsv = extension === 'csv' || mimeType.includes('csv') || mimeType === 'text/plain';

            if (isCsv) {
                const csvContent = uri.startsWith('content://')
                    ? await (FileSystem as any).StorageAccessFramework.readAsStringAsync(uri, {
                          encoding: 'utf8',
                      })
                    : await FileSystem.readAsStringAsync(uri, { encoding: 'utf8' });

                data = parseCsv(csvContent);
            } else {
                const base64 = uri.startsWith('content://')
                    ? await (FileSystem as any).StorageAccessFramework.readAsStringAsync(uri, {
                          encoding: 'base64',
                      })
                    : await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });

                const workbook = XLSX.read(base64, { type: 'base64' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                data = XLSX.utils.sheet_to_json(sheet);
            }

            if (data.length === 0) return;

            const existingNotes = await storageService.getNotes();

            const newNotes: Note[] = data.map((item: any, index: number) => {
                const title = item.Titulo || item.title || item.Title || 'Sin título';
                const content = item.Contenido || item.content || item.Content || '';
                let category: Category = 'Todas';

                const rawCategory = (item.Categoria || item.category || '').toLowerCase();
                if (rawCategory.includes('teo')) category = 'Teología';
                else if (rawCategory.includes('filo')) category = 'Filosofía';

                return {
                    id: Math.random().toString(36).substr(2, 9) + index,
                    title: title.toString(),
                    content: content.toString(),
                    category,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                };
            });

            await storageService.saveNotes([...newNotes, ...existingNotes]);
            fetchNotes();
            Alert.alert('Éxito', `Se importaron ${newNotes.length} notas.`);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', `Error al importar el archivo.\n${(error as any)?.message || ''}`);
        }
    };

    const handleExport = () => {
        if (notes.length === 0) {
            Alert.alert('Sin notas', 'No hay notas para exportar.');
            return;
        }

        ExportService.showExportMenu(notes, async (format) => {
            switch (format) {
                case 'excel':
                    await ExportService.exportToExcel(notes);
                    break;
                case 'csv':
                    await ExportService.exportToCSV(notes);
                    break;
                case 'json':
                    await ExportService.exportToJSON(notes);
                    break;
            }
        });
    };

    return {
        notes,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        sortOrder,
        setSortOrder,
        fetchNotes,
        handleImport,
        handleExport
    };
};
