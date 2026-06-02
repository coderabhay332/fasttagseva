// Cloudflare Workers types (defined as any for now)
type D1Database = any;
type R2Bucket = any;
type KVNamespace = any;

export interface Env {
  // Turso Database (SQLite)
  TURSO_URL: string;
  TURSO_TOKEN: string;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_RESET_PASSWORD_SECRET: string;
  RAZORPAY_KEY_ID: string;
  RAZORPAY_KEY_SECRET: string;
  RAZORPAY_WEBHOOK_SECRET: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  EMAIL_USER: string;
  EMAIL_PASS: string;
  FRONTEND_BASE_URL: string;
  BASE_URL: string;
  
  // Bindings (optional - enable in wrangler.toml when ready)
  DB?: D1Database;
  STORAGE?: R2Bucket;
  CACHE?: KVNamespace;
}

// Hono Context Variables
declare module 'hono' {
  interface ContextVariableMap {
    user: JWTPayload;
    file: { name: string; type: string; size: number; buffer: ArrayBuffer };
    uploadedFile: { name: string; type: string; size: number; buffer: ArrayBuffer };
    formFields: Record<string, string>;
  }
}

// JWT Payload type
export interface JWTPayload {
  _id: string;
  email: string;
  role: string;
  exp?: number;
}

// User type
export interface User {
  _id: string;
  email: string;
  name?: string;
  phone?: string;
  role: 'USER' | 'ADMIN';
  password?: string;
  refreshToken?: string;
  active?: boolean;
}

// API Response type
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
