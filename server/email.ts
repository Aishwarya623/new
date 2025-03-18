// email.ts

import emailjs from 'emailjs-com';

export const sendEmail = async (
  serviceID: string,
  templateID: string,
  templateParams: { [key: string]: any },
  userID: string
) => {
  try {
    const response = await emailjs.send(serviceID, templateID, templateParams, userID);
    return response;
  } catch (error) {
    console.error("Error in sending email:", error);
    throw new Error('Failed to send email');
  }
};
