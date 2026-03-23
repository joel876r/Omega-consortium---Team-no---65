'use server';
/**
 * @fileOverview This file implements a Genkit flow for analyzing incoming customer complaints.
 *
 * - analyzeIncomingComplaint - A function that analyzes a complaint for sentiment, severity, priority, and categorization.
 * - AnalyzeIncomingComplaintInput - The input type for the analyzeIncomingComplaint function.
 * - AnalyzeIncomingComplaintOutput - The return type for the analyzeIncomingComplaint function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeIncomingComplaintInputSchema = z.object({
  complaintText: z.string().describe('The full text of the customer complaint.'),
});
export type AnalyzeIncomingComplaintInput = z.infer<typeof AnalyzeIncomingComplaintInputSchema>;

const AnalyzeIncomingComplaintOutputSchema = z.object({
  sentiment: z
    .enum(['Positive', 'Neutral', 'Negative', 'Mixed'])
    .describe('The overall sentiment of the complaint. Choose from Positive, Neutral, Negative, or Mixed.'),
  severity: z
    .enum(['Low', 'Medium', 'High', 'Critical'])
    .describe('The severity level of the issue described in the complaint. Choose from Low, Medium, High, or Critical.'),
  priority: z
    .enum(['Low', 'Medium', 'High', 'Urgent'])
    .describe('The recommended priority for handling this complaint. Choose from Low, Medium, High, or Urgent.'),
  category: z
    .string()
    .describe(
      'The primary category of the complaint, such as "Technical Support", "Billing", "Product Issue", "Account Management", "Service Feedback", or "Other".'
    ),
  subcategory: z
    .string()
    .describe('A more specific subcategory within the main category, if applicable (e.g., "Login Issues" under "Technical Support").'),
});
export type AnalyzeIncomingComplaintOutput = z.infer<typeof AnalyzeIncomingComplaintOutputSchema>;

export async function analyzeIncomingComplaint(
  input: AnalyzeIncomingComplaintInput
): Promise<AnalyzeIncomingComplaintOutput> {
  return analyzeIncomingComplaintFlow(input);
}

const analyzeIncomingComplaintPrompt = ai.definePrompt({
  name: 'analyzeIncomingComplaintPrompt',
  input: { schema: AnalyzeIncomingComplaintInputSchema },
  output: { schema: AnalyzeIncomingComplaintOutputSchema },
  prompt: `You are an expert customer service analyst for ComplaintCore AI, designed to quickly and accurately assess customer complaints.
Your task is to analyze the provided complaint text and extract the following key information:
1.  **Sentiment**: Determine the overall sentiment (Positive, Neutral, Negative, or Mixed).
2.  **Severity**: Assess the severity of the issue (Low, Medium, High, or Critical).
3.  **Priority**: Recommend a handling priority (Low, Medium, High, or Urgent).
4.  **Category**: Assign a primary category (e.g., "Technical Support", "Billing", "Product Issue", "Account Management", "Service Feedback", "Other").
5.  **Subcategory**: Provide a more specific subcategory within the primary category.

Return the analysis in a structured JSON format matching the provided schema.

Complaint Text: """{{{complaintText}}}"""`,
});

const analyzeIncomingComplaintFlow = ai.defineFlow(
  {
    name: 'analyzeIncomingComplaintFlow',
    inputSchema: AnalyzeIncomingComplaintInputSchema,
    outputSchema: AnalyzeIncomingComplaintOutputSchema,
  },
  async (input) => {
    const { output } = await analyzeIncomingComplaintPrompt(input);
    if (!output) {
      throw new Error('Failed to analyze the complaint. No output received from the model.');
    }
    return output;
  }
);
