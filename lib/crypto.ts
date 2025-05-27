import { fromByteArray, toByteArray } from "base64-js";

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

export async function decryptWithAes(
    encryptedFileBase64: string,
    ivBase64: string,
    aesKey: CryptoKey
): Promise<ArrayBuffer> {
    const encryptedFileBuffer = toByteArray(encryptedFileBase64);
    const iv = toByteArray(ivBase64);

    const decryptedBuffer = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        aesKey,
        encryptedFileBuffer
    );
    return decryptedBuffer;
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

export async function decryptWithRSA(
    aesKeyBase64: string,
    privateKey: CryptoKey
): Promise<CryptoKey> {
    const encryptedAESKey = toByteArray(aesKeyBase64);
    const rawAesKey = await crypto.subtle.decrypt(
        { name: "RSA-OAEP" },
        privateKey,
        encryptedAESKey
    );
    const aesKey = await crypto.subtle.importKey(
        "raw",
        rawAesKey,
        { name: "AES-GCM" },
        true,
        ["encrypt", "decrypt"]
    );
    return aesKey;
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

export async function decryptPrivateKeyWithPassphrase(
    privateKey: string,
    salt: string,
    iv: string,
    decryptionPassphrase: string
): Promise<CryptoKey> {
    const pk = toByteArray(privateKey);
    const pkBuffer = pk.buffer.slice(
        pk.byteOffset,
        pk.byteOffset + pk.byteLength
    ) as ArrayBuffer;
    const aesKey = await getAesFromPassphrase(
        decryptionPassphrase,
        toByteArray(salt)
    );
    const decryptedPrivateKeyBuffer = await crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: toByteArray(iv),
        },
        aesKey,
        pkBuffer
    );

    const decryptedPrivateKey = await crypto.subtle.importKey(
        "pkcs8",
        decryptedPrivateKeyBuffer,
        { name: "RSA-OAEP", hash: "SHA-256" },
        true,
        ["decrypt"]
    );

    return decryptedPrivateKey;
}
