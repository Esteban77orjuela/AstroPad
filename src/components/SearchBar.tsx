import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Search } from 'lucide-react-native';
import { theme } from '../theme/colors';

interface SearchBarProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    isDarkMode: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, setSearchQuery, isDarkMode }) => {
    const colors = isDarkMode ? theme.dark : theme.light;

    return (
        <View style={styles.container}>
            <View style={[styles.inputContainer, { backgroundColor: colors.input }]}>
                <TextInput
                    placeholder="Buscar notas..."
                    placeholderTextColor={colors.textSecondary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    style={[styles.input, { color: colors.text }]}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 24,
        marginBottom: 8,
    },
    inputContainer: {
        height: 54,
        borderRadius: 16,
        paddingHorizontal: 20,
        justifyContent: 'center',
    },
    input: {
        fontSize: 16,
        fontWeight: '500',
    },
});
