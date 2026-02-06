import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Plus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme/colors';

interface FABProps {
    onPress: () => void;
    isDarkMode: boolean;
}

export const FAB: React.FC<FABProps> = ({ onPress, isDarkMode }) => {
    const colors = isDarkMode ? theme.dark : theme.light;

    return (
        <TouchableOpacity
            onPress={onPress}
            style={styles.touchable}
            activeOpacity={0.8}
        >
            <LinearGradient
                colors={colors.fab}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.container, { shadowColor: colors.fab[1] }]}
            >
                <Plus color="#FFFFFF" size={32} strokeWidth={2.5} />
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    touchable: {
        position: 'absolute',
        right: 24,
        bottom: 32,
    },
    container: {
        width: 68,
        height: 68,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
    },
});
