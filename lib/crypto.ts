export async function generateKeyPair() {
    const keyPair = await window.crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 4096,
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

export async function encryptWithAES(
    fileBuffer: ArrayBuffer,
    aesKey: CryptoKey
) {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encryptedBuffer = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        aesKey,
        fileBuffer
    );
    return { encryptedBuffer, iv };
}

export async function encryptWithRSA(aesKey: CryptoKey, publicKey: CryptoKey) {
    const exportedAESKey = await window.crypto.subtle.exportKey("raw", aesKey);
    const encryptedAESKey = await window.crypto.subtle.encrypt(
        { name: "RSA-OAEP" },
        publicKey,
        exportedAESKey
    );
    return encryptedAESKey;
}
