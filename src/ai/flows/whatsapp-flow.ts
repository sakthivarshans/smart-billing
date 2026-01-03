
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
    const { to, pdfBase64, filename, message, whatsappApiKey } = input;

    if (!whatsappApiKey) {
      return {
        success: false,
        message: 'WhatsApp API Key is not configured in the admin dashboard.',
      };
    }

    try {
      // This is a generic endpoint structure. The actual URL may differ based on the provider.
      // E.g., for WABlas: https://wablas.com/api/v2/send-document
      const apiUrl = 'https://proxy.wablas.com/api/v2/send-document'; // Example provider URL

      const data = {
        phone: to,
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
      
      if (response.data?.status === 'success') {
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
