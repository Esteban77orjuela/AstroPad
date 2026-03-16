import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';

import { HomeScreen } from './src/screens/HomeScreen';
import { NoteEditorScreen } from './src/screens/NoteEditorScreen';
import { LockScreen } from './src/screens/LockScreen';
import { SecurityProvider, useSecurity } from './src/context/SecurityContext';
import { Note } from './src/types/note';
import { theme } from './src/theme/colors';

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

export default function App() {
    return (
        <SafeAreaProvider>
            <SecurityProvider>
                <AppContent />
            </SecurityProvider>
        </SafeAreaProvider>
    );
}
