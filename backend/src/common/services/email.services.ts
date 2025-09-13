import nodemailer from 'nodemailer';
import { createResponse } from '../helper/response.helper';
import { transporter } from '../config/email.config';



const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER, 
      to, 
      subject, 
      html, 
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.response);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}; 

export default sendEmail;