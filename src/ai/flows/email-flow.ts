
'use server';
/**
 * @fileOverview A flow to send an email via a generic API.
 *
 * - sendEmail - Calls the email provider API to send the email.
 */
import { ai } from '@/ai/genkit';
import { 
  EmailInputSchema,
  EmailOutputSchema,
  type EmailInput,
  type EmailOutput
} from './email-flow-types';
import axios from 'axios';


// Exported function that clients will call
export async function sendEmail(input: EmailInput): Promise<EmailOutput> {
  return emailFlow(input);
}

// Define the Genkit flow for sending an email
const emailFlow = ai.defineFlow(
  {
    name: 'emailFlow',
    inputSchema: EmailInputSchema,
    outputSchema: EmailOutputSchema,
  },
  async (input) => {
    const { apiUrl, to, subject, body, apiKey } = input;

    if (!apiKey) {
      return {
        success: false,
        message: 'Email API Key is not configured in the admin dashboard.',
      };
    }
    
    if (!apiUrl) {
        return {
          success: false,
          message: 'The Email API URL is not configured.',
        };
    }

    try {
      // This is a generic endpoint structure. 
      // It might need adjustment for specific providers like SendGrid, Mailgun, etc.
      // Example for a generic provider:
      const data = {
        to: to,
        subject: subject,
        html: body, // Assuming HTML body, could be 'text'
      };

      const response = await axios.post(apiUrl, data, {
        headers: {
          'Authorization': `Bearer ${apiKey}`, // Common for many email APIs
          'Content-Type': 'application/json',
        }
      });
      
      if (response.status >= 200 && response.status < 300) {
        return {
          success: true,
          message: `Email sent successfully.`,
        };
      } else {
        const errorMessage = response.data?.message || 'Unknown error from email provider.';
        return {
          success: false,
          message: `Failed to send email: ${errorMessage}`,
        };
      }

    } catch (error: any) {
      console.error('Email API error:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.message || 'An unknown network error occurred';
      return {
        success: false,
        message: `Failed to send email: ${errorMessage}`,
      };
    }
  }
);
