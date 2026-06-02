// Cloudinary File Upload for Cloudflare Workers
import type { Env } from '../types/env';

export interface UploadResult {
  url: string;
  publicId: string;
  size: number;
  contentType: string;
}

/**
 * Upload file to Cloudinary using their Upload API
 */
export async function uploadToCloudinary(
  env: Env,
  file: { name: string; type: string; buffer: ArrayBuffer },
  folder: string,
  userId: string
): Promise<UploadResult> {
  const timestamp = Math.round(new Date().getTime() / 1000);
  
  // Generate signature
  const signatureString = `folder=${folder}&timestamp=${timestamp}${env.CLOUDINARY_API_SECRET}`;
  const signature = await generateSHA1Signature(signatureString);
  
  // Convert ArrayBuffer to Base64
  const base64File = arrayBufferToBase64(file.buffer);
  const dataURI = `data:${file.type};base64,${base64File}`;
  
  // Upload to Cloudinary
  const formData = new FormData();
  formData.append('file', dataURI);
  formData.append('api_key', env.CLOUDINARY_API_KEY);
  formData.append('timestamp', timestamp.toString());
  formData.append('signature', signature);
  formData.append('folder', folder);
  
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Cloudinary upload failed: ${error}`);
  }
  
  const result = await response.json();
  
  return {
    url: result.secure_url,
    publicId: result.public_id,
    size: file.buffer.byteLength,
    contentType: file.type,
  };
}

/**
 * Generate SHA1 signature for Cloudinary
 */
async function generateSHA1Signature(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Convert ArrayBuffer to Base64
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Delete file from Cloudinary
 */
export async function deleteFromCloudinary(env: Env, publicId: string): Promise<boolean> {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signatureString = `public_id=${publicId}&timestamp=${timestamp}${env.CLOUDINARY_API_SECRET}`;
    const signature = await generateSHA1Signature(signatureString);
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/destroy`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          public_id: publicId,
          api_key: env.CLOUDINARY_API_KEY,
          timestamp,
          signature,
        }),
      }
    );
    
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Generate unique folder path
 */
export function generateCloudinaryFolder(userId: string, type: 'profile' | 'pan' | 'rc' | 'vehicle-front' | 'vehicle-side'): string {
  return `fasttag/users/${userId}/${type}`;
}
