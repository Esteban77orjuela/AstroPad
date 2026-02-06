import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FileUp, FileDown, SortAsc, SortDesc } from 'lucide-react-native';
import { theme } from '../theme/colors';

interface ToolBarProps {
    isDarkMode: boolean;
    onImport: () => void;
    onExport: () => void;
    sortOrder: 'asc' | 'desc';
    toggleSortOrder: () => void;
}

export const ToolBar: React.FC<ToolBarProps> = ({
    isDarkMode,
    onImport,
    onExport,
    sortOrder,
    toggleSortOrder
}) => {
    const colors = isDarkMode ? theme.dark : theme.light;

    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={onImport}
                activeOpacity={0.7}
                style={[styles.toolBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)' }]}
            >
                <FileUp size={18} color={colors.accent} />
                <Text style={[styles.toolText, { color: colors.text }]}>Importar</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={onExport}
                activeOpacity={0.7}
                style={[styles.toolBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)' }]}
            >
                <FileDown size={18} color={colors.accentSecondary} />
                <Text style={[styles.toolText, { color: colors.text }]}>Exportar</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={toggleSortOrder}
                activeOpacity={0.7}
                style={[styles.toolBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)' }]}
            >
                {sortOrder === 'desc' ? (
                    <SortDesc size={18} color={colors.accent} />
                ) : (
                    <SortAsc size={18} color={colors.accent} />
                )}
                <Text style={[styles.toolText, { color: colors.text }]}>
                    {sortOrder === 'desc' ? 'Recientes' : 'Antiguos'}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        gap: 10,
        marginBottom: 8,
        flexWrap: 'wrap',
    },
    toolBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 14,
        gap: 6,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    toolText: {
        fontSize: 13,
        fontWeight: '700',
    },
});
