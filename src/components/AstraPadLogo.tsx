import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Ellipse, Circle, Defs, RadialGradient, Stop, G } from 'react-native-svg';

interface AstraPadLogoProps {
    isDarkMode: boolean;
}

export const AstraPadLogo: React.FC<AstraPadLogoProps> = ({ isDarkMode }) => {
    const astraColor = isDarkMode ? '#FFFFFF' : '#0F172A';
    const orbitColor = isDarkMode ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.25)';
    const orbitColorSecondary = isDarkMode ? 'rgba(34, 211, 238, 0.2)' : 'rgba(34, 211, 238, 0.15)';

    // Animación de rotación para los planetas
    const rotation = useRef(new Animated.Value(0)).current;
    const rotation2 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Órbita principal (sentido horario)
        Animated.loop(
            Animated.timing(rotation, {
                toValue: 1,
                duration: 20000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();

        // Órbita secundaria (sentido antihorario)
        Animated.loop(
            Animated.timing(rotation2, {
                toValue: -1,
                duration: 15000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    const spin = rotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const spin2 = rotation2.interpolate({
        inputRange: [-1, 0],
        outputRange: ['-360deg', '0deg'],
    });

    return (
        <View style={styles.container}>
            {/* Órbitas y planetas detrás del texto */}
            <View style={styles.orbitContainer}>
                <Svg width="200" height="80" viewBox="0 0 200 80" style={styles.orbitSvg}>
                    <Defs>
                        <RadialGradient id="planetGrad1" cx="50%" cy="50%" rx="50%" ry="50%">
                            <Stop offset="0%" stopColor="#22D3EE" stopOpacity="1" />
                            <Stop offset="100%" stopColor="#6366F1" stopOpacity="0.8" />
                        </RadialGradient>
                        <RadialGradient id="planetGrad2" cx="30%" cy="30%" rx="50%" ry="50%">
                            <Stop offset="0%" stopColor="#A855F7" stopOpacity="1" />
                            <Stop offset="100%" stopColor="#6366F1" stopOpacity="0.9" />
                        </RadialGradient>
                        <RadialGradient id="planetGrad3" cx="40%" cy="40%" rx="50%" ry="50%">
                            <Stop offset="0%" stopColor="#38BDF8" stopOpacity="1" />
                            <Stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.8" />
                        </RadialGradient>
                    </Defs>

                    {/* Órbita principal elíptica */}
                    <Ellipse
                        cx="100"
                        cy="40"
                        rx="90"
                        ry="32"
                        stroke={orbitColor}
                        strokeWidth="1"
                        fill="none"
                    />

                    {/* Órbita secundaria más pequeña */}
                    <Ellipse
                        cx="100"
                        cy="40"
                        rx="75"
                        ry="26"
                        stroke={orbitColorSecondary}
                        strokeWidth="0.5"
                        fill="none"
                        strokeDasharray="4,4"
                    />

                    {/* Polvo cósmico - partículas pequeñas */}
                    <Circle cx="15" cy="38" r="1" fill={isDarkMode ? '#A855F7' : '#6366F1'} opacity="0.4" />
                    <Circle cx="185" cy="42" r="1.2" fill={isDarkMode ? '#22D3EE' : '#0EA5E9'} opacity="0.5" />
                    <Circle cx="30" cy="55" r="0.8" fill="#A855F7" opacity="0.3" />
                    <Circle cx="170" cy="25" r="0.8" fill="#22D3EE" opacity="0.4" />
                    <Circle cx="50" cy="10" r="1" fill="#6366F1" opacity="0.3" />
                    <Circle cx="150" cy="70" r="1" fill="#A855F7" opacity="0.35" />
                    <Circle cx="25" cy="20" r="0.6" fill="#22D3EE" opacity="0.3" />
                    <Circle cx="175" cy="60" r="0.7" fill="#6366F1" opacity="0.3" />
                </Svg>

                {/* Planetas animados en órbita */}
                <Animated.View style={[styles.planetOrbit, { transform: [{ rotate: spin }] }]}>
                    {/* Planeta 1 - Arriba izquierda */}
                    <View style={[styles.planet, styles.planet1]}>
                        <LinearGradient
                            colors={['#22D3EE', '#6366F1']}
                            style={styles.planetGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        />
                    </View>

                    {/* Planeta 2 - Abajo derecha */}
                    <View style={[styles.planet, styles.planet2]}>
                        <LinearGradient
                            colors={['#A855F7', '#6366F1']}
                            style={styles.planetGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        />
                    </View>
                </Animated.View>

                {/* Segunda órbita de planetas */}
                <Animated.View style={[styles.planetOrbit2, { transform: [{ rotate: spin2 }] }]}>
                    {/* Planeta pequeño 1 */}
                    <View style={[styles.planetSmall, styles.planetSmall1]}>
                        <LinearGradient
                            colors={['#38BDF8', '#0EA5E9']}
                            style={styles.planetGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        />
                    </View>

                    {/* Planeta pequeño 2 con anillo */}
                    <View style={[styles.planetWithRing, styles.planetSmall2]}>
                        <View style={styles.ringContainer}>
                            <View style={[styles.ring, { borderColor: isDarkMode ? 'rgba(168, 85, 247, 0.5)' : 'rgba(99, 102, 241, 0.4)' }]} />
                        </View>
                        <LinearGradient
                            colors={['#A855F7', '#7C3AED']}
                            style={styles.planetGradientSmall}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        />
                    </View>
                </Animated.View>
            </View>

            {/* Logo de texto */}
            <View style={styles.textContainer}>
                <View style={styles.textRow}>
                    <Text style={[styles.astra, { color: astraColor }]}>Astra</Text>
                    <MaskedView
                        maskElement={
                            <Text style={[styles.pad, { backgroundColor: 'transparent' }]}>Pad</Text>
                        }
                    >
                        <LinearGradient
                            colors={['#22D3EE', '#6366F1', '#A855F7']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={[styles.pad, { opacity: 0 }]}>Pad</Text>
                        </LinearGradient>
                    </MaskedView>
                </View>
            </View>

            {/* Brillo sutil detrás del texto */}
            <View style={[styles.glow, { backgroundColor: isDarkMode ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)' }]} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        height: 60,
        justifyContent: 'center',
    },
    orbitContainer: {
        position: 'absolute',
        top: -10,
        left: -30,
        width: 200,
        height: 80,
    },
    orbitSvg: {
        position: 'absolute',
    },
    planetOrbit: {
        position: 'absolute',
        width: 200,
        height: 80,
    },
    planetOrbit2: {
        position: 'absolute',
        width: 200,
        height: 80,
    },
    planet: {
        position: 'absolute',
        borderRadius: 50,
        overflow: 'hidden',
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 4,
    },
    planet1: {
        width: 10,
        height: 10,
        top: 5,
        left: 25,
    },
    planet2: {
        width: 8,
        height: 8,
        bottom: 8,
        right: 20,
    },
    planetSmall: {
        position: 'absolute',
        borderRadius: 50,
        overflow: 'hidden',
        shadowColor: '#22D3EE',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 3,
        elevation: 3,
    },
    planetSmall1: {
        width: 6,
        height: 6,
        top: 12,
        right: 35,
    },
    planetSmall2: {
        width: 7,
        height: 7,
        bottom: 15,
        left: 30,
    },
    planetWithRing: {
        position: 'absolute',
        borderRadius: 50,
        overflow: 'visible',
    },
    ringContainer: {
        position: 'absolute',
        width: 14,
        height: 5,
        top: 1,
        left: -3.5,
        transform: [{ rotateX: '70deg' }],
    },
    ring: {
        width: 14,
        height: 5,
        borderRadius: 7,
        borderWidth: 1,
        backgroundColor: 'transparent',
    },
    planetGradient: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
    },
    planetGradientSmall: {
        width: 7,
        height: 7,
        borderRadius: 50,
    },
    textContainer: {
        zIndex: 10,
    },
    textRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    astra: {
        fontSize: 32,
        fontWeight: '900',
        letterSpacing: -1.5,
    },
    pad: {
        fontSize: 32,
        fontWeight: '900',
        letterSpacing: -1.5,
    },
    glow: {
        position: 'absolute',
        top: 10,
        left: 20,
        right: 20,
        height: 40,
        borderRadius: 20,
        zIndex: -1,
    },
});
