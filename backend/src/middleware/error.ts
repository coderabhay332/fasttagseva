import type { ErrorHandler } from 'hono';

export const errorHandler: ErrorHandler = (err, c) => {
  console.error('Error:', err);
  
  if (err instanceof Response) {
    return err;
  }
  
  const status = (err as any)?.status || 500;
  const message = (err as any)?.message || 'Something went wrong!';
  
  return c.json({
    success: false,
    error_code: status,
    message: message,
    data: {}
  }, status as any);
};
