"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const process_1 = __importDefault(require("process"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const loadConfig = () => {
    var _a;
    try {
        const env = (_a = process_1.default.env.NODE_ENV) !== null && _a !== void 0 ? _a : "development";
        // In Vercel/serverless environment, don't try to load .env files from filesystem
        if (process_1.default.env.VERCEL || process_1.default.env.NODE_ENV === "production") {
            // Environment variables are already loaded by Vercel
            return;
        }
        // Only load .env files in development/local environment
        try {
            const filepath = path_1.default.join(process_1.default.cwd(), `.env.${env}`);
            if (fs_1.default.existsSync(filepath)) {
                dotenv_1.default.config({ path: filepath });
            }
        }
        catch (error) {
            console.warn("Could not load .env file:", error);
        }
    }
    catch (error) {
        console.warn("Error in loadConfig:", error);
    }
};
exports.loadConfig = loadConfig;
