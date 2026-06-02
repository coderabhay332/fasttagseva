import { createMiddleware } from 'hono/factory';
import { verifyToken } from '../utils/jwt';
import type { Env, JWTPayload } from '../types/env';

export const authMiddleware = createMiddleware<{ Bindings: Env }>(async (c, next) => {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, message: 'Unauthorized - No token provided' }, 401);
  }
  
  const token = authHeader.substring(7);
  
  try {
    const payload = await verifyToken(token, c.env.JWT_ACCESS_SECRET);
    c.set('user', payload as JWTPayload);
    await next();
  } catch (error) {
    return c.json({ success: false, message: 'Unauthorized - Invalid token' }, 401);
  }
});

// Role-based auth middleware
export const roleAuth = (roles: string[]) => {
  return createMiddleware<{ Bindings: Env }>(async (c, next) => {
    const user = c.get('user') as JWTPayload;
    
    if (!user) {
      return c.json({ success: false, message: 'Unauthorized' }, 401);
    }
    
    if (!roles.includes(user.role)) {
      return c.json({ success: false, message: 'Forbidden - Insufficient permissions' }, 403);
    }
    
    await next();
  });
};
