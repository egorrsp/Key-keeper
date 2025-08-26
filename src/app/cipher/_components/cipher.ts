export async function deriveKeyFromPassword(password: string, salt?: Uint8Array) {
  const actualSalt = salt ?? crypto.getRandomValues(new Uint8Array(16));

  const enc = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey", "deriveBits"]
  );

  const keyMaterial = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: actualSalt,
      iterations: 310000,
      hash: "SHA-256",
    },
    passwordKey,
    256
  );

  return { key: new Uint8Array(keyMaterial), salt: actualSalt };
}

export async function encryptSecret(keyBytes: Uint8Array, secret: string) {
  const key = await crypto.subtle.importKey("raw", keyBytes, "AES-GCM", false, ["encrypt"]);

  const nonce = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = new TextEncoder().encode(secret);

  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, key, plaintext);

  return { ciphertext: new Uint8Array(ciphertext), nonce };
}

export async function decryptSecret(keyBytes: Uint8Array, ciphertext: Uint8Array, nonce: Uint8Array) {
  const key = await crypto.subtle.importKey("raw", keyBytes, "AES-GCM", false, ["decrypt"]);

  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: nonce }, key, ciphertext);

  return new TextDecoder().decode(decrypted);
}