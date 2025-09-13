"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = void 0;
const cloudinary_config_1 = __importDefault(require("../config/cloudinary.config"));
const stream_1 = require("stream");
/**
 * Uploads a file buffer to Cloudinary under a specified folder.
 * @param file - Multer file object with buffer
 * @param userFolder - Cloudinary folder path (e.g., 'users/user123')
 * @returns Secure URL of uploaded image
 */
const uploadFileToCloudinary = (file, userFolder) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_config_1.default.uploader.upload_stream({ folder: userFolder }, (error, result) => {
            if (error)
                return reject(error);
            if (!result)
                return reject(new Error('Upload failed with no result'));
            resolve(result.secure_url);
        });
        stream_1.Readable.from(file.buffer).pipe(uploadStream);
    });
};
const uploadImage = (file, userFolder) => __awaiter(void 0, void 0, void 0, function* () {
    if (!file || !file.buffer) {
        throw new Error('No file buffer provided for upload');
    }
    return yield uploadFileToCloudinary(file, userFolder);
});
exports.uploadImage = uploadImage;
