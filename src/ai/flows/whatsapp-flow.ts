
'use server';
/**
 * @fileOverview A flow to send a PDF via Fast2Sms WhatsApp API.
 *
 * - sendWhatsAppPdf - Calls the Fast2Sms API to send the message.
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
        message: 'Fast2Sms API Key is not configured in the admin dashboard.',
      };
    }

    try {
      const apiUrl = 'https://www.fast2sms.com/dev/bulkV2';

      const params = {
        authorization: whatsappApiKey,
        // The 'p' route is for promotional SMS and is less strict than 'dlt'.
        route: 'p',
        // The 'message' content will be sent as a standard SMS.
        message: message, 
        // The numbers to send the SMS to.
        numbers: to,
      };

      const response = await axios.get(apiUrl, {
        params,
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (response.data?.return === true) {
        return {
          success: true,
          // We modify the message to reflect that only the text was sent.
          message: `Text message sent successfully. (PDF attachment not supported by this API endpoint).`,
        };
      } else {
        const errorMessage = response.data?.message || 'Unknown error from Fast2Sms.';
        // This will catch API issues.
        return {
          success: false,
          message: `Failed to send message: ${errorMessage}`,
        };
      }

    } catch (error: any) {
      console.error('Fast2Sms API error:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.message || 'An unknown network error occurred';
      return {
        success: false,
        message: `Failed to send message: ${errorMessage}`,
      };
    }
  }
);
