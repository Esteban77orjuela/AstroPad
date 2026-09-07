import 'react-native-gesture-handler';
import React, { Component, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Text, View } from 'react-native';
import * as Sentry from '@sentry/react-native';

import { HomeScreen } from './src/presentation/screens/HomeScreen';
import { NoteEditorScreen } from './src/presentation/screens/NoteEditorScreen';
import { LockScreen } from './src/presentation/screens/LockScreen';
import { SecurityProvider, useSecurity } from './src/presentation/context/SecurityContext';
import { Note } from './src/domain/entities/note';
import { theme } from './src/presentation/theme/colors';

interface ErrorBoundaryProps {
    children: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    message: string;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = { hasError: false, message: '' };

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, message: error?.message || 'Error desconocido' };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error('ErrorBoundary capturó un error:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: 30,
                        backgroundColor: '#0F172A',
                    }}
                >
                    <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '900', marginBottom: 12 }}>
                        Algo salió mal
                    </Text>
                    <Text style={{ color: '#94A3B8', textAlign: 'center', fontSize: 14 }}>
                        {this.state.message}
                    </Text>
                </View>
            );
        }
        return this.props.children;
    }
}

// --- FASE 11: OBSERVABILIDAD (Sentry) ---
Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN || '',
    // Captura el 20% de las sesiones normales para ver tiempos de rendimiento
    tracesSampleRate: 0.2,
    // En desarrollo, no enviar errores reales
    enabled: !__DEV__,
    debug: false,
});

export type RootStackParamList = {
    Home: undefined;
    Editor: { note?: Note };
};

const Stack = createStackNavigator<RootStackParamList>();

function AppContent() {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const { loading, isUnlocked, requirePinSetup } = useSecurity();
    
    const toggleTheme = () => setIsDarkMode(!isDarkMode);
    const colors = isDarkMode ? theme.dark : theme.light;

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background[0] }}>
                <ActivityIndicator size="large" color={colors.accent} />
            </View>
        );
    }

    if (!isUnlocked || requirePinSetup) {
        return (
            <>
                <LockScreen isDarkMode={isDarkMode} />
                <StatusBar style={isDarkMode ? 'light' : 'dark'} />
            </>
        );
    }

    return (
        <>
            <NavigationContainer>
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="Home">
                        {(props) => <HomeScreen {...props} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />}
                    </Stack.Screen>
                    <Stack.Screen name="Editor">
                        {(props) => <NoteEditorScreen {...props} isDarkMode={isDarkMode} />}
                    </Stack.Screen>
                </Stack.Navigator>
            </NavigationContainer>
            <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        </>
    );
}

function App() {
    return (
        <ErrorBoundary>
            <SafeAreaProvider>
                <SecurityProvider>
                    <AppContent />
                </SecurityProvider>
            </SafeAreaProvider>
        </ErrorBoundary>
    );
}

// --- FASE 11: OBSERVABILIDAD ---
// Sentry envuelve la App completa. Cualquier crash que ocurra en producción
// será capturado y enviado a tu panel en sentry.io automáticamente.
export default Sentry.wrap(App);
