// src/ai/flows/generate-notification.ts
'use server';
/**
 * @fileOverview A flow to generate personalized notifications for expiring documents and unliquidated cash advances.
 *
 * - generatePersonalizedNotifications - A function that generates personalized notifications.
 * - GeneratePersonalizedNotificationsInput - The input type for the generatePersonalizedNotifications function.
 * - GeneratePersonalizedNotificationsOutput - The return type for the generatePersonalizedNotifications function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePersonalizedNotificationsInputSchema = z.object({
  documentExpirations: z.array(
    z.object({
      documentType: z.string().describe('The type of document expiring (e.g., Insurance, OR/CR, COC).'),
      motorcycleIdentifier: z.string().describe('The plate number or engine number of the motorcycle.'),
      expirationDate: z.string().describe('The expiration date of the document (YYYY-MM-DD).'),
      assignedBranch: z.string().describe('The branch to which the motorcycle is assigned.'),
    })
  ).optional().describe('A list of expiring documents.'),
  unliquidatedCashAdvances: z.array(
    z.object({
      personnel: z.string().describe('The name of the personnel with the unliquidated cash advance.'),
      amount: z.number().describe('The amount of the unliquidated cash advance.'),
      purpose: z.string().describe('The purpose of the cash advance.'),
      date: z.string().describe('The date the cash advance was issued (YYYY-MM-DD).'),
    })
  ).optional().describe('A list of unliquidated cash advances.'),
});
export type GeneratePersonalizedNotificationsInput = z.infer<typeof GeneratePersonalizedNotificationsInputSchema>;

const GeneratePersonalizedNotificationsOutputSchema = z.object({
  notifications: z.array(
    z.object({
      message: z.string().describe('The personalized notification message.'),
      recipient: z.string().optional().describe('The intended recipient of the notification (e.g., personnel name, branch).'),
      urgency: z.enum(['high', 'medium', 'low']).describe('The urgency level of the notification.'),
    })
  ).describe('A list of personalized notifications.'),
});
export type GeneratePersonalizedNotificationsOutput = z.infer<typeof GeneratePersonalizedNotificationsOutputSchema>;

export async function generatePersonalizedNotifications(input: GeneratePersonalizedNotificationsInput): Promise<GeneratePersonalizedNotificationsOutput> {
  return generatePersonalizedNotificationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePersonalizedNotificationsPrompt',
  input: {schema: GeneratePersonalizedNotificationsInputSchema},
  output: {schema: GeneratePersonalizedNotificationsOutputSchema},
  prompt: `You are a notification system that generates personalized notifications for expiring documents and unliquidated cash advances related to motorcycle management.

  The notifications should be clear, concise, and actionable. Specify the recipient in each notification, using the assigned branch for document expirations and personnel name for cash advances.  Include urgency levels (high, medium, low) based on the proximity to the expiration date or the age of the unliquidated advance. 

  Here is the information about expiring documents:
  {{#if documentExpirations}}
  {{#each documentExpirations}}
  - Document Type: {{documentType}}, Motorcycle: {{motorcycleIdentifier}}, Expires: {{expirationDate}}, Branch: {{assignedBranch}}
  {{/each}}
  {{else}}
  No expiring documents.
  {{/if}}

  Here is the information about unliquidated cash advances:
  {{#if unliquidatedCashAdvances}}
  {{#each unliquidatedCashAdvances}}
  - Personnel: {{personnel}}, Amount: {{amount}}, Purpose: {{purpose}}, Date: {{date}}
  {{/each}}
  {{else}}
  No unliquidated cash advances.
  {{/if}}

  Generate personalized notifications based on the provided information.
  `,
});

const generatePersonalizedNotificationsFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedNotificationsFlow',
    inputSchema: GeneratePersonalizedNotificationsInputSchema,
    outputSchema: GeneratePersonalizedNotificationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
