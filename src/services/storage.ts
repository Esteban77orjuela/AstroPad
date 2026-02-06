import AsyncStorage from '@react-native-async-storage/async-storage';
import { Note } from '../types/note';
import { securityService } from './security';

const STORAGE_KEY = '@astrapad_notes';

const sanitizeNoteForStorage = (note: Note, masterKey?: string): Note => {
    const sanitized: Note = { ...note };

    if (sanitized.isPrivate) {
        if (masterKey) {
            const plainText = sanitized.content || '';
            sanitized.encryptedContent = securityService.encryptText(plainText, masterKey);
        }

        if (!sanitized.encryptedContent) {
            throw new Error('No se puede guardar una nota privada sin desbloquear la app.');
        }

        sanitized.content = '';
    } else {
        sanitized.encryptedContent = null;
    }

    return sanitized;
};

const hydrateNoteFromStorage = (note: Note, masterKey?: string): Note => {
    const hydrated: Note = { ...note };

    if (hydrated.isPrivate) {
        if (hydrated.encryptedContent && masterKey) {
            try {
                hydrated.content = securityService.decryptText(hydrated.encryptedContent, masterKey);
            } catch (error) {
                console.warn('No se pudo descifrar una nota privada', error);
                hydrated.content = '';
            }
        } else {
            hydrated.content = '';
        }
    }

    return hydrated;
};

export const storageService = {
    async getNotes(masterKey?: string): Promise<Note[]> {
        try {
            const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
            const parsed: Note[] = jsonValue != null ? JSON.parse(jsonValue) : [];
            return parsed.map(note => hydrateNoteFromStorage(note, masterKey));
        } catch (e) {
            console.error('Error fetching notes', e);
            return [];
        }
    },

    async saveNotes(notes: Note[], masterKey?: string): Promise<void> {
        try {
            const sanitized = notes.map(note => sanitizeNoteForStorage(note, masterKey));
            const jsonValue = JSON.stringify(sanitized);
            await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
        } catch (e) {
            console.error('Error saving notes', e);
        }
    },

    async addNote(note: Note, masterKey?: string): Promise<void> {
        const notes = await this.getNotes(masterKey);
        notes.unshift(note);
        await this.saveNotes(notes, masterKey);
    },

    async updateNote(updatedNote: Note, masterKey?: string): Promise<void> {
        const notes = await this.getNotes(masterKey);
        const index = notes.findIndex(n => n.id === updatedNote.id);
        if (index !== -1) {
            notes[index] = updatedNote;
            await this.saveNotes(notes, masterKey);
        }
    },

    async deleteNote(id: string, masterKey?: string): Promise<void> {
        const notes = await this.getNotes(masterKey);
        const filteredNotes = notes.filter(n => n.id !== id);
        await this.saveNotes(filteredNotes, masterKey);
    }
};
