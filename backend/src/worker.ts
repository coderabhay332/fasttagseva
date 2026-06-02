import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { HTTPException } from 'hono/http-exception';
import { userRoutes } from './routes/user';
import { paymentRoutes } from './routes/payment';
import { profileRoutes } from './routes/profile';
import { applicationRoutes } from './routes/application';
import { deliveryRoutes } from './routes/delivery';
import { errorHandler } from './middleware/error';
import { initDatabase } from './utils/turso';
import type { Env } from './types/env';

const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use('*', logger());
app.use('*', cors({
  origin: [
    'https://fastagseva-frontend.vercel.app',
    'https://fasttagseva-c8zo.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176'
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

// Health check
app.get('/', (c) => c.json({ status: 'ok', service: 'fasttag-api' }));

// Database initialization (run once to create tables)
app.get('/init-db', async (c) => {
  try {
    await initDatabase(c.env);
    return c.json({ success: true, message: 'Database initialized successfully' });
  } catch (error) {
    console.error('DB Init error:', error);
    return c.json({ success: false, message: 'Database initialization failed', error: String(error) }, 500);
  }
});

// API Routes
app.route('/api/users', userRoutes);
app.route('/api/payments', paymentRoutes);
app.route('/api/profiles', profileRoutes);
app.route('/api/applications', applicationRoutes);
app.route('/api/delivery', deliveryRoutes);

// Error handling
app.onError(errorHandler);

// 404 handler
app.notFound((c) => c.json({ success: false, message: 'Not Found' }, 404));

export default app;
