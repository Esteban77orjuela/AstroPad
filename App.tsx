import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import * as Sentry from '@sentry/react-native';

import { HomeScreen } from './src/presentation/screens/HomeScreen';
import { NoteEditorScreen } from './src/presentation/screens/NoteEditorScreen';
import { LockScreen } from './src/presentation/screens/LockScreen';
import { SecurityProvider, useSecurity } from './src/presentation/context/SecurityContext';
import { Note } from './src/domain/entities/note';
import { theme } from './src/presentation/theme/colors';

// --- FASE 11: OBSERVABILIDAD (Sentry) ---
// Para activar el monitoreo en producción:
// 1. Créate una cuenta gratuita en https://sentry.io
// 2. Crea un proyecto de tipo "React Native".
// 3. Copia el DSN que te dan y pégalo en el archivo .env como: EXPO_PUBLIC_SENTRY_DSN=tu_dsn_aqui
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
        <SafeAreaProvider>
            <SecurityProvider>
                <AppContent />
            </SecurityProvider>
        </SafeAreaProvider>
    );
}

// --- FASE 11: OBSERVABILIDAD ---
// Sentry envuelve la App completa. Cualquier crash que ocurra en producción
// será capturado y enviado a tu panel en sentry.io automáticamente.
export default Sentry.wrap(App);
