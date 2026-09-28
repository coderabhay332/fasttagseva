import type { Context } from 'hono';
import type { Env } from '../types/env';
import { hashPassword, verifyPassword } from '../utils/crypto';
import { createUserTokens, verifyToken } from '../utils/jwt';
import { sendEmail } from '../utils/email';
import { uploadToCloudinary, generateCloudinaryFolder } from '../utils/cloudinary';
import { createTursoClient, initDatabase } from '../utils/turso';
import type { UploadedFile } from '../middleware/upload';

export const register = async (c: Context<{ Bindings: Env }>) => {
  try {
    const body = await c.req.json();
    const { email, password, name, phone, role = 'USER' } = body;
    
    const db = createTursoClient(c.env);
    
    // Check if user exists
    const existingUser = await db.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [email]
    });
    if (existingUser.rows.length > 0) {
      return c.json({ success: false, message: 'User already exists' }, 400);
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create user
    const userId = crypto.randomUUID();
    
    await db.execute({
      sql: `INSERT INTO users (id, email, password, name, phone, role, refresh_token, active) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [userId, email, hashedPassword, name, phone, role, null, 1]
    });
    
    // Create tokens
    const tokens = await createUserTokens(
      { _id: userId, email, role },
      { access: c.env.JWT_ACCESS_SECRET, refresh: c.env.JWT_REFRESH_SECRET }
    );
    
    // Store refresh token
    await db.execute({
      sql: 'UPDATE users SET refresh_token = ? WHERE id = ?',
      args: [tokens.refreshToken, userId]
    });
    
    return c.json({
      success: true,
      data: {
        user: { _id: userId, email, name, role },
        tokens
      },
      message: 'User registered successfully'
    }, 201);
    
  } catch (error) {
    console.error('Register error:', error);
    return c.json({ success: false, message: 'Registration failed' }, 500);
  }
};

export const login = async (c: Context<{ Bindings: Env }>) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;
    
    const db = createTursoClient(c.env);
    
    // Find user with password
    const result = await db.execute({
      sql: 'SELECT id, email, password, name, role FROM users WHERE email = ? AND active = 1',
      args: [email]
    });
    
    if (result.rows.length === 0) {
      return c.json({ success: false, message: 'Invalid credentials' }, 401);
    }
    
    const user = result.rows[0];
    
    // Verify password
    const isValid = await verifyPassword(password, user.password as string);
    if (!isValid) {
      return c.json({ success: false, message: 'Invalid credentials' }, 401);
    }
    
    // Create tokens
    const tokens = await createUserTokens(
      { _id: user.id as string, email: user.email as string, role: user.role as string },
      { access: c.env.JWT_ACCESS_SECRET, refresh: c.env.JWT_REFRESH_SECRET }
    );
    
    // Store refresh token
    await db.execute({
      sql: 'UPDATE users SET refresh_token = ? WHERE id = ?',
      args: [tokens.refreshToken, user.id]
    });
    
    return c.json({
      success: true,
      data: {
        user: { _id: user.id, email: user.email, name: user.name, role: user.role },
        tokens
      },
      message: 'Login successful'
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ success: false, message: 'Login failed' }, 500);
  }
};

export const refreshToken = async (c: Context<{ Bindings: Env }>) => {
  try {
    const body = await c.req.json();
    const { refreshToken: token } = body;
    
    if (!token) {
      return c.json({ success: false, message: 'No refresh token provided' }, 400);
    }
    
    const db = createTursoClient(c.env);
    
    // Verify refresh token
    const payload = await verifyToken(token, c.env.JWT_REFRESH_SECRET);
    
    // Find user with matching refresh token
    const result = await db.execute({
      sql: 'SELECT id, email, role FROM users WHERE id = ? AND refresh_token = ?',
      args: [payload._id, token]
    });
    
    if (result.rows.length === 0) {
      return c.json({ success: false, message: 'Invalid refresh token' }, 401);
    }
    
    const user = result.rows[0];
    
    // Create new tokens
    const tokens = await createUserTokens(
      { _id: user.id as string, email: user.email as string, role: user.role as string },
      { access: c.env.JWT_ACCESS_SECRET, refresh: c.env.JWT_REFRESH_SECRET }
    );
    
    // Update refresh token in DB
    await db.execute({
      sql: 'UPDATE users SET refresh_token = ? WHERE id = ?',
      args: [tokens.refreshToken, user.id]
    });
    
    return c.json({
      success: true,
      data: { tokens },
      message: 'Token refreshed'
    });
    
  } catch (error) {
    console.error('Refresh error:', error);
    return c.json({ success: false, message: 'Invalid refresh token' }, 401);
  }
};

export const me = async (c: Context<{ Bindings: Env }>) => {
  const user = c.get('user');
  
  if (!user || !user._id) {
    return c.json({ success: false, message: 'Not authenticated' }, 401);
  }
  
  const db = createTursoClient(c.env);
  const result = await db.execute({
    sql: 'SELECT id, email, name, phone, role, profile_image, created_at FROM users WHERE id = ?',
    args: [user._id]
  });
  
  if (result.rows.length === 0) {
    return c.json({ success: false, message: 'User not found' }, 404);
  }
  
  const foundUser = result.rows[0];
  
  if (!foundUser) {
    return c.json({ success: false, message: 'User not found' }, 404);
  }
  
  return c.json({
    success: true,
    data: {
      _id: foundUser._id,
      email: foundUser.email,
      name: foundUser.name,
      phone: foundUser.phone,
      role: foundUser.role
    }
  });
};

export const forgotPassword = async (c: Context<{ Bindings: Env }>) => {
  try {
    const body = await c.req.json();
    const { email } = body;
    
    const db = createTursoClient(c.env);
    const result = await db.execute({
      sql: 'SELECT id, email, role FROM users WHERE email = ?',
      args: [email]
    });
    
    if (result.rows.length === 0) {
      return c.json({ success: false, message: 'User not found' }, 404);
    }
    
    const user = result.rows[0];
    
    // Create reset token (1 hour expiry)
    const resetToken = await createUserTokens(
      { _id: user.id as string, email: user.email as string, role: user.role as string },
      { access: c.env.JWT_RESET_PASSWORD_SECRET, refresh: c.env.JWT_REFRESH_SECRET }
    );
    
    const resetLink = `${c.env.FRONTEND_BASE_URL}/reset-password?token=${resetToken.accessToken}`;
    
    // Send email
    await sendEmail(
      c.env,
      user.email as string,
      'Password Reset',
      `<p>Click <a href="${resetLink}">here</a> to reset your password. Link expires in 1 hour.</p>`
    );
    
    return c.json({
      success: true,
      message: 'Password reset email sent'
    });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    return c.json({ success: false, message: 'Failed to send reset email' }, 500);
  }
};

export const resetPassword = async (c: Context<{ Bindings: Env }>) => {
  try {
    const body = await c.req.json();
    const { token, newPassword } = body;
    
    const db = createTursoClient(c.env);
    
    // Verify token
    const payload = await verifyToken(token, c.env.JWT_RESET_PASSWORD_SECRET);
    
    // Find user
    const result = await db.execute({
      sql: 'SELECT id FROM users WHERE id = ?',
      args: [payload._id]
    });
    
    if (result.rows.length === 0) {
      return c.json({ success: false, message: 'Invalid or expired token' }, 400);
    }
    
    // Hash new password
    const hashedPassword = await hashPassword(newPassword);
    
    // Update password and invalidate refresh token
    await db.execute({
      sql: 'UPDATE users SET password = ?, refresh_token = NULL WHERE id = ?',
      args: [hashedPassword, payload._id]
    });
    
    return c.json({
      success: true,
      message: 'Password reset successful'
    });
    
  } catch (error) {
    console.error('Reset password error:', error);
    return c.json({ success: false, message: 'Invalid or expired token' }, 400);
  }
};

export const uploadImage = async (c: Context<{ Bindings: Env }>) => {
  try {
    const user = c.get('user') as { _id: string };
    const file = c.get('uploadedFile') as UploadedFile | undefined;
    
    if (!file) {
      return c.json({ success: false, message: 'No file uploaded' }, 400);
    }
    
    const db = createTursoClient(c.env);
    
    // Generate folder path
    const folder = generateCloudinaryFolder(user._id, 'profile');
    
    // Upload to Cloudinary
    const result = await uploadToCloudinary(
      c.env,
      file,
      folder,
      user._id
    );
    
    // Update user in database with image URL
    await db.execute({
      sql: 'UPDATE users SET profile_image = ? WHERE id = ?',
      args: [result.url, user._id]
    });
    
    return c.json({
      success: true,
      data: {
        url: result.url,
        publicId: result.publicId,
        size: result.size,
        contentType: result.contentType
      },
      message: 'Image uploaded successfully'
    });
    
  } catch (error: any) {
    console.error('Upload error:', error);
    return c.json({ success: false, message: error?.message || 'Failed to upload image' }, 500);
  }
};
