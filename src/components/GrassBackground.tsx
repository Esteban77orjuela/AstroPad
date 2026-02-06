import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type GradientColors = readonly [string, string, ...string[]];

interface GrassBackgroundProps {
    children: React.ReactNode;
    colors: readonly string[];
}

export const GrassBackground: React.FC<GrassBackgroundProps> = ({ children, colors }) => {
    // Ensure we have at least 2 colors for LinearGradient
    const gradientColors: GradientColors = colors.length >= 2
        ? (colors as GradientColors)
        : [colors[0] || '#FFFFFF', colors[0] || '#FFFFFF'];

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={gradientColors}
                style={styles.gradient}
            >
                {children}
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
    },
});
