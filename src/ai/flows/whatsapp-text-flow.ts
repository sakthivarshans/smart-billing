
'use server';
/**
 * @fileOverview A flow to send a plain text message via a generic WhatsApp API.
 *
 * - sendWhatsAppText - Calls the WhatsApp API to send the text message.
 */
import { ai } from '@/ai/genkit';
import { 
  WhatsAppTextInputSchema,
  WhatsAppTextOutputSchema,
  type WhatsAppTextInput,
  type WhatsAppTextOutput
} from './whatsapp-text-flow-types';
import axios from 'axios';


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
    const { to, message, whatsappApiKey } = input;
    
    const apiUrl = input.apiUrl || 'https://api.botbee.ai/v1/messages';

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
      // E.g., BotBee might expect `number: to` instead of `phone: to`.
      const data = {
        number: to,
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
