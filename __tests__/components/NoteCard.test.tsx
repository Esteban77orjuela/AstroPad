import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NoteCard } from '../../src/presentation/components/NoteCard';
import { Note } from '../../src/domain/entities/note';

const mockNote: Note = {
  id: 'test-id-123',
  title: 'Mi Primera Nota Test',
  content: 'Contenido de la nota de prueba',
  category: 'Teología',
  createdAt: 1672531200000,
  updatedAt: 1672531200000,
  isPrivate: false,
};

describe('NoteCard Component', () => {
  it('se renderiza correctamente con el título y la categoría', () => {
    const { getByText } = render(
      <NoteCard note={mockNote} onPress={() => {}} isDarkMode={false} />
    );

    // Verificamos que el título esté en pantalla
    expect(getByText('Mi Primera Nota Test')).toBeTruthy();
    
    // Verificamos que el contenido y la categoría también estén
    expect(getByText('Contenido de la nota de prueba')).toBeTruthy();
    expect(getByText('TEOLOGÍA')).toBeTruthy();
  });

  it('llama a la función onPress al ser tocada', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <NoteCard 
        note={mockNote} 
        onPress={mockOnPress} 
        isDarkMode={false} 
      />
    );

    // Simulamos un toque en la tarjeta usando el texto del título
    const card = getByText('Mi Primera Nota Test');
    fireEvent.press(card);

    // Verificamos que la función fue llamada exactamente una vez
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });
});
