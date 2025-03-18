import { sendEmail } from "./email"; // Ensure this is the correct import path
import { type User, type InsertUser, type InsertContact } from "@shared/schema";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createContactMessage(contactData: InsertContact): Promise<{ success: boolean; message: string }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private messages: Map<number, InsertContact>;
  private currentId: number;
  private messageId: number;

  constructor() {
    this.users = new Map();
    this.messages = new Map();
    this.currentId = 1;
    this.messageId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    console.log(`✅ User created: ${JSON.stringify(user, null, 2)}`);
    return user;
  }

  async createContactMessage(contactData: InsertContact): Promise<{ success: boolean; message: string }> {
    try {
      // Store the contact message
      const id = this.messageId++;
      this.messages.set(id, contactData);
      console.log("✅ Contact message stored:", contactData);

      // Prepare email details
      const subject = "New Contact Message Received";
      const text = `You have received a new message from ${contactData.name} (${contactData.email}):\n\n${contactData.message}`;

      const recipientEmail = process.env.CONTACT_EMAIL;
      if (!recipientEmail) {
        console.error("❌ CONTACT_EMAIL is missing in .env file.");
        return { success: false, message: "Server email configuration is missing." };
      }

      // Email parameters need to match template parameters (name, email, message, etc.)
      const templateParams = {
        to_name: contactData.name,
        from_email: contactData.email,
        message: contactData.message,
      };

      const serviceID = 'service_kdk8m6q';  // Static Service ID
      const templateID = 'template_z6euyrg';  // Static Template ID
      const userID = 'pDGUVJH93DGVAweiV'; 


      // Validate if all necessary environment variables are provided
      if (!serviceID || !templateID || !userID) {
        console.error("❌ Missing EmailJS configuration in .env file.");
        return { success: false, message: "EmailJS configuration is missing." };
      }

      // ✅ Call sendEmail with correct parameters
      const emailResponse = await sendEmail(serviceID, templateID, templateParams, userID);

      // If the email is sent successfully, log success message
      console.log("✅ Email sent successfully:", emailResponse);

      const response = { success: true, message: "Contact message stored and email sent successfully!" };
      console.log("📤 Sending Response:", JSON.stringify(response, null, 2)); // ✅ Log response
      return response;
    } catch (error) {
      // Handle error, but don't expose too much to the user
      console.error("❌ Error in createContactMessage:", error);
      return { success: false, message: "Failed to store contact message or send email." };
    }
  }
}

export const storage = new MemStorage();
