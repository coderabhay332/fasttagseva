import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import * as applicationController from '../controllers/application';
import { authMiddleware, roleAuth } from '../middleware/auth';
import { handleFileUpload } from '../middleware/upload';
import type { Env } from '../types/env';

const applicationRoutes = new Hono<{ Bindings: Env }>();

// Validation schemas
const createApplicationSchema = z.object({
  vehicle: z.string(),
  chasisNumber: z.string()
});

const updateStatusSchema = z.object({
  id: z.string(),
  status: z.enum(['NOT SUBMITTED', 'PENDING', 'AGENT ASSIGNED', 'REJECTED', 'DONE'])
});

const updateApplicationSchema = z.object({
  vehicle: z.string().optional(),
  chasisNumber: z.string().optional()
});

// All application routes require authentication
applicationRoutes.use('*', authMiddleware);

// User routes
applicationRoutes.post('/create', zValidator('json', createApplicationSchema), applicationController.create);
applicationRoutes.get('/my-application', applicationController.getAllForUser);
applicationRoutes.get('/list', applicationController.getAllForUser); // Keep both for compatibility
applicationRoutes.get('/:id', applicationController.getById);
applicationRoutes.put('/update/:id', zValidator('json', updateApplicationSchema), applicationController.update);
applicationRoutes.put('/:id', zValidator('json', updateApplicationSchema), applicationController.update); // Keep both
applicationRoutes.delete('/:id', applicationController.deleteOne);

// Admin only routes
applicationRoutes.get('/admin/all', roleAuth(['ADMIN']), applicationController.getAll);
applicationRoutes.delete('/admin/:id', roleAuth(['ADMIN']), applicationController.deleteByAdmin);
applicationRoutes.put('/update-status', roleAuth(['ADMIN']), zValidator('json', updateStatusSchema), applicationController.updateStatus);
applicationRoutes.post('/admin/status', roleAuth(['ADMIN']), zValidator('json', updateStatusSchema), applicationController.updateStatus); // Keep both

// Image uploads
applicationRoutes.post('/upload-pan/:id', handleFileUpload, applicationController.uploadPanImage);
applicationRoutes.post('/upload-rc/:id', handleFileUpload, applicationController.uploadRc);
applicationRoutes.post('/upload-vehicle-front/:id', handleFileUpload, applicationController.uploadVehicleFront);
applicationRoutes.post('/upload-vehicle-side/:id', handleFileUpload, applicationController.uploadVehicleSideImage);
// Keep new format too
applicationRoutes.post('/:id/pan-image', handleFileUpload, applicationController.uploadPanImage);
applicationRoutes.post('/:id/rc-image', handleFileUpload, applicationController.uploadRc);
applicationRoutes.post('/:id/vehicle-front', handleFileUpload, applicationController.uploadVehicleFront);
applicationRoutes.post('/:id/vehicle-side', handleFileUpload, applicationController.uploadVehicleSideImage);

export { applicationRoutes };
