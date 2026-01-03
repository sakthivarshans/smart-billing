/**
 * @fileOverview Type definitions for the WhatsApp text messaging flow.
 */
import { z } from 'zod';

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
