import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import * as paymentController from '../controllers/payment';
import { authMiddleware } from '../middleware/auth';
import type { Env } from '../types/env';

const paymentRoutes = new Hono<{ Bindings: Env }>();

// Validation schemas
const createPaymentSchema = z.object({
  amount: z.number().positive(),
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(10),
  applicationId: z.string(),
  bankName: z.string(),
  paymentMethod: z.enum(['CARD', 'UPI', 'NETBANKING']).default('CARD')
});

const checkOrderSchema = z.object({
  orderId: z.string()
});

const listPaymentsSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional()
});

// Webhook route (no auth - called by Razorpay)
paymentRoutes.post('/webhook', paymentController.webhook);

// Protected routes
paymentRoutes.use('*', authMiddleware);

paymentRoutes.post('/create', zValidator('json', createPaymentSchema), paymentController.createPayment);
paymentRoutes.get('/order/:orderId', paymentController.checkOrderStatus);
paymentRoutes.get('/list', zValidator('query', listPaymentsSchema), paymentController.listPayments);
paymentRoutes.get('/application/:applicationId', paymentController.getPaymentsByApplication);

export { paymentRoutes };
