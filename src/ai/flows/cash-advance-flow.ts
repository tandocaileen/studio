'use server';
/**
 * @fileOverview A flow for generating a single cash advance request for multiple motorcycles.
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
    type: z.enum(['OR/CR', 'COC', 'Insurance', 'CSR', 'HPG Control Form']),
    url: z.string(),
    uploadedAt: z.string().describe('The upload date of the document.'),
    expiresAt: z.string().optional().describe('The expiration date of the document.'),
  })),
  status: z.enum(['Incomplete', 'Ready to Register', 'Registered', 'For Renewal', 'Endorsed - Ready', 'Endorsed - Incomplete', 'Processing', 'For Review']),
  processingFee: z.number().optional(),
  orFee: z.number().optional(),
  customerName: z.string().optional(),
  assignedLiaison: z.string().optional(),
});


const GenerateCashAdvanceInputSchema = z.object({
  motorcycles: z.array(MotorcycleSchema).describe("An array of motorcycle objects that need cash advances for renewal."),
  liaison: z.string().describe("The name of the liaison requesting the cash advance."),
  remarks: z.string().optional().describe("Optional remarks from the liaison."),
});
export type GenerateCashAdvanceInput = z.infer<typeof GenerateCashAdvanceInputSchema>;

const GenerateCashAdvanceOutputSchema = z.object({
    id: z.string().describe("A unique ID for the cash advance, e.g., 'ca-MMDDYY-001'"),
    personnel: z.string().describe("The personnel responsible for the cash advance."),
    purpose: z.string().describe('A summarized purpose for the cash advance, e.g., "Cash advance for registration of 3 units."'),
    amount: z.number().describe('The total combined amount for all motorcycles (processingFee + orFee).'),
    date: z.string().describe("The date of the cash advance request in ISO format."),
    status: z.enum(['Processing for CV', 'CV Released', 'CV Received', 'Liquidated']),
    motorcycleIds: z.array(z.string()).describe("An array of IDs of the motorcycles included in this cash advance."),
});
export type GenerateCashAdvanceOutput = z.infer<typeof GenerateCashAdvanceOutputSchema>;

export async function generateCashAdvance(input: GenerateCashAdvanceInput): Promise<GenerateCashAdvanceOutput> {
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
    You are an AI assistant that creates a single, consolidated cash advance request for multiple vehicle registrations.
    
    Instructions:
    1.  Calculate the total amount by summing the 'processingFee' and 'orFee' for EVERY motorcycle in the list.
    2.  Create a single cash advance object.
    3.  The purpose should be a summary, like "Cash advance for registration of X units".
    4.  If remarks are provided, append them to the purpose. For example: "Cash advance for registration of X units. Remarks: [remarks]".
    5.  The personnel should be the requesting liaison.
    6.  Collect all motorcycle IDs into the 'motorcycleIds' array.
    7.  Set the status to 'Processing for CV' and the date to today's date in ISO format.
    8.  Generate a unique ID for the cash advance following the format 'ca-MMDDYY-XXX'.

    Motorcycles for processing:
    {{#each motorcycles}}
    - ID: {{id}}, Plate: {{plateNumber}}, Processing Fee: {{processingFee}}, OR Fee: {{orFee}}
    {{/each}}

    Requesting Liaison: {{liaison}}
    {{#if remarks}}Remarks: {{remarks}}{{/if}}
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
        throw new Error("AI failed to generate a cash advance response.");
    }
    
    const totalAmount = input.motorcycles.reduce((sum, mc) => {
        return sum + (mc.processingFee || 0) + (mc.orFee || 0);
    }, 0);

    const finalOutput = {
        ...output,
        amount: totalAmount,
        date: new Date().toISOString()
    };

    return finalOutput;
  }
);
