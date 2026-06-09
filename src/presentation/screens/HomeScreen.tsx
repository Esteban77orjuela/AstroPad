import React, { useCallback } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { GrassBackground } from '../components/GrassBackground';
import { Header } from '../components/Header';
import { SearchBar } from '../components/SearchBar';
import { ToolBar } from '../components/ToolBar';
import { CategoryFilter } from '../components/CategoryFilter';
import { NoteCard } from '../components/NoteCard';
import { EmptyState } from '../components/EmptyState';
import { FAB } from '../components/FAB';
import { theme } from '../theme/colors';
import { useNotes } from '../hooks/useNotes';

interface HomeScreenProps {
    navigation: any;
    isDarkMode: boolean;
    toggleTheme: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, isDarkMode, toggleTheme }) => {
    const {
        notes,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        sortOrder,
        setSortOrder,
        fetchNotes,
        handleImport,
        handleExport
    } = useNotes();

    const colors = isDarkMode ? theme.dark : theme.light;

    useFocusEffect(
        useCallback(() => {
            fetchNotes();
        }, [fetchNotes]),
    );

    const filteredNotes = notes
        .filter((note) => {
            const matchesSearch =
                note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                note.content.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory =
                selectedCategory === 'Todas' || note.category === selectedCategory;
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            if (sortOrder === 'desc') {
                return b.createdAt - a.createdAt;
            } else {
                return a.createdAt - b.createdAt;
            }
        });

    return (
        <GrassBackground colors={colors.background}>
            <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

            <View style={{ flex: 1 }}>
                <SearchBar
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    isDarkMode={isDarkMode}
                />

                <ToolBar
                    isDarkMode={isDarkMode}
                    onImport={handleImport}
                    onExport={handleExport}
                    sortOrder={sortOrder}
                    toggleSortOrder={() =>
                        setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))
                    }
                />

                <CategoryFilter
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    isDarkMode={isDarkMode}
                />

                {filteredNotes.length > 0 ? (
                    <FlatList
                        data={filteredNotes}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <NoteCard
                                note={item}
                                onPress={() => navigation.navigate('Editor', { note: item })}
                                isDarkMode={isDarkMode}
                            />
                        )}
                        contentContainerStyle={styles.list}
                        showsVerticalScrollIndicator={false}
                        
                        // 🔥 Optimizaciones extremas de escalabilidad (Fase 12)
                        initialNumToRender={10}       // Solo pinta los 10 primeros
                        maxToRenderPerBatch={10}      // Renderiza de a 10 mientras scrollea
                        windowSize={5}                // Mantiene poca memoria por fuera de pantalla
                        removeClippedSubviews={true}  // Descarga las tarjetas que ya no se ven
                    />
                ) : (
                    <EmptyState isDarkMode={isDarkMode} />
                )}
            </View>

            <FAB onPress={() => navigation.navigate('Editor')} isDarkMode={isDarkMode} />
        </GrassBackground>
    );
};

const styles = StyleSheet.create({
    list: {
        paddingBottom: 100,
    },
});
