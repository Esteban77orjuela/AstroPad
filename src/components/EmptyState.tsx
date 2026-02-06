import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { theme } from '../theme/colors';

interface EmptyStateProps {
    isDarkMode: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ isDarkMode }) => {
    const colors = isDarkMode ? theme.dark : theme.light;

    return (
        <View style={styles.container}>
            <Sparkles
                size={80}
                color={colors.textSecondary}
                strokeWidth={1}
                style={styles.icon}
            />
            <Text style={[styles.text, { color: colors.textSecondary }]}>VOID DETECTED</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 100,
    },
    icon: {
        opacity: 0.3,
        marginBottom: 20,
    },
    text: {
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 2,
        opacity: 0.5,
    },
});
