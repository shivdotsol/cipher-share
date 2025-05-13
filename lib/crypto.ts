import { fromByteArray } from "base64-js";

export async function generateKeyPair() {
    const keyPair = await window.crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
    );

    return keyPair;
}

export async function generateAesKey() {
    const aesKey = await window.crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );
    return aesKey;
}

export async function encryptWithAES(file: File, aesKey: CryptoKey) {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const fileBuffer = await file.arrayBuffer();
    const encryptedBuffer = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        aesKey,
        fileBuffer
    );
    return {
        file: fromByteArray(new Uint8Array(encryptedBuffer)),
        iv: fromByteArray(new Uint8Array(iv)),
    };
}

export async function encryptWithRSA(aesKey: CryptoKey, publicKey: CryptoKey) {
    const exportedAESKey = await window.crypto.subtle.exportKey("raw", aesKey);
    const encryptedAESKey = await window.crypto.subtle.encrypt(
        { name: "RSA-OAEP" },
        publicKey,
        exportedAESKey
    );
    return fromByteArray(new Uint8Array(encryptedAESKey));
}

export async function encryptPrivateKeyWithPassphrase(
    privateKey: CryptoKey,
    passphrase: string
) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const exportedPrivateKey = await crypto.subtle.exportKey(
        "pkcs8",
        privateKey
    );
    const aesKey = await getAesFromPassphrase(passphrase, salt);

    const encryptedPrivateKey = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        aesKey,
        exportedPrivateKey
    );

    return {
        privateKey: fromByteArray(new Uint8Array(encryptedPrivateKey)),
        iv: fromByteArray(new Uint8Array(iv)),
        salt: fromByteArray(new Uint8Array(salt)),
    };
}

async function getAesFromPassphrase(
    passphrase: string,
    salt: Uint8Array
): Promise<CryptoKey> {
    const enc = new TextEncoder();

    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        enc.encode(passphrase),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );

    const aesKey = await crypto.subtle.deriveKey(
        { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
    );

    return aesKey;
}
