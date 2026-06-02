import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import * as deliveryController from '../controllers/delivery';
import { authMiddleware, roleAuth } from '../middleware/auth';
import type { Env } from '../types/env';

const deliveryRoutes = new Hono<{ Bindings: Env }>();

// Validation schemas
const updateStatusSchema = z.object({
  deliveryId: z.string(),
  status: z.enum(['PENDING', 'IN_TRANSIT', 'DELIVERED', 'FAILED'])
});

// All delivery routes require authentication
deliveryRoutes.use('*', authMiddleware);

// User routes
deliveryRoutes.get('/my-deliveries', deliveryController.getMyDeliveries);
deliveryRoutes.get('/track/:deliveryId', deliveryController.trackDelivery);

// Admin routes
deliveryRoutes.post('/admin/status', roleAuth(['ADMIN']), zValidator('json', updateStatusSchema), deliveryController.updateStatus);
deliveryRoutes.get('/admin/all', roleAuth(['ADMIN']), deliveryController.getAllDeliveries);

export { deliveryRoutes };
