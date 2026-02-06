import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { theme } from '../theme/colors';
import { Note } from '../types/note';

interface NoteCardProps {
    note: Note;
    onPress: () => void;
    isDarkMode: boolean;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, onPress, isDarkMode }) => {
    const colors = isDarkMode ? theme.dark : theme.light;

    const dateStr = new Date(note.createdAt).toLocaleDateString('es-ES', {
        month: 'short',
        day: 'numeric',
    }).toUpperCase();

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            style={[
                styles.container,
                {
                    backgroundColor: colors.card,
                    shadowColor: colors.shadow
                }
            ]}
        >
            <View style={styles.content}>
                <View style={styles.cardHeader}>
                    <Text style={[styles.category, { color: colors.accent }]}>
                        {note.category.toUpperCase()}
                    </Text>
                    <Text style={[styles.date, { color: colors.textSecondary }]}>
                        {dateStr}
                    </Text>
                </View>
                <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                    {note.title || 'Sin Título'}
                </Text>
                <Text style={[styles.body, { color: colors.textSecondary }]} numberOfLines={3}>
                    {note.content || 'Sin contenido...'}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 24,
        marginVertical: 8,
        borderRadius: 20,
        padding: 20,
        elevation: 3,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
    },
    content: {
        gap: 8,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    category: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1,
    },
    date: {
        fontSize: 10,
        fontWeight: '600',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
    },
    body: {
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 20,
    },
});
