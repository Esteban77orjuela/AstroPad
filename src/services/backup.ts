import AsyncStorage from '@react-native-async-storage/async-storage';
import { Note } from '../types/note';

const NOTES_KEY = '@astrapad_notes';
const BACKUP_KEY = '@astrapad_backup_v1';
const BACKUP_META_KEY = '@astrapad_backup_meta';

export interface BackupMeta {
    timestamp: number;
    noteCount: number;
    status: 'success' | 'failed';
}

export const backupService = {
    /**
     * Crea un backup completo e inmutable de las notas actuales en AsyncStorage.
     * Guarda el JSON crudo para no perder integridad independientemente de la masterKey actual.
     */
    async createSafeBackup(): Promise<BackupMeta | null> {
        try {
            // 1. Obtener los datos crudos del almacenamiento principal
            const rawData = await AsyncStorage.getItem(NOTES_KEY);
            if (!rawData) return null;

            const notes: Note[] = JSON.parse(rawData);
            const count = notes.length;

            // 2. Guardar en una llave de almacenamiento SEPARADA
            await AsyncStorage.setItem(BACKUP_KEY, rawData);

            // 3. Registrar metadata
            const meta: BackupMeta = {
                timestamp: Date.now(),
                noteCount: count,
                status: 'success'
            };
            await AsyncStorage.setItem(BACKUP_META_KEY, JSON.stringify(meta));

            console.log(`[Backup] Creado exitosamente: ${count} notas respaldadas.`);
            return meta;
        } catch (error) {
            console.error('[Backup] Error al crear respaldo automático:', error);
            return null;
        }
    },

    async getBackupInfo(): Promise<BackupMeta | null> {
        try {
            const meta = await AsyncStorage.getItem(BACKUP_META_KEY);
            return meta ? JSON.parse(meta) : null;
        } catch { return null; }
    },

    async hasBackup(): Promise<boolean> {
        const meta = await this.getBackupInfo();
        return meta !== null && meta.status === 'success';
    },

    /**
     * SOLO USAR EN EMERGENCIAS: Restaura los datos del backup a la base principal.
     */
    async emergencyRestore(): Promise<boolean> {
        try {
            const backupData = await AsyncStorage.getItem(BACKUP_KEY);
            if (!backupData) return false;
            await AsyncStorage.setItem(NOTES_KEY, backupData);
            return true;
        } catch { return false; }
    }
};
