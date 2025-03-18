import express, { Request, Response, NextFunction } from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { insertContactSchema } from "@shared/schema";
import { ZodError } from 'zod';
import { storage } from './storage';

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Error handling middleware
app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  return res.status(500).json({ success: false, error: 'Internal server error' });
});

// Set up server
app.listen(5000, () => {
  console.log('Server running on port 5000');
});

// Contact form submission endpoint
app.post('/contact', async (req: Request, res: Response) => {
  try {
    console.log('📩 Received contact form submission:', req.body);

    // Validate the incoming request data
    const contactData = insertContactSchema.parse(req.body);

    // Log the validated data
    console.log('📩 Validated Contact Data:', contactData);

    // Save the contact message to storage (e.g., a database)
    await storage.createContactMessage(contactData);

    // Set up Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Set up email message options
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.CONTACT_EMAIL || 'your-email@example.com', // Update with your email address
      subject: '📩 New Contact Form Submission',
      text: `🔹 Name: ${contactData.name}\n🔹 Email: ${contactData.email}\n🔹 Company: ${contactData.company || 'N/A'}\n🔹 Message:\n${contactData.message}`,
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('❌ Email send failed:', error);
        return res.status(500).json({ success: false, error: 'Failed to send email.' });
      } else {
        console.log('✅ Email sent:', info);
        return res.status(200).json({ success: true, message: 'Message received successfully. Email sent.' });
      }
    });
  } catch (error) {
    console.error('❌ Error in contact submission:', error);

    // Handle validation errors
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        error: `Validation error: ${error.errors.map(err => err.message).join(', ')}`,
      });
    }

    // Handle other types of errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred.';
    return res.status(500).json({ success: false, error: errorMessage });
  }
});
