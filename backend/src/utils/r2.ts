// Cloudflare R2 File Storage Utilities
import type { Env } from '../types/env';

export interface UploadResult {
  url: string;
  key: string;
  size: number;
  contentType: string;
}

/**
 * Upload file buffer to R2
 */
export async function uploadToR2(
  env: Env,
  key: string,
  data: ArrayBuffer | Uint8Array,
  contentType: string,
  metadata?: Record<string, string>
): Promise<UploadResult> {
  if (!env.STORAGE) {
    throw new Error('R2 storage not configured. Please enable R2 in Cloudflare Dashboard.');
  }
  
  await env.STORAGE.put(key, data, {
    httpMetadata: { contentType },
    customMetadata: metadata
  });

  // Construct public URL (you'll need to enable public access or use signed URLs)
  const publicUrl = `https://pub-${env.STORAGE.bucket}.r2.dev/${key}`;
  
  return {
    url: publicUrl,
    key,
    size: data.byteLength,
    contentType
  };
}

/**
 * Generate pre-signed URL for direct upload
 * This allows frontend to upload directly to R2, bypassing Worker
 */
export async function getPresignedUploadUrl(
  env: Env,
  key: string,
  contentType: string,
  expiresInSeconds: number = 300
): Promise<{ uploadUrl: string; publicUrl: string }> {
  // Note: R2 supports S3-compatible presigned URLs
  // For now, we'll use a simple approach with Worker-mediated upload
  // Full presigned URL implementation requires AWS SDK or crypto signing
  
  const publicUrl = `https://pub-${env.STORAGE.bucket}.r2.dev/${key}`;
  
  // In a full implementation, you'd generate a presigned URL here
  // For now, return a placeholder that tells frontend to use Worker endpoint
  return {
    uploadUrl: `/api/upload-direct`,
    publicUrl
  };
}

/**
 * Delete file from R2
 */
export async function deleteFromR2(env: Env, key: string): Promise<boolean> {
  try {
    await env.STORAGE.delete(key);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get file from R2
 */
export async function getFromR2(env: Env, key: string): Promise<ReadableStream | null> {
  const object = await env.STORAGE.get(key);
  if (!object) return null;
  return object.body;
}

/**
 * Generate unique file key
 */
export function generateFileKey(userId: string, filename: string, type: 'profile' | 'pan' | 'rc' | 'vehicle-front' | 'vehicle-side'): string {
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `users/${userId}/${type}/${timestamp}-${sanitizedFilename}`;
}
