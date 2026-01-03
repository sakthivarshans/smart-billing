
'use server';
/**
 * @fileOverview A flow to send a plain text message via a generic WhatsApp API.
 *
 * - sendWhatsAppText - Calls the WhatsApp API to send the text message.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import axios from 'axios';

// Define the schema for the input of the text message flow
export const WhatsAppTextInputSchema = z.object({
  apiUrl: z.string().url().describe("The API endpoint URL for the WhatsApp provider."),
  to: z.string().describe("The recipient's phone number."),
  message: z.string().describe("The text message to be sent."),
  whatsappApiKey: z.string().describe("The WhatsApp Gateway API Key."),
});
export type WhatsAppTextInput = z.infer<typeof WhatsAppTextInputSchema>;

// Define the schema for the output of the text message flow
export const WhatsAppTextOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type WhatsAppTextOutput = z.infer<typeof WhatsAppTextOutputSchema>;


// Exported function that clients will call
export async function sendWhatsAppText(input: WhatsAppTextInput): Promise<WhatsAppTextOutput> {
  return whatsAppTextFlow(input);
}

// Define the Genkit flow for sending a text message
const whatsAppTextFlow = ai.defineFlow(
  {
    name: 'whatsAppTextFlow',
    inputSchema: WhatsAppTextInputSchema,
    outputSchema: WhatsAppTextOutputSchema,
  },
  async (input) => {
    const { apiUrl, to, message, whatsappApiKey } = input;

    if (!whatsappApiKey) {
      return {
        success: false,
        message: 'WhatsApp API Key is not configured in the admin dashboard.',
      };
    }
    
    if (!apiUrl) {
        return {
          success: false,
          message: 'The WhatsApp API URL is not configured.',
        };
    }

    try {
      // This is a generic endpoint structure for sending a text message.
      // The actual data structure may differ based on the provider.
      // E.g., BotBee might expect `text: message` instead of `message: message`.
      const data = {
        phone: to,
        text: message, // Using 'text' field, common for text messages
      };

      const response = await axios.post(apiUrl, data, {
        headers: {
          'Authorization': whatsappApiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });
      
      if (response.data?.status === 'success' || response.status === 200 || response.status === 201) {
        return {
          success: true,
          message: `WhatsApp message sent successfully.`,
        };
      } else {
        const errorMessage = response.data?.message || 'Unknown error from WhatsApp provider.';
        return {
          success: false,
          message: `Failed to send message: ${errorMessage}`,
        };
      }

    } catch (error: any) {
      console.error('WhatsApp API error:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.message || 'An unknown network error occurred';
      return {
        success: false,
        message: `Failed to send message: ${errorMessage}`,
      };
    }
  }
);
