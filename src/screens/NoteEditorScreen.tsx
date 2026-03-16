import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Image
} from 'react-native';
import { ArrowLeft, Trash2, Calendar, Share2, Lock, Unlock, Sparkles, Zap } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { GrassBackground } from '../components/GrassBackground';
import { theme } from '../theme/colors';
import { Note, Category } from '../types/note';
import { storageService } from '../services/storage';
import { ExportService } from '../services/export';
import { aiService } from '../services/ai';
import { useSecurity } from '../context/SecurityContext';
import { ActivityIndicator } from 'react-native';

interface NoteEditorScreenProps {
    navigation: any;
    route: any;
    isDarkMode: boolean;
}

const CATEGORY_CONFIG: { label: Category; iconUrl: string }[] = [
    {
        label: 'Teología',
        iconUrl: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Church/3D/church_3d.png'
    },
    {
        label: 'Filosofía',
        iconUrl: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Moai/3D/moai_3d.png'
    },
];

export const NoteEditorScreen: React.FC<NoteEditorScreenProps> = ({ navigation, route, isDarkMode }) => {
    const existingNote = route.params?.note as Note | undefined;

    const [title, setTitle] = useState(existingNote?.title || '');
    const [content, setContent] = useState(existingNote?.content || '');
    const [category, setCategory] = useState<Category>(existingNote?.category || 'Teología');
    const [createdAt, setCreatedAt] = useState(existingNote?.createdAt || Date.now());
    const [isPrivate, setIsPrivate] = useState(existingNote?.isPrivate || false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isAILoading, setIsAILoading] = useState(false);

    const { masterKey } = useSecurity();
    const colors = isDarkMode ? theme.dark : theme.light;

    const handleAIOptimize = async () => {
        if (!title.trim() && !content.trim()) {
            Alert.alert('Escribe algo', 'Escribe al menos un título o algo de contenido para que la IA pueda ayudarte.');
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
            navigation.goBack();
            return;
        }

        const now = Date.now();
        const noteData: Note = {
            id: existingNote?.id || Math.random().toString(36).substr(2, 9),
            title: title.trim(),
            content: content.trim(),
            category,
            createdAt: createdAt,
            updatedAt: now,
            isPrivate,
        };

        try {
            if (existingNote) {
                await storageService.updateNote(noteData, masterKey || undefined);
            } else {
                await storageService.addNote(noteData, masterKey || undefined);
            }
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', (error as Error).message);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Eliminar nota',
            '¿Estás seguro de que quieres eliminar esta nota?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        if (existingNote) {
                            await storageService.deleteNote(existingNote.id, masterKey || undefined);
                        }
                        navigation.goBack();
                    }
                },
            ]
        );
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
            updatedAt: Date.now()
        };

        await ExportService.exportNoteAsText(noteToExport);
    };

    return (
        <GrassBackground colors={colors.background}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={[styles.backBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}
                    >
                        <ArrowLeft color={colors.text} size={24} />
                    </TouchableOpacity>

                    <View style={styles.headerRight}>
                        <TouchableOpacity 
                            onPress={() => setIsPrivate(!isPrivate)} 
                            style={styles.exportBtn}
                        >
                            {isPrivate ? (
                                <Lock color={colors.accent} size={22} strokeWidth={2.5} />
                            ) : (
                                <Unlock color={colors.textSecondary} size={22} strokeWidth={2} />
                            )}
                        </TouchableOpacity>
                        {existingNote && (
                            <>
                                <TouchableOpacity onPress={handleExportNote} style={styles.exportBtn}>
                                    <Share2 color={colors.accent} size={22} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
                                    <Trash2 color="#EF4444" size={24} />
                                </TouchableOpacity>
                            </>
                        )}
                        <TouchableOpacity
                            onPress={handleSave}
                            style={[styles.saveBtn, { backgroundColor: isDarkMode ? '#FFFFFF' : '#000000' }]}
                        >
                            <Text style={[styles.saveText, { color: isDarkMode ? '#000000' : '#FFFFFF' }]}>Guardar</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                    <View style={styles.categoryRow}>
                        {CATEGORY_CONFIG.map((cat) => (
                            <TouchableOpacity
                                key={cat.label}
                                onPress={() => setCategory(cat.label)}
                                style={[
                                    styles.categoryChip,
                                    category === cat.label
                                        ? { backgroundColor: colors.accent }
                                        : { borderColor: colors.textSecondary, borderWidth: 1 },
                                    { flexDirection: 'row', alignItems: 'center' }
                                ]}
                            >
                                <Image source={{ uri: cat.iconUrl }} style={styles.categoryIcon} />
                                <Text
                                    style={[
                                        styles.categoryText,
                                        { color: category === cat.label ? '#FFFFFF' : colors.textSecondary }
                                    ]}
                                >
                                    {cat.label.toUpperCase()}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity 
                        style={[
                            styles.aiOptimizeBtn, 
                            { 
                                backgroundColor: isDarkMode ? 'rgba(168, 85, 247, 0.15)' : 'rgba(168, 85, 247, 0.1)',
                                borderColor: '#A855F7',
                                borderWidth: 1
                            }
                        ]}
                        onPress={handleAIOptimize}
                        disabled={isAILoading}
                    >
                        {isAILoading ? (
                            <ActivityIndicator size="small" color="#A855F7" />
                        ) : (
                            <Sparkles size={18} color="#A855F7" />
                        )}
                        <Text style={[styles.aiOptimizeText, { color: '#A855F7' }]}>
                            {isAILoading ? 'Optimizando...' : 'IA: Optimizar nota'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setShowDatePicker(true)}
                        style={[styles.datePickerBtn, { borderColor: colors.textSecondary + '40', borderWidth: 1 }]}
                    >
                        <Calendar size={18} color={colors.accent} />
                        <Text style={[styles.datePickerText, { color: colors.textSecondary }]}>
                            {new Date(createdAt).toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            })}
                        </Text>
                    </TouchableOpacity>

                    {showDatePicker && (
                        <DateTimePicker
                            value={new Date(createdAt)}
                            mode="date"
                            display="default"
                            onChange={(event, selectedDate) => {
                                setShowDatePicker(false);
                                if (selectedDate) {
                                    setCreatedAt(selectedDate.getTime());
                                }
                            }}
                        />
                    )}

                    <TextInput
                        style={[styles.titleInput, { color: colors.text }]}
                        placeholder="Título de la nota"
                        placeholderTextColor={colors.textSecondary}
                        value={title}
                        onChangeText={setTitle}
                        multiline
                    />

                    <TextInput
                        style={[styles.contentInput, { color: colors.textSecondary }]}
                        placeholder="Escribe algo increíble..."
                        placeholderTextColor={colors.textSecondary + '80'}
                        value={content}
                        onChangeText={setContent}
                        multiline
                        textAlignVertical="top"
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </GrassBackground>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 50,
        paddingBottom: 20,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    backBtn: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteBtn: {
        padding: 8,
    },
    exportBtn: {
        padding: 8,
        marginRight: 4,
    },
    saveBtn: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 14,
        elevation: 4,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    saveText: {
        fontWeight: '800',
        fontSize: 16,
    },
    content: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    aiRow: {
        flexDirection: 'row',
        gap: 12,
        marginVertical: 12,
    },
    aiBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        gap: 8,
    },
    aiBtnText: {
        fontWeight: '700',
        fontSize: 13,
    },
    categoryRow: {
        flexDirection: 'row',
        gap: 10,
        marginVertical: 20,
    },
    aiOptimizeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 16,
        gap: 10,
        marginBottom: 20,
        alignSelf: 'flex-start',
    },
    aiOptimizeText: {
        fontWeight: '800',
        fontSize: 14,
    },
    categoryChip: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    categoryIcon: {
        width: 20,
        height: 20,
        marginRight: 8,
    },
    categoryText: {
        fontWeight: '800',
        fontSize: 12,
        letterSpacing: 0.5,
    },
    datePickerBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        gap: 10,
        marginBottom: 20,
    },
    datePickerText: {
        fontWeight: '600',
        fontSize: 14,
    },
    titleInput: {
        fontSize: 36,
        fontWeight: '900',
        marginVertical: 10,
        letterSpacing: -0.5,
    },
    contentInput: {
        fontSize: 18,
        fontWeight: '500',
        lineHeight: 28,
        marginTop: 10,
        minHeight: 300,
    },
});
