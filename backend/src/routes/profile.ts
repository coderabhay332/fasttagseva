import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import * as profileController from '../controllers/profile';
import { authMiddleware } from '../middleware/auth';
import { handleFileUpload } from '../middleware/upload';
import type { Env } from '../types/env';

const profileRoutes = new Hono<{ Bindings: Env }>();

// Validation schemas
const updateProfileSchema = z.object({
  pancardNumber: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional()
});

// All profile routes require authentication
profileRoutes.use('*', authMiddleware);

profileRoutes.get('/me', profileController.getProfile);
profileRoutes.post('/update', zValidator('json', updateProfileSchema), profileController.updateProfile);
profileRoutes.post('/upload-image', handleFileUpload, profileController.uploadImage);
profileRoutes.put('/update-image', handleFileUpload, profileController.uploadImage);

export { profileRoutes };
