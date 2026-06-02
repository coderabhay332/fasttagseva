// Turso (SQLite) Database Client for Cloudflare Workers
import { createClient } from '@libsql/client/web';
import type { Env } from '../types/env';

export function createTursoClient(env: Env) {
  return createClient({
    url: env.TURSO_URL,
    authToken: env.TURSO_TOKEN,
  });
}

// Initialize database tables
export async function initDatabase(env: Env) {
  const db = createTursoClient(env);
  
  // Users table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT,
      phone TEXT,
      role TEXT DEFAULT 'USER',
      profile_image TEXT,
      refresh_token TEXT,
      reset_password_token TEXT,
      reset_password_expires TEXT,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Applications table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      vehicle TEXT,
      chasis_number TEXT,
      status TEXT DEFAULT 'NOT SUBMITTED',
      pan_image TEXT,
      rc_image TEXT,
      vehicle_front_image TEXT,
      vehicle_side_image TEXT,
      payment_status TEXT,
      amount REAL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
  
  // Profiles table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      phone TEXT,
      pancard_number TEXT,
      date_of_birth TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      pincode TEXT,
      profile_image TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
  
  // Payments table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      application_id TEXT,
      order_id TEXT UNIQUE,
      payment_id TEXT,
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'INR',
      status TEXT DEFAULT 'pending',
      razorpay_response TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (application_id) REFERENCES applications(id)
    )
  `);
  
  // Delivery table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS deliveries (
      id TEXT PRIMARY KEY,
      application_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      status TEXT DEFAULT 'PENDING',
      tracking_number TEXT,
      courier_service TEXT,
      estimated_delivery TEXT,
      actual_delivery TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (application_id) REFERENCES applications(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
  
  return db;
}
