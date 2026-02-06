import { ScrollView, Text, TouchableOpacity, StyleSheet, View, Image } from 'react-native';
import { theme } from '../theme/colors';
import { Category } from '../types/note';

interface CategoryFilterProps {
    selectedCategory: Category;
    setSelectedCategory: (category: Category) => void;
    isDarkMode: boolean;
}

const CATEGORIES: { label: Category; iconUrl: string }[] = [
    {
        label: 'Todas',
        iconUrl: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Atom%20symbol/3D/atom_symbol_3d.png'
    },
    {
        label: 'Teología',
        iconUrl: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Church/3D/church_3d.png'
    },
    {
        label: 'Filosofía',
        iconUrl: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Moai/3D/moai_3d.png'
    },
];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
    selectedCategory,
    setSelectedCategory,
    isDarkMode
}) => {
    const colors = isDarkMode ? theme.dark : theme.light;

    return (
        <View style={styles.container}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                {CATEGORIES.map(({ label, iconUrl }) => {
                    const isSelected = selectedCategory === label;
                    return (
                        <TouchableOpacity
                            key={label}
                            onPress={() => setSelectedCategory(label)}
                            style={[
                                styles.chip,
                                {
                                    backgroundColor: isSelected ? colors.chipSelected : colors.chipUnselected,
                                    borderColor: isSelected ? 'transparent' : 'rgba(0,0,0,0.05)',
                                    borderWidth: isDarkMode ? 0 : 1,
                                }
                            ]}
                            activeOpacity={0.7}
                        >
                            <Image
                                source={{ uri: iconUrl }}
                                style={styles.icon3d}
                                resizeMode="contain"
                            />
                            <Text
                                style={[
                                    styles.chipText,
                                    { color: isSelected ? colors.chipTextSelected : colors.chipTextUnselected }
                                ]}
                            >
                                {label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 12,
    },
    scroll: {
        paddingHorizontal: 24,
        gap: 12,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 22,
        paddingVertical: 14,
        borderRadius: 100,
    },
    icon3d: {
        width: 22,
        height: 22,
        marginRight: 10,
    },
    chipText: {
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: -0.2,
    },
});
