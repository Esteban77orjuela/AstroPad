import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, FlatList, Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { GrassBackground } from '../components/GrassBackground';
import { Header } from '../components/Header';
import { SearchBar } from '../components/SearchBar';
import { ToolBar } from '../components/ToolBar';
import { CategoryFilter } from '../components/CategoryFilter';
import { NoteCard } from '../components/NoteCard';
import { EmptyState } from '../components/EmptyState';
import { FAB } from '../components/FAB';
import { theme } from '../theme/colors';
import { storageService } from '../services/storage';
import { ExportService } from '../services/export';
import { useSecurity } from '../context/SecurityContext';
import { Note, Category } from '../types/note';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as XLSX from 'xlsx';
import { Alert } from 'react-native';

interface HomeScreenProps {
    navigation: any;
    isDarkMode: boolean;
    toggleTheme: () => void;
}

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
    const lines = csv.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length === 0) return [];

    const headers = parseCsvLine(lines[0]).map(h => h.replace(/^\uFEFF/, '').trim());

    return lines.slice(1).map(line => {
        const cols = parseCsvLine(line);
        const row: any = {};

        headers.forEach((header, index) => {
            row[header] = cols[index] ?? '';
        });

        return row;
    });
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, isDarkMode, toggleTheme }) => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<Category>('Todas');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const { masterKey } = useSecurity();
    const colors = isDarkMode ? theme.dark : theme.light;

    const fetchNotes = useCallback(async () => {
        const allNotes = await storageService.getNotes(masterKey || undefined);
        setNotes(allNotes);
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

            const isCsv =
                extension === 'csv' ||
                mimeType.includes('csv') ||
                mimeType === 'text/plain';

            if (isCsv) {
                const csvContent = uri.startsWith('content://')
                    ? await (FileSystem as any).StorageAccessFramework.readAsStringAsync(uri, { encoding: 'utf8' })
                    : await FileSystem.readAsStringAsync(uri, { encoding: 'utf8' });

                data = parseCsv(csvContent);
            } else {
                const base64 = uri.startsWith('content://')
                    ? await (FileSystem as any).StorageAccessFramework.readAsStringAsync(uri, { encoding: 'base64' })
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
            Alert.alert(
                'Error',
                `Error al importar el archivo. Asegúrate de que sea un Excel (.xlsx) o CSV válido.\n${(error as any)?.message || ''}`
            );
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

    useFocusEffect(
        useCallback(() => {
            fetchNotes();
        }, [fetchNotes])
    );

    const filteredNotes = notes.filter(note => {
        const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.content.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'Todas' || note.category === selectedCategory;
        return matchesSearch && matchesCategory;
    }).sort((a, b) => {
        if (sortOrder === 'desc') {
            return b.createdAt - a.createdAt;
        } else {
            return a.createdAt - b.createdAt;
        }
    });

    return (
        <GrassBackground colors={colors.background}>
            <Header
                isDarkMode={isDarkMode}
                toggleTheme={toggleTheme}
            />

            <View style={{ flex: 1 }}>
                <SearchBar
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    isDarkMode={isDarkMode}
                />

                <ToolBar
                    isDarkMode={isDarkMode}
                    onImport={handleImport}
                    onExport={handleExport}
                    sortOrder={sortOrder}
                    toggleSortOrder={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                />

                <CategoryFilter
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    isDarkMode={isDarkMode}
                />

                {filteredNotes.length > 0 ? (
                    <FlatList
                        data={filteredNotes}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <NoteCard
                                note={item}
                                onPress={() => navigation.navigate('Editor', { note: item })}
                                isDarkMode={isDarkMode}
                            />
                        )}
                        contentContainerStyle={styles.list}
                        showsVerticalScrollIndicator={false}
                    />
                ) : (
                    <EmptyState isDarkMode={isDarkMode} />
                )}
            </View>

            <FAB
                onPress={() => navigation.navigate('Editor')}
                isDarkMode={isDarkMode}
            />
        </GrassBackground>
    );
};

const styles = StyleSheet.create({
    list: {
        paddingBottom: 100,
    },
});
