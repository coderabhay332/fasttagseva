// Web Crypto API utilities for password hashing
// Replaces bcrypt in Cloudflare Workers

const encoder = new TextEncoder();

export async function hashPassword(password: string): Promise<string> {
  // Generate a random salt
  const salt = crypto.getRandomValues(new Uint8Array(16));
  
  // Derive key using PBKDF2
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  
  const hash = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );
  
  // Combine salt and hash, convert to base64
  const combined = new Uint8Array(salt.length + hash.byteLength);
  combined.set(salt);
  combined.set(new Uint8Array(hash), salt.length);
  
  return btoa(String.fromCharCode(...combined));
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    // Decode base64
    const combined = Uint8Array.from(atob(hashedPassword), c => c.charCodeAt(0));
    
    // Extract salt (first 16 bytes)
    const salt = combined.slice(0, 16);
    const hash = combined.slice(16);
    
    // Re-derive key
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );
    
    const newHash = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      256
    );
    
    // Compare hashes
    const newHashArray = new Uint8Array(newHash);
    if (hash.length !== newHashArray.length) return false;
    
    // Constant-time comparison
    let result = 0;
    for (let i = 0; i < hash.length; i++) {
      result |= hash[i] ^ newHashArray[i];
    }
    return result === 0;
  } catch {
    return false;
  }
}
