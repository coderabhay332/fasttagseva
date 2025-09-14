import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      file?: Express.Multer.File;
      user?: {
        _id: string;
        role: string;
      };
    }
  }
}
