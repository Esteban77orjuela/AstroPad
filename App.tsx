import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { HomeScreen } from './src/screens/HomeScreen';
import { NoteEditorScreen } from './src/screens/NoteEditorScreen';
import { Note } from './src/types/note';

export type RootStackParamList = {
    Home: undefined;
    Editor: { note?: Note };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
    const [isDarkMode, setIsDarkMode] = useState(false);

    const toggleTheme = () => setIsDarkMode(!isDarkMode);

    return (
        <SafeAreaProvider>
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
        </SafeAreaProvider>
    );
}
