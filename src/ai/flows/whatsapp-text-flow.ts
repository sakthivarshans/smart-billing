
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
    
    // Correctly handle the fallback URL.
    const apiUrl = input.apiUrl || 'https://api.whatstool.business/developers/v2/messages/{{WHATSAPP_API_NO}}';

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
      // This structure is now aligned with providers like WhatsTool
      const data = {
        to: to,
        type: 'text',
        text: {
          body: message
        }
      };

      const response = await axios.post(apiUrl, data, {
        headers: {
          'x-api-key': whatsappApiKey, // Changed from 'Authorization'
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
