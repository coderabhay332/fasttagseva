import cloudinary from '../config/cloudinary.config';
import { Readable } from 'stream';
import { Express } from 'express';

/**
 * Uploads a file buffer to Cloudinary under a specified folder.
 * @param file - Multer file object with buffer
 * @param userFolder - Cloudinary folder path (e.g., 'users/user123')
 * @returns Secure URL of uploaded image
 */
const uploadFileToCloudinary = (
  file: Express.Multer.File,
  userFolder: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: userFolder },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('Upload failed with no result'));
        resolve(result.secure_url);
      }
    );

    Readable.from(file.buffer).pipe(uploadStream);
  });
};

export const uploadImage = async (
  file: Express.Multer.File,
  userFolder: string
): Promise<string> => {
  if (!file || !file.buffer) {
    throw new Error('No file buffer provided for upload');
  }
  return await uploadFileToCloudinary(file, userFolder);
};
