import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middleware
app.use(cors());
app.use(bodyParser.json()); // Ensure JSON parsing

// ✅ Setup Nodemailer Transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // Use TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ✅ Contact API Route
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message, company } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    console.log("Received contact form submission:", { name, email, message, company });

    // 📩 Email Configuration
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: "paishwarya623@gmail.com", // Hardcoded email for testing
      subject: "New Contact Form Submission",
      text: `Name: ${name}\nEmail: ${email}\nCompany: ${company || "N/A"}\nMessage:\n${message}`,
    };

    // ✅ Send Email
    await transporter.sendMail(mailOptions);

    console.log("Email sent successfully");
    res.status(200).json({ success: true, message: "Message received successfully" });
  } catch (error) {
    console.error("Error sending contact email:", error);
    res.status(500).json({ success: false, message: "Failed to send message" });
  }
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
