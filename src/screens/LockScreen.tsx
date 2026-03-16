import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Dimensions
} from 'react-native';
import { Fingerprint, Lock, ShieldCheck, ArrowRight } from 'lucide-react-native';
import { GrassBackground } from '../components/GrassBackground';
import { AstraPadLogo } from '../components/AstraPadLogo';
import { theme } from '../theme/colors';
import { useSecurity } from '../context/SecurityContext';

const { width } = Dimensions.get('window');

export const LockScreen: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
    const { 
        hasPin, 
        requirePinSetup, 
        canUseBiometrics, 
        unlockWithPin, 
        unlockWithBiometrics, 
        setPin,
        lastError,
        clearError 
    } = useSecurity();

    const [pin, setPinInput] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [isConfirming, setIsConfirming] = useState(false);
    
    const colors = isDarkMode ? theme.dark : theme.light;

    useEffect(() => {
        if (hasPin && canUseBiometrics) {
            handleBiometrics();
        }
    }, [hasPin, canUseBiometrics]);

    useEffect(() => {
        if (lastError) {
            Alert.alert('Seguridad', lastError, [{ text: 'OK', onPress: clearError }]);
        }
    }, [lastError]);

    const handleBiometrics = async () => {
        await unlockWithBiometrics();
    };

    const handlePinAction = async () => {
        if (requirePinSetup) {
            if (!isConfirming) {
                if (pin.length < 4) {
                    Alert.alert('Error', 'El PIN debe tener al menos 4 dígitos');
                    return;
                }
                setIsConfirming(true);
            } else {
                if (pin !== confirmPin) {
                    Alert.alert('Error', 'Los PINs no coinciden');
                    setConfirmPin('');
                    setIsConfirming(false);
                    return;
                }
                await setPin(pin);
            }
        } else {
            const success = await unlockWithPin(pin);
            if (!success) setPinInput('');
        }
    };

    return (
        <GrassBackground colors={colors.background}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <View style={styles.content}>
                    <View style={styles.logoContainer}>
                        <AstraPadLogo isDarkMode={isDarkMode} />
                    </View>

                    <View style={styles.card}>
                        <View style={styles.iconCircle}>
                            <Lock size={32} color={colors.accent} strokeWidth={2.5} />
                        </View>

                        <Text style={[styles.title, { color: colors.text }]}>
                            {requirePinSetup 
                                ? (isConfirming ? 'Confirma tu PIN' : 'Configura tu PIN') 
                                : 'AstraPad Bloqueado'}
                        </Text>
                        
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            {requirePinSetup 
                                ? 'Necesitas un PIN para proteger tus notas privadas.' 
                                : 'Introduce tu PIN para acceder al sistema.'}
                        </Text>

                        <View style={styles.pinContainer}>
                            <TextInput
                                style={[
                                    styles.pinInput, 
                                    { 
                                        color: colors.text,
                                        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                                        borderColor: colors.accent + '40'
                                    }
                                ]}
                                placeholder="****"
                                placeholderTextColor={colors.textSecondary + '40'}
                                keyboardType="number-pad"
                                secureTextEntry
                                maxLength={6}
                                value={isConfirming ? confirmPin : pin}
                                onChangeText={isConfirming ? setConfirmPin : setPinInput}
                            />
                        </View>

                        <TouchableOpacity 
                            style={[styles.mainBtn, { backgroundColor: isDarkMode ? '#FFFFFF' : '#000000' }]}
                            onPress={handlePinAction}
                        >
                            <Text style={[styles.mainBtnText, { color: isDarkMode ? '#000000' : '#FFFFFF' }]}>
                                {isConfirming ? 'Confirmar' : (requirePinSetup ? 'Continuar' : 'Desbloquear')}
                            </Text>
                            <ArrowRight size={20} color={isDarkMode ? '#000000' : '#FFFFFF'} />
                        </TouchableOpacity>

                        {canUseBiometrics && !requirePinSetup && (
                            <TouchableOpacity 
                                style={styles.biometricBtn}
                                onPress={handleBiometrics}
                            >
                                <Fingerprint size={40} color={colors.accent} strokeWidth={1.5} />
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.footer}>
                        <ShieldCheck size={16} color={colors.textSecondary} />
                        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                            PROTECCIÓN ASTRAPAD ACTIVA
                        </Text>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </GrassBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    logoContainer: {
        marginBottom: 50,
        alignItems: 'center',
    },
    card: {
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 30,
        padding: 30,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    iconCircle: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 20,
        paddingHorizontal: 20,
    },
    pinContainer: {
        width: '100%',
        marginBottom: 20,
    },
    pinInput: {
        height: 60,
        borderRadius: 15,
        borderWidth: 1,
        textAlign: 'center',
        fontSize: 24,
        fontWeight: '800',
        letterSpacing: 10,
    },
    mainBtn: {
        width: '100%',
        height: 60,
        borderRadius: 15,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        elevation: 4,
        shadowOpacity: 0.2,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
    },
    mainBtnText: {
        fontSize: 18,
        fontWeight: '800',
    },
    biometricBtn: {
        marginTop: 30,
        padding: 10,
    },
    footer: {
        marginTop: 40,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        opacity: 0.5,
    },
    footerText: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 2,
    }
});
