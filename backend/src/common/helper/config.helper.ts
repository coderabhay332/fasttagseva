import dotenv from "dotenv";
import process from "process";
import path from "path";
import fs from "fs";

export const loadConfig = () => {
  try {
    const env = process.env.NODE_ENV ?? "development";
    
    // In Vercel/serverless environment, don't try to load .env files from filesystem
    if (process.env.VERCEL || process.env.NODE_ENV === "production") {
      // Environment variables are already loaded by Vercel
      return;
    }
    
    // Only load .env files in development/local environment
    try {
      const filepath = path.join(process.cwd(), `.env.${env}`);
      if (fs.existsSync(filepath)) {
        dotenv.config({ path: filepath });
      }
    } catch (error) {
      console.warn("Could not load .env file:", error);
    }
  } catch (error) {
    console.warn("Error in loadConfig:", error);
  }
};