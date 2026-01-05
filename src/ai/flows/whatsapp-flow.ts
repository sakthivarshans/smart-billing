
'use server';
/**
 * @fileOverview A flow to send a PDF via a generic WhatsApp API.
 *
 * - sendWhatsAppPdf - Calls the WhatsApp API to send the message and file.
 */
import { ai } from '@/ai/genkit';
import { 
  WhatsAppMessageInputSchema, 
  WhatsAppMessageOutputSchema,
  type WhatsAppMessageInput,
  type WhatsAppMessageOutput,
} from './whatsapp-flow-types';
import axios from 'axios';

export async function sendWhatsAppPdf(input: WhatsAppMessageInput): Promise<WhatsAppMessageOutput> {
  return whatsAppPdfFlow(input);
}

const whatsAppPdfFlow = ai.defineFlow(
  {
    name: 'whatsAppPdfFlow',
    inputSchema: WhatsAppMessageInputSchema,
    outputSchema: WhatsAppMessageOutputSchema,
  },
  async (input) => {
    const { apiUrl, to, pdfBase64, filename, message, whatsappApiKey } = input;

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
      // This is a generic endpoint structure. The actual data structure may differ based on the provider.
      // E.g., for BotBee, it might require a 'type' field and different parameter names.
      const data = {
        number: to,
        document: pdfBase64,
        filename: filename,
        caption: message,
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
          message: `WhatsApp message with PDF sent successfully.`,
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
