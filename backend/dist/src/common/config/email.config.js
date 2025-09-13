"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transporter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_helper_1 = require("../helper/config.helper");
// Load config only in non-Vercel environments
if (!process.env.VERCEL) {
    require('dotenv').config();
    (0, config_helper_1.loadConfig)();
}
console.log(process.env.EMAIL_USER, process.env.EMAIL_PASS);
exports.transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
