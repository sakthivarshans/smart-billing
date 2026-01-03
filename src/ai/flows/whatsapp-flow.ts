
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
        // The Sender ID is required by DLT regulations in India.
        // 'FSTSMS' is a default that works for transactional text SMS.
        // This might need to be changed to a registered ID from the telecom provider
        // for promotional routes.
        sender_id: 'FSTSMS',
        route: 'dlt',
        // In Fast2Sms, you need pre-approved DLT templates for the 'dlt' route.
        // The 'message' content must match one of these templates.
        // We are using the content from the payment screen.
        message: message, 
        // This endpoint sends text messages. It does not support sending files.
        // We will send the text message and return a success message that clarifies this.
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
        // This will catch DLT template errors or other API issues.
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
