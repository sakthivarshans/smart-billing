/**
 * @fileOverview Type definitions for a generic email sending flow.
 */
import { z } from 'zod';

// Define the schema for the input of the email flow
export const EmailInputSchema = z.object({
    apiUrl: z.string().url().describe("The API endpoint URL for the email provider."),
    to: z.string().email().describe("The recipient's email address."),
    subject: z.string().describe("The subject of the email."),
    body: z.string().describe("The HTML or text body of the email."),
    apiKey: z.string().describe("The API Key for the email gateway."),
});
export type EmailInput = z.infer<typeof EmailInputSchema>;

// Define the schema for the output of the email flow
export const EmailOutputSchema = z.object({
    success: z.boolean(),
    message: z.string(),
});
export type EmailOutput = z.infer<typeof EmailOutputSchema>;
