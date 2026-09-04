import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { securityService } from '../../data/repositories/security';
import { backupService } from '../../data/repositories/backup';

const GRACE_PERIOD_MS = 2 * 60 * 1000;

interface SecurityContextValue {
    loading: boolean;
    hasPin: boolean;
    requirePinSetup: boolean;
    canUseBiometrics: boolean;
    isUnlocked: boolean;
    masterKey: string | null;
    lastError: string | null;
    unlockWithPin: (pin: string) => Promise<boolean>;
    unlockWithBiometrics: () => Promise<boolean>;
    setPin: (pin: string) => Promise<boolean>;
    lock: () => void;
    lockNow: () => void;
    clearError: () => void;
}

const SecurityContext = createContext<SecurityContextValue | undefined>(undefined);

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState({
        loading: true,
        hasPin: false,
        requirePinSetup: true,
        canUseBiometrics: false,
        isUnlocked: false,
        masterKey: null as string | null,
        lastError: null as string | null,
    });

    const graceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearGraceTimer = () => {
        if (graceTimerRef.current) {
            clearTimeout(graceTimerRef.current);
            graceTimerRef.current = null;
        }
    };

    const lock = () => {
        clearGraceTimer();
        setState((prev) => ({
            ...prev,
            isUnlocked: false,
            masterKey: null,
        }));
    };

    const lockNow = () => {
        clearGraceTimer();
        setState((prev) => ({
            ...prev,
            isUnlocked: false,
            masterKey: null,
        }));
    };

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const [hasPin, canUseBiometrics] = await Promise.all([
                    securityService.hasPin(),
                    securityService.isBiometricAvailable(),
                ]);

                try {
                    await backupService.createSafeBackup();
                } catch {
                    /* Ignorar errores para no bloquear el inicio */
                }
                if (!mounted) {
                    return;
                }
                setState((prev) => ({
                    ...prev,
                    hasPin,
                    requirePinSetup: !hasPin,
                    canUseBiometrics,
                    loading: false,
                }));
            } catch (error) {
                console.error('Error inicializando seguridad', error);
                if (!mounted) return;
                setState((prev) => ({
                    ...prev,
                    loading: false,
                    lastError: 'No se pudo inicializar la configuración de seguridad.',
                }));
            }
        })();

        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        const handleAppStateChange = (nextState: AppStateStatus) => {
            if (nextState !== 'active') {
                clearGraceTimer();
                graceTimerRef.current = setTimeout(() => {
                    setState((prev) => ({
                        ...prev,
                        isUnlocked: false,
                        masterKey: null,
                    }));
                }, GRACE_PERIOD_MS);
            } else {
                clearGraceTimer();
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => {
            subscription.remove();
            clearGraceTimer();
        };
    }, []);

    const clearError = () => {
        setState((prev) => ({
            ...prev,
            lastError: null,
        }));
    };

    const unlockWithPin = async (pin: string) => {
        try {
            const result = await securityService.verifyPin(pin);
            if (!result.success || !result.masterKey) {
                setState((prev) => ({
                    ...prev,
                    lastError: 'PIN incorrecto.',
                }));
                return false;
            }

            setState((prev) => ({
                ...prev,
                isUnlocked: true,
                masterKey: result.masterKey ?? null,
                lastError: null,
            }));
            return true;
        } catch (error) {
            console.error('Error al validar PIN', error);
            setState((prev) => ({
                ...prev,
                lastError: 'No se pudo verificar el PIN.',
            }));
            return false;
        }
    };

    const unlockWithBiometrics = async () => {
        try {
            const result = await securityService.unlockWithBiometrics();
            if (!result.success || !result.masterKey) {
                const errorMessages: Record<string, string> = {
                    user_cancel: 'Autenticación biométrica cancelada.',
                    timeout: 'Tiempo agotado. Intenta de nuevo.',
                    lockout: 'Demasiados intentos. Usa tu PIN.',
                    not_enrolled: 'No hay huellas registradas en el dispositivo.',
                    authentication_failed: 'Huella no reconocida. Intenta de nuevo.',
                    not_available: 'Autenticación biométrica no disponible.',
                };
                const message = errorMessages[result.error ?? ''] || 'Error en autenticación biométrica.';
                setState((prev) => ({
                    ...prev,
                    lastError: message,
                }));
                return false;
            }
            setState((prev) => ({
                ...prev,
                isUnlocked: true,
                masterKey: result.masterKey ?? null,
                lastError: null,
            }));
            return true;
        } catch (error) {
            console.error('Error biométrico', error);
            setState((prev) => ({
                ...prev,
                lastError: 'No se pudo completar la autenticación biométrica.',
            }));
            return false;
        }
    };

    const setPin = async (pin: string) => {
        try {
            await securityService.setPin(pin);
            const verification = await securityService.verifyPin(pin);
            setState((prev) => ({
                ...prev,
                hasPin: true,
                requirePinSetup: false,
                isUnlocked: verification.success,
                masterKey: verification.masterKey ?? null,
                lastError: null,
            }));
            return true;
        } catch (error) {
            console.error('Error guardando PIN', error);
            setState((prev) => ({
                ...prev,
                lastError: error instanceof Error ? error.message : 'No se pudo guardar el PIN.',
            }));
            return false;
        }
    };

    const value = useMemo<SecurityContextValue>(
        () => ({
            loading: state.loading,
            hasPin: state.hasPin,
            requirePinSetup: state.requirePinSetup,
            canUseBiometrics: state.canUseBiometrics,
            isUnlocked: state.isUnlocked,
            masterKey: state.masterKey,
            lastError: state.lastError,
            unlockWithPin,
            unlockWithBiometrics,
            setPin,
            lock,
            lockNow,
            clearError,
        }),
        [state],
    );

    return <SecurityContext.Provider value={value}>{children}</SecurityContext.Provider>;
};

export const useSecurity = () => {
    const ctx = useContext(SecurityContext);
    if (!ctx) {
        throw new Error('useSecurity debe usarse dentro de SecurityProvider');
    }
    return ctx;
};
