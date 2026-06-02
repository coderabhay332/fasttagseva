import type { Context } from 'hono';
import type { Env } from '../types/env';

// In-memory storage
const deliveries: any[] = [];

export const getMyDeliveries = async (c: Context<{ Bindings: Env }>) => {
  const user = c.get('user');
  
  const userDeliveries = deliveries.filter(d => d.userId === user._id);
  
  return c.json({
    success: true,
    data: userDeliveries,
    message: 'Deliveries fetched'
  });
};

export const trackDelivery = async (c: Context<{ Bindings: Env }>) => {
  const deliveryId = c.req.param('deliveryId');
  
  const delivery = deliveries.find(d => d._id === deliveryId);
  
  if (!delivery) {
    return c.json({ success: false, message: 'Delivery not found' }, 404);
  }
  
  return c.json({
    success: true,
    data: delivery,
    message: 'Delivery tracked'
  });
};

export const updateStatus = async (c: Context<{ Bindings: Env }>) => {
  const body = await c.req.json();
  const { deliveryId, status } = body;
  
  const index = deliveries.findIndex(d => d._id === deliveryId);
  
  if (index === -1) {
    return c.json({ success: false, message: 'Delivery not found' }, 404);
  }
  
  deliveries[index].status = status;
  deliveries[index].updatedAt = new Date().toISOString();
  
  return c.json({
    success: true,
    data: deliveries[index],
    message: 'Delivery status updated'
  });
};

export const getAllDeliveries = async (c: Context<{ Bindings: Env }>) => {
  return c.json({
    success: true,
    data: deliveries,
    message: 'All deliveries fetched'
  });
};
