import { v2 as cloudinary } from 'cloudinary';
import { loadConfig } from '../helper/config.helper';

// Load config only in non-Vercel environments
if (!process.env.VERCEL) {
  require('dotenv').config();
  loadConfig();
}



cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;