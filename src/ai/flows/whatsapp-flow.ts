
'use server';
/**
 * @fileOverview A flow to send a PDF via WhatsApp Business API.
 *
 * - sendWhatsAppPdf - Calls a third-party API to send the message.
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
    const { to, pdfBase64, filename, caption, whatsappApiKey } = input;

    if (!whatsappApiKey) {
      return {
        success: false,
        message: 'WhatsApp API Key is not configured in the admin dashboard.',
      };
    }

    try {
      // We will use a third-party service like WABlas as a proxy to the WhatsApp API
      // as direct API calls can be complex.
      const apiUrl = 'https://wablas.com/api/v2/send-document';

      const response = await axios.post(apiUrl, {
        // WABlas uses 'phone', not 'to'
        phone: to,
        document: `data:application/pdf;base64,${pdfBase64}`,
        caption: caption,
        // The filename parameter is not directly supported by all services,
        // but we include it if the API allows it. WABlas doesn't use it.
      }, {
        headers: {
          'Authorization': whatsappApiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });
      
      if (response.data?.status === 'success') {
        return {
          success: true,
          message: 'WhatsApp message sent successfully.',
        };
      } else {
        // Use the error message from the API if available
        const errorMessage = response.data?.message || 'Unknown error from WhatsApp service.';
        return {
          success: false,
          message: `Failed to send WhatsApp message: ${errorMessage}`,
        };
      }

    } catch (error: any) {
      console.error('WhatsApp API sending error:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.message || 'An unknown network error occurred';
      return {
        success: false,
        message: `Failed to send WhatsApp message: ${errorMessage}`,
      };
    }
  }
);
