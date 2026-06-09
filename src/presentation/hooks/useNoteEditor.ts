import { useState, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { Note, Category } from '../../domain/entities/note';
import { storageService } from '../../data/repositories/storage';
import { firestoreService } from '../../data/repositories/firestore';
import { ExportService } from '../../data/repositories/export';
import { aiService } from '../../data/infrastructure/ai';
import { useSecurity } from '../context/SecurityContext';

export const useNoteEditor = (existingNote?: Note, navigation?: any) => {
    const [title, setTitle] = useState(existingNote?.title || '');
    const [content, setContent] = useState(existingNote?.content || '');
    const [category, setCategory] = useState<Category>(existingNote?.category || 'Teología');
    const [createdAt, setCreatedAt] = useState(existingNote?.createdAt || Date.now());
    const [isPrivate, setIsPrivate] = useState(existingNote?.isPrivate || false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isAILoading, setIsAILoading] = useState(false);

    const { masterKey } = useSecurity();

    // Referencias para el Autoguardado
    const noteIdRef = useRef(existingNote?.id || Math.random().toString(36).substr(2, 9));
    const isFirstSaveRef = useRef(!existingNote);
    const hasUnsavedChangesRef = useRef(false);

    useEffect(() => {
        // No auto-guardar si no hay ni título ni contenido
        if (!title.trim() && !content.trim()) return;

        hasUnsavedChangesRef.current = true;

        const timer = setTimeout(async () => {
            if (!hasUnsavedChangesRef.current) return; // Ya se guardó
            
            const now = Date.now();
            const noteData: Note = {
                id: noteIdRef.current,
                title: title.trim() || 'Sin título',
                content: content.trim(),
                category,
                createdAt: createdAt,
                updatedAt: now,
                isPrivate,
            };

            try {
                if (isFirstSaveRef.current) {
                    await storageService.addNote(noteData, masterKey || undefined);
                    isFirstSaveRef.current = false;
                } else {
                    await storageService.updateNote(noteData, masterKey || undefined);
                }

                // Intento silencioso a la nube
                firestoreService.syncNoteToCloud(noteData, masterKey || undefined).catch(() => {});
                
                hasUnsavedChangesRef.current = false;
                console.log('✅ Autoguardado silencioso exitoso');
            } catch (e) {
                console.warn('Error en autoguardado silencioso', e);
            }
        }, 2000); // 2 segundos de inactividad

        return () => clearTimeout(timer);
    }, [title, content, category, isPrivate, masterKey, createdAt]);

    const handleAIOptimize = async () => {
        if (!title.trim() && !content.trim()) {
            Alert.alert(
                'Escribe algo',
                'Escribe al menos un título o algo de contenido para que la IA pueda ayudarte.',
            );
            return;
        }

        setIsAILoading(true);
        try {
            const result = await aiService.optimizeNote(title, content);
            setTitle(result.title);
            setContent(result.content);
        } catch (error) {
            Alert.alert('Error de IA', (error as Error).message);
        } finally {
            setIsAILoading(false);
        }
    };

    const handleSave = async () => {
        if (!title.trim() && !content.trim()) {
            if (navigation?.canGoBack()) navigation.goBack();
            return;
        }

        const now = Date.now();
        const noteData: Note = {
            id: noteIdRef.current,
            title: title.trim(),
            content: content.trim(),
            category,
            createdAt: createdAt,
            updatedAt: now,
            isPrivate,
        };

        try {
            if (!isFirstSaveRef.current) {
                await storageService.updateNote(noteData, masterKey || undefined);
            } else {
                await storageService.addNote(noteData, masterKey || undefined);
                isFirstSaveRef.current = false;
            }

            hasUnsavedChangesRef.current = false;

            try {
                await firestoreService.syncNoteToCloud(noteData, masterKey || undefined);
            } catch (cloudError) {
                console.warn('[Firestore] Sin conexión, se sincronizará luego.', cloudError);
            }

            if (navigation?.canGoBack()) navigation.goBack();
        } catch (error) {
            Alert.alert(
                'Error al guardar',
                'No se pudo guardar la nota: ' + (error as Error).message,
            );
        }
    };

    const handleDelete = () => {
        Alert.alert('Eliminar nota', '¿Estás seguro de que quieres eliminar esta nota?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Eliminar',
                style: 'destructive',
                onPress: async () => {
                    if (existingNote) {
                        try {
                            await firestoreService.deleteNote(existingNote.id);
                        } catch {
                            /* sin internet, solo borra local */
                        }
                        await storageService.deleteNote(existingNote.id, masterKey || undefined);
                    }
                    if (navigation?.canGoBack()) navigation.goBack();
                },
            },
        ]);
    };

    const handleExportNote = async () => {
        if (!title.trim() && !content.trim()) {
            Alert.alert('Nota vacía', 'No hay contenido para exportar.');
            return;
        }

        const noteToExport: Note = {
            id: existingNote?.id || '',
            title,
            content,
            category,
            createdAt,
            updatedAt: Date.now(),
        };

        await ExportService.exportNoteAsText(noteToExport);
    };

    return {
        title,
        setTitle,
        content,
        setContent,
        category,
        setCategory,
        createdAt,
        setCreatedAt,
        isPrivate,
        setIsPrivate,
        showDatePicker,
        setShowDatePicker,
        isAILoading,
        handleAIOptimize,
        handleSave,
        handleDelete,
        handleExportNote,
    };
};
