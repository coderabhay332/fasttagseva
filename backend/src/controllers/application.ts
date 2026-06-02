import type { Context } from 'hono';
import type { Env } from '../types/env';
import { uploadToCloudinary, generateCloudinaryFolder } from '../utils/cloudinary';
import type { UploadedFile } from '../middleware/upload';

// In-memory storage
const applications: any[] = [];

export const create = async (c: Context<{ Bindings: Env }>) => {
  const user = c.get('user');
  const body = await c.req.json();
  
  const application = {
    _id: crypto.randomUUID(),
    userId: user._id,
    ...body,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  applications.push(application);
  
  return c.json({
    success: true,
    data: application,
    message: 'Application created'
  }, 201);
};

export const getAllForUser = async (c: Context<{ Bindings: Env }>) => {
  const user = c.get('user');
  
  const userApplications = applications.filter(a => a.userId === user._id);
  
  return c.json({
    success: true,
    data: userApplications,
    message: 'Applications fetched'
  });
};

export const getById = async (c: Context<{ Bindings: Env }>) => {
  const user = c.get('user');
  const id = c.req.param('id');
  
  const application = applications.find(a => a._id === id && a.userId === user._id);
  
  if (!application) {
    return c.json({ success: false, message: 'Application not found' }, 404);
  }
  
  return c.json({
    success: true,
    data: application,
    message: 'Application fetched'
  });
};

export const update = async (c: Context<{ Bindings: Env }>) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const body = await c.req.json();
  
  const index = applications.findIndex(a => a._id === id && a.userId === user._id);
  
  if (index === -1) {
    return c.json({ success: false, message: 'Application not found' }, 404);
  }
  
  applications[index] = {
    ...applications[index],
    ...body,
    updatedAt: new Date().toISOString()
  };
  
  return c.json({
    success: true,
    data: applications[index],
    message: 'Application updated'
  });
};

export const deleteOne = async (c: Context<{ Bindings: Env }>) => {
  const user = c.get('user');
  const id = c.req.param('id');
  
  const index = applications.findIndex(a => a._id === id && a.userId === user._id);
  
  if (index === -1) {
    return c.json({ success: false, message: 'Application not found' }, 404);
  }
  
  const deleted = applications.splice(index, 1)[0];
  
  return c.json({
    success: true,
    data: deleted,
    message: 'Application deleted'
  });
};

// Admin routes
export const getAll = async (c: Context<{ Bindings: Env }>) => {
  return c.json({
    success: true,
    data: applications,
    message: 'All applications fetched'
  });
};

export const deleteByAdmin = async (c: Context<{ Bindings: Env }>) => {
  const id = c.req.param('id');
  
  const index = applications.findIndex(a => a._id === id);
  
  if (index === -1) {
    return c.json({ success: false, message: 'Application not found' }, 404);
  }
  
  const deleted = applications.splice(index, 1)[0];
  
  return c.json({
    success: true,
    data: deleted,
    message: 'Application deleted'
  });
};

export const updateStatus = async (c: Context<{ Bindings: Env }>) => {
  const body = await c.req.json();
  const { id, status } = body;
  
  const index = applications.findIndex(a => a._id === id);
  
  if (index === -1) {
    return c.json({ success: false, message: 'Application not found' }, 404);
  }
  
  applications[index].status = status;
  applications[index].updatedAt = new Date().toISOString();
  
  return c.json({
    success: true,
    data: applications[index],
    message: 'Status updated'
  });
};

// Helper function for application image uploads
async function uploadApplicationImage(
  c: Context<{ Bindings: Env }>,
  imageType: 'pan' | 'rc' | 'vehicle-front' | 'vehicle-side',
  fieldName: string
) {
  try {
    const user = c.get('user');
    const applicationId = c.req.param('id');
    const file = c.get('uploadedFile') as UploadedFile | undefined;
    
    if (!file) {
      return c.json({ success: false, message: 'No file uploaded' }, 400);
    }
    
    // Find application
    const index = applications.findIndex(a => a._id === applicationId && a.userId === user._id);
    if (index === -1) {
      return c.json({ success: false, message: 'Application not found' }, 404);
    }
    
    // Generate folder path
    const folder = generateCloudinaryFolder(user._id, imageType);
    
    // Upload to Cloudinary
    const result = await uploadToCloudinary(
      c.env,
      file,
      folder,
      user._id
    );
    
    // Update application with image URL
    applications[index][fieldName] = result.url;
    applications[index].updatedAt = new Date().toISOString();
    
    return c.json({
      success: true,
      data: {
        url: result.url,
        publicId: result.publicId,
        size: result.size,
        contentType: result.contentType
      },
      message: `${imageType} image uploaded successfully`
    });
    
  } catch (error) {
    console.error(`${imageType} upload error:`, error);
    return c.json({ success: false, message: `Failed to upload ${imageType} image` }, 500);
  }
}

// Image upload handlers
export const uploadPanImage = async (c: Context<{ Bindings: Env }>) => {
  return uploadApplicationImage(c, 'pan', 'panImage');
};

export const uploadRc = async (c: Context<{ Bindings: Env }>) => {
  return uploadApplicationImage(c, 'rc', 'rcImage');
};

export const uploadVehicleFront = async (c: Context<{ Bindings: Env }>) => {
  return uploadApplicationImage(c, 'vehicle-front', 'vehicleFrontImage');
};

export const uploadVehicleSideImage = async (c: Context<{ Bindings: Env }>) => {
  return uploadApplicationImage(c, 'vehicle-side', 'vehicleSideImage');
};
