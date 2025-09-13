import nodemailer from "nodemailer";
import { loadConfig } from "../helper/config.helper";
require('dotenv').config();
loadConfig();
console.log(process.env.EMAIL_USER, process.env.EMAIL_PASS);
export const transporter = nodemailer.createTransport({
  service: "gmail",
  
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, 
  },
}); 

