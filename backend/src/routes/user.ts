import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import * as userController from '../controllers/user';
import { authMiddleware } from '../middleware/auth';
import { handleFileUpload } from '../middleware/upload';
import type { Env } from '../types/env';

const userRoutes = new Hono<{ Bindings: Env }>();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  phone: z.string().min(10),
  role: z.enum(['USER', 'ADMIN']).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const refreshSchema = z.object({
  refreshToken: z.string()
});

const forgotPasswordSchema = z.object({
  email: z.string().email()
});

const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(6)
});

// Public routes
userRoutes.post('/create', zValidator('json', registerSchema), userController.register);
userRoutes.post('/login', zValidator('json', loginSchema), userController.login);
userRoutes.post('/refresh-token', zValidator('json', refreshSchema), userController.refreshToken);
userRoutes.post('/forgot-password', zValidator('json', forgotPasswordSchema), userController.forgotPassword);
userRoutes.post('/reset-password', zValidator('json', resetPasswordSchema), userController.resetPassword);

// Protected routes
userRoutes.use('/me', authMiddleware);
userRoutes.get('/me', userController.me);

userRoutes.use('/upload-image', authMiddleware);
userRoutes.post('/upload-image', handleFileUpload, userController.uploadImage);

export { userRoutes };
