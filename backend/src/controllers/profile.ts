import type { Context } from 'hono';
import type { Env } from '../types/env';
import { uploadToCloudinary, generateCloudinaryFolder } from '../utils/cloudinary';
import { createTursoClient } from '../utils/turso';
import type { UploadedFile } from '../middleware/upload';

export const getProfile = async (c: Context<{ Bindings: Env }>) => {
  try {
    const user = c.get('user') as { _id: string };
    const db = createTursoClient(c.env);
    
    const result = await db.execute({
      sql: 'SELECT * FROM profiles WHERE user_id = ?',
      args: [user._id]
    });
    
    if (result.rows.length === 0) {
      return c.json({ success: false, message: 'Profile not found' }, 404);
    }
    
    const profile = result.rows[0];
    
    return c.json({
      success: true,
      data: {
        id: profile.id,
        userId: profile.user_id,
        phone: profile.phone,
        pancardNumber: profile.pancard_number,
        dateOfBirth: profile.date_of_birth,
        address: profile.address,
        profileImage: profile.profile_image,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at
      },
      message: 'Profile fetched'
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return c.json({ success: false, message: 'Failed to fetch profile' }, 500);
  }
};

export const updateProfile = async (c: Context<{ Bindings: Env }>) => {
  try {
    const user = c.get('user') as { _id: string };
    const body = await c.req.json();
    const db = createTursoClient(c.env);
    
    // Check if profile exists
    const existing = await db.execute({
      sql: 'SELECT id FROM profiles WHERE user_id = ?',
      args: [user._id]
    });
    
    const now = new Date().toISOString();
    
    if (existing.rows.length === 0) {
      // Create new profile
      const id = crypto.randomUUID();
      await db.execute({
        sql: `INSERT INTO profiles (id, user_id, phone, pancard_number, date_of_birth, address, created_at, updated_at) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id, 
          user._id, 
          body.phone || null, 
          body.pancardNumber || null, 
          body.dateOfBirth || null, 
          body.address || null,
          now, 
          now
        ]
      });
      
      return c.json({
        success: true,
        data: { id, userId: user._id, ...body, createdAt: now, updatedAt: now },
        message: 'Profile created'
      });
    }
    
    // Update existing profile
    await db.execute({
      sql: `UPDATE profiles SET 
              phone = COALESCE(?, phone), 
              pancard_number = COALESCE(?, pancard_number), 
              date_of_birth = COALESCE(?, date_of_birth), 
              address = COALESCE(?, address),
              updated_at = ? 
            WHERE user_id = ?`,
      args: [
        body.phone || null, 
        body.pancardNumber || null, 
        body.dateOfBirth || null, 
        body.address || null,
        now, 
        user._id
      ]
    });
    
    return c.json({
      success: true,
      data: { userId: user._id, ...body, updatedAt: now },
      message: 'Profile updated'
    });
    
  } catch (error: any) {
    console.error('Update profile error:', error);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    return c.json({ 
      success: false, 
      message: 'Failed to update profile', 
      error: error?.message || 'Unknown error',
      details: error?.stack || null
    }, 500);
  }
};

export const uploadImage = async (c: Context<{ Bindings: Env }>) => {
  try {
    const user = c.get('user') as { _id: string };
    const file = c.get('uploadedFile') as UploadedFile | undefined;
    const db = createTursoClient(c.env);
    
    if (!file) {
      return c.json({ success: false, message: 'No file uploaded' }, 400);
    }
    
    // Generate folder path
    const folder = generateCloudinaryFolder(user._id, 'profile');
    
    // Upload to Cloudinary
    const result = await uploadToCloudinary(
      c.env,
      file,
      folder,
      user._id
    );
    
    // Update or create profile with image URL
    const existing = await db.execute({
      sql: 'SELECT id FROM profiles WHERE user_id = ?',
      args: [user._id]
    });
    
    const now = new Date().toISOString();
    
    if (existing.rows.length === 0) {
      // Create new profile with just the image
      const id = crypto.randomUUID();
      await db.execute({
        sql: `INSERT INTO profiles (id, user_id, profile_image, created_at, updated_at) 
              VALUES (?, ?, ?, ?, ?)`,
        args: [id, user._id, result.url, now, now]
      });
    } else {
      // Update existing profile
      await db.execute({
        sql: 'UPDATE profiles SET profile_image = ?, updated_at = ? WHERE user_id = ?',
        args: [result.url, now, user._id]
      });
    }
    
    return c.json({
      success: true,
      data: {
        url: result.url,
        publicId: result.publicId,
        size: result.size,
        contentType: result.contentType
      },
      message: 'Profile image uploaded successfully'
    });
    
  } catch (error) {
    console.error('Profile upload error:', error);
    return c.json({ success: false, message: 'Failed to upload image' }, 500);
  }
};
