import {
    collection,
    doc,
    getDocs,
    addDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    serverTimestamp,
    Timestamp,
} from 'firebase/firestore';
import { db, getOrCreateUserId } from './firebase';
import { Note } from '../types/note';
import { securityService } from './security';

// RUTA DINÁMICA POR USUARIO: users/{userId}/notes
const getNoteCollection = async () => {
    const userId = await getOrCreateUserId();
    return collection(db, 'users', userId, 'notes');
};

const getNoteDoc = async (noteId: string) => {
    const userId = await getOrCreateUserId();
    return doc(db, 'users', userId, 'notes', noteId);
};

// Convierte Firestore doc a Note local
const docToNote = (id: string, data: Record<string, any>): Note => ({
    id,
    title: data.title || '',
    content: data.content || '',
    category: data.category || 'Todas',
    isPrivate: data.isPrivate || false,
    encryptedContent: data.encryptedContent || null,
    createdAt: data.createdAt instanceof Timestamp
        ? data.createdAt.toMillis()
        : data.createdAt || Date.now(),
    updatedAt: data.updatedAt instanceof Timestamp
        ? data.updatedAt.toMillis()
        : data.updatedAt || Date.now(),
});

export const firestoreService = {

    async getNotes(masterKey?: string): Promise<Note[]> {
        try {
            const colRef = await getNoteCollection();
            const q = query(colRef, orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            
            return snapshot.docs.map(d => {
                const note = docToNote(d.id, d.data());
                if (note.isPrivate && note.encryptedContent && masterKey) {
                    try {
                        note.content = securityService.decryptText(note.encryptedContent, masterKey);
                    } catch {
                        note.content = '🔒 Nota cifrada';
                    }
                } else if (note.isPrivate && !masterKey) {
                    note.content = '🔒 Nota cifrada';
                }
                return note;
            });
        } catch (error) {
            console.error('[Firestore] Error al obtener notas:', error);
            throw error; 
        }
    },

    async syncNoteToCloud(note: Note, masterKey?: string): Promise<void> {
        const ref = await getNoteDoc(note.id);
        const data: Record<string, any> = {
            title: note.title,
            category: note.category,
            isPrivate: note.isPrivate || false,
            createdAt: note.createdAt,
            updatedAt: note.updatedAt || Date.now(),
        };

        if (note.isPrivate && masterKey) {
            data.encryptedContent = securityService.encryptText(note.content, masterKey);
            data.content = '';
        } else if (note.isPrivate && !masterKey) {
            return;
        } else {
            data.content = note.content;
            data.encryptedContent = null;
        }

        await setDoc(ref, data);
    },

    async addNote(note: Note, masterKey?: string): Promise<string> {
        const colRef = await getNoteCollection();
        const data: Record<string, any> = {
            title: note.title,
            category: note.category,
            isPrivate: note.isPrivate || false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        if (note.isPrivate && masterKey) {
            data.encryptedContent = securityService.encryptText(note.content, masterKey);
            data.content = '';
        } else if (note.isPrivate && !masterKey) {
            throw new Error('No se puede guardar nota privada sin autenticación.');
        } else {
            data.content = note.content;
            data.encryptedContent = null;
        }

        const ref = await addDoc(colRef, data);
        return ref.id;
    },

    async updateNote(note: Note, masterKey?: string): Promise<void> {
        const ref = await getNoteDoc(note.id);
        const data: Record<string, any> = {
            title: note.title,
            category: note.category,
            isPrivate: note.isPrivate || false,
            updatedAt: serverTimestamp(),
        };

        if (note.isPrivate && masterKey) {
            data.encryptedContent = securityService.encryptText(note.content, masterKey);
            data.content = '';
        } else if (note.isPrivate && !masterKey) {
            throw new Error('No se puede actualizar nota privada sin autenticación.');
        } else {
            data.content = note.content;
            data.encryptedContent = null;
        }

        await updateDoc(ref, data);
    },

    async deleteNote(id: string): Promise<void> {
        const ref = await getNoteDoc(id);
        await deleteDoc(ref);
    },
};
