import { createMiddleware } from 'hono/factory';
import type { Env } from '../types/env';

export interface UploadedFile {
  name: string;
  type: string;
  size: number;
  buffer: ArrayBuffer;
}

/**
 * Parse multipart/form-data in Workers
 * Since multer doesn't work, we use native FormData parsing
 */
export const parseMultipart = createMiddleware<{ Bindings: Env }>(async (c, next) => {
  const contentType = c.req.header('content-type') || '';
  
  if (!contentType.includes('multipart/form-data')) {
    return c.json({ success: false, message: 'Content-Type must be multipart/form-data' }, 400);
  }
  
  try {
    // Parse FormData using native Request.formData()
    const formData = await c.req.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return c.json({ success: false, message: 'No file provided' }, 400);
    }
    
    if (!(file instanceof File)) {
      return c.json({ success: false, message: 'Invalid file upload' }, 400);
    }
    
    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return c.json({ success: false, message: 'File too large (max 10MB)' }, 400);
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return c.json({ success: false, message: 'Invalid file type. Allowed: JPEG, PNG, PDF' }, 400);
    }
    
    // Convert to buffer
    const buffer = await file.arrayBuffer();
    
    // Attach to context
    c.set('file', {
      name: file.name,
      type: file.type,
      size: file.size,
      buffer
    } as UploadedFile);
    
    // Also attach other form fields
    const fields: Record<string, string> = {};
    formData.forEach((value, key) => {
      if (key !== 'file' && typeof value === 'string') {
        fields[key] = value;
      }
    });
    c.set('formFields', fields);
    
    await next();
    
  } catch (error) {
    console.error('Multipart parsing error:', error);
    return c.json({ success: false, message: 'Failed to parse upload' }, 400);
  }
});

/**
 * Middleware to handle direct file upload (backend-mediated to R2)
 */
export const handleFileUpload = createMiddleware<{ Bindings: Env }>(async (c, next) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File | null;
    
    if (!file || !(file instanceof File)) {
      return c.json({ success: false, message: 'No file provided' }, 400);
    }
    
    // Validate
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return c.json({ success: false, message: 'File too large' }, 400);
    }
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return c.json({ success: false, message: 'Invalid file type' }, 400);
    }
    
    // Store in context
    c.set('uploadedFile', {
      name: file.name,
      type: file.type,
      size: file.size,
      buffer: await file.arrayBuffer()
    });
    
    await next();
    
  } catch (error) {
    console.error('Upload error:', error);
    return c.json({ success: false, message: 'Upload failed' }, 500);
  }
});
