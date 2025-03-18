// server/email.d.ts
declare module "email" {
    export function sendEmail(
      subject: string, 
      text: string, 
      to: string, 
      message: string
    ): Promise<any>;
  }
  