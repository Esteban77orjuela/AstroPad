import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Random from 'expo-random';
import CryptoJS from 'crypto-js';

const PIN_HASH_KEY = 'astrapad_pin_hash';
const PIN_SALT_KEY = 'astrapad_pin_salt';
const MASTER_KEY = 'astrapad_master_key';

const MIN_PIN_LENGTH = 4;

const randomHex = async (bytes: number): Promise<string> => {
    const randomBytes = await Random.getRandomBytesAsync(bytes);
    return Array.from(randomBytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
};

const hashPin = (pin: string, salt: string) => {
    return CryptoJS.SHA256(`${pin}:${salt}`).toString();
};

const ensureMasterKey = async (): Promise<string> => {
    const existingKey = await SecureStore.getItemAsync(MASTER_KEY);
    if (existingKey) {
        return existingKey;
    }
    const newKey = await randomHex(32);
    await SecureStore.setItemAsync(MASTER_KEY, newKey, {
        keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY
    });
    return newKey;
};

const getMasterKey = async (): Promise<string> => {
    const key = await SecureStore.getItemAsync(MASTER_KEY);
    if (key) return key;
    return ensureMasterKey();
};

export const securityService = {
    MIN_PIN_LENGTH,

    async hasPin(): Promise<boolean> {
        const pinHash = await SecureStore.getItemAsync(PIN_HASH_KEY);
        await ensureMasterKey();
        return Boolean(pinHash);
    },

    async setPin(pin: string): Promise<void> {
        if (pin.length < MIN_PIN_LENGTH) {
            throw new Error(`El PIN debe tener al menos ${MIN_PIN_LENGTH} dígitos.`);
        }
        const salt = await randomHex(16);
        const hashed = hashPin(pin, salt);
        await SecureStore.setItemAsync(PIN_SALT_KEY, salt, {
            keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY
        });
        await SecureStore.setItemAsync(PIN_HASH_KEY, hashed, {
            keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY
        });
        await ensureMasterKey();
    },

    async verifyPin(pin: string): Promise<{ success: boolean; masterKey?: string }> {
        const salt = await SecureStore.getItemAsync(PIN_SALT_KEY);
        const storedHash = await SecureStore.getItemAsync(PIN_HASH_KEY);
        if (!salt || !storedHash) {
            return { success: false };
        }
        const incomingHash = hashPin(pin, salt);
        if (incomingHash !== storedHash) {
            return { success: false };
        }
        const masterKey = await getMasterKey();
        return {
            success: true,
            masterKey
        };
    },

    async isBiometricAvailable(): Promise<boolean> {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        if (!hasHardware) return false;
        const supported = await LocalAuthentication.supportedAuthenticationTypesAsync();
        return supported.length > 0;
    },

    async unlockWithBiometrics(): Promise<{ success: boolean; masterKey?: string }> {
        const available = await this.isBiometricAvailable();
        if (!available) {
            return { success: false };
        }
        const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Desbloquear AstraPad',
            fallbackLabel: 'Usar PIN'
        });
        if (!result.success) {
            return { success: false };
        }
        const masterKey = await getMasterKey();
        return { success: true, masterKey };
    },

    encryptText(plainText: string, masterKey: string): string {
        return CryptoJS.AES.encrypt(plainText, masterKey).toString();
    },

    decryptText(cipherText: string, masterKey: string): string {
        const bytes = CryptoJS.AES.decrypt(cipherText, masterKey);
        return bytes.toString(CryptoJS.enc.Utf8);
    }
};
