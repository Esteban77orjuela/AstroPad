import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { initializeAuth, getAuth, signInAnonymously, Auth } from 'firebase/auth';

// @ts-expect-error — getReactNativePersistence existe en el bundle pero a veces TS no lo ve
import { getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// En builds de producción (EAS sin secrets) las credenciales no existen.
// Arrancamos en modo local (sin nube) para evitar crashes al inicializar.
const hasConfig = Boolean(
    firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId,
);

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

if (hasConfig) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);

    try {
        auth = initializeAuth(app, {
            persistence: getReactNativePersistence(ReactNativeAsyncStorage),
        });
    } catch {
        // Si ya fue inicializado (hot reload), usar la instancia existente
        auth = getAuth(app);
    }
}

export { db, auth };

export const isFirebaseConfigured = (): boolean => hasConfig;

export const getDb = (): Firestore => {
    if (!db) {
        throw new Error('Firebase no configurado.');
    }
    return db;
};

export const getOrCreateUserId = async (): Promise<string> => {
    if (!auth) {
        throw new Error('Firebase no configurado.');
    }
    if (auth.currentUser) return auth.currentUser.uid;
    const credential = await signInAnonymously(auth);
    return credential.user.uid;
};

export default app;