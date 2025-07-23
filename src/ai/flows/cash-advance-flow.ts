'use server';
/**
 * @fileOverview A flow for generating cash advance requests for motorcycles needing renewal.
 *
 * - generateCashAdvance - A function that handles the cash advance generation process.
 * - GenerateCashAdvanceInput - The input type for the generateCashAdvance function.
 * - GenerateCashAdvanceOutput - The return type for the generateCashAdvance function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const MotorcycleSchema = z.object({
  id: z.string(),
  make: z.string(),
  model: z.string(),
  year: z.number(),
  color: z.string(),
  plateNumber: z.string(),
  engineNumber: z.string(),
  chassisNumber: z.string(),
  assignedBranch: z.string(),
  purchaseDate: z.string().describe('The purchase date of the motorcycle.'),
  supplier: z.string(),
  documents: z.array(z.object({
    type: z.enum(['OR/CR', 'COC', 'Insurance']),
    url: z.string(),
    uploadedAt: z.string().describe('The upload date of the document.'),
    expiresAt: z.string().optional().describe('The expiration date of the document.'),
  })),
  status: z.enum(['Incomplete', 'Ready to Register', 'Registered', 'For Renewal']),
});


const CashAdvanceSchema = z.object({
    id: z.string(),
    personnel: z.string().describe("The personnel responsible for the cash advance. Default to 'System Generated'"),
    purpose: z.string().describe('The purpose of the cash advance. This should be descriptive, e.g., "OR/CR Renewal for Plate No. [plateNumber]"'),
    amount: z.number().describe('The estimated amount for the renewal. Use a reasonable default like 2500 if unsure.'),
    date: z.string().describe('The date of the cash advance request.'),
    status: z.enum(['Pending', 'Approved', 'Liquidated', 'Rejected']),
    receipts: z.array(z.string()).optional(),
});


const GenerateCashAdvanceInputSchema = z.object({
  motorcycles: z.array(MotorcycleSchema).describe("An array of motorcycle objects that need cash advances for renewal."),
});
export type GenerateCashAdvanceInput = z.infer<typeof GenerateCashAdvanceInputSchema>;

const GenerateCashAdvanceOutputSchema = z.object({
  cashAdvances: z.array(CashAdvanceSchema).describe("An array of generated cash advance objects."),
});
export type GenerateCashAdvanceOutput = z.infer<typeof GenerateCashAdvanceOutputSchema>;

export async function generateCashAdvance(input: GenerateCashAdvanceInput): Promise<GenerateCashAdvanceOutput> {
  // Genkit flows expect plain JSON objects, so we need to make sure dates are strings.
  const sanitizedInput = {
    ...input,
    motorcycles: input.motorcycles.map(m => ({
      ...m,
      purchaseDate: new Date(m.purchaseDate).toISOString(),
      documents: m.documents.map(d => ({
        ...d,
        uploadedAt: new Date(d.uploadedAt).toISOString(),
        expiresAt: d.expiresAt ? new Date(d.expiresAt).toISOString() : undefined,
      })),
    })),
  };
  return generateCashAdvanceFlow(sanitizedInput);
}

const prompt = ai.definePrompt({
  name: 'generateCashAdvancePrompt',
  input: { schema: GenerateCashAdvanceInputSchema },
  output: { schema: GenerateCashAdvanceOutputSchema },
  prompt: `
    You are an AI assistant that helps generate cash advance requests for vehicle document renewals.
    Based on the provided list of motorcycles, create a cash advance request for each one.
    The purpose should clearly state that it's for renewal and include the plate number.
    Set the status to 'Pending' and the date to today's date in ISO format.

    Motorcycles needing renewal:
    {{#each motorcycles}}
    - Plate: {{plateNumber}}, Make: {{make}}, Model: {{model}}, Status: {{status}}
    {{/each}}
  `,
});

const generateCashAdvanceFlow = ai.defineFlow(
  {
    name: 'generateCashAdvanceFlow',
    inputSchema: GenerateCashAdvanceInputSchema,
    outputSchema: GenerateCashAdvanceOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    
    if (!output) {
        return { cashAdvances: [] };
    }

    // Ensure the date field in the output is a valid ISO string.
    const datedOutput = {
        ...output,
        cashAdvances: output.cashAdvances.map(ca => ({
            ...ca,
            date: new Date().toISOString()
        }))
    };

    return datedOutput;
  }
);
