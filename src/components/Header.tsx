import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Moon, Sun } from 'lucide-react-native';
import { theme } from '../theme/colors';
import { AstraPadLogo } from './AstraPadLogo';

interface HeaderProps {
    isDarkMode: boolean;
    toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
    isDarkMode,
    toggleTheme
}) => {
    const colors = isDarkMode ? theme.dark : theme.light;
    const today = new Date();
    const dateStr = today.toLocaleDateString('es-ES', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    }).toUpperCase();

    return (
        <View style={styles.container}>
            <View style={styles.left}>
                <AstraPadLogo isDarkMode={isDarkMode} />
                <Text style={[styles.date, { color: colors.textSecondary }]}>{dateStr}</Text>
            </View>
            <TouchableOpacity
                onPress={toggleTheme}
                activeOpacity={0.7}
                style={[styles.actionBtn, { backgroundColor: isDarkMode ? colors.card : '#FFFFFF', shadowColor: colors.shadow }]}
            >
                {isDarkMode ? (
                    <Sun size={20} color={colors.text} />
                ) : (
                    <Moon size={20} color={colors.text} />
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 50,
        paddingBottom: 10,
    },
    left: {
        flex: 1,
        paddingRight: 12,
    },
    date: {
        fontSize: 12,
        fontWeight: '700',
        marginTop: 2,
        letterSpacing: 0.5,
        opacity: 0.6,
    },
    actionBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
        elevation: 4,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
});
