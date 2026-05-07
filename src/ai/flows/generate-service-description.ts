
'use server';
/**
 * @fileOverview A Genkit flow for generating appealing descriptions for salon services.
 *
 * - generateServiceDescription - A function that handles the generation of service descriptions.
 * - GenerateServiceDescriptionInput - The input type for the generateServiceDescription function.
 * - GenerateServiceDescriptionOutput - The return type for the generateServiceDescription function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateServiceDescriptionInputSchema = z.object({
  serviceName: z.string().describe('The name of the salon service.').min(1, 'Service name cannot be empty.'),
  keywords: z.array(z.string()).optional().describe('Optional list of keywords or selling points to include in the description.'),
  currentDescription: z.string().optional().describe('Optional existing description to use as a base or inspiration.'),
  length: z.enum(['short', 'medium', 'long']).default('medium').describe('Desired length of the generated description.'),
});
export type GenerateServiceDescriptionInput = z.infer<typeof GenerateServiceDescriptionInputSchema>;

const GenerateServiceDescriptionOutputSchema = z.object({
  description: z.string().describe('The generated appealing description for the service.').min(1, 'Description cannot be empty.'),
});
export type GenerateServiceDescriptionOutput = z.infer<typeof GenerateServiceDescriptionOutputSchema>;

export async function generateServiceDescription(input: GenerateServiceDescriptionInput): Promise<GenerateServiceDescriptionOutput> {
  return generateServiceDescriptionFlow(input);
}

const generateServiceDescriptionPrompt = ai.definePrompt({
  name: 'generateServiceDescriptionPrompt',
  input: { schema: GenerateServiceDescriptionInputSchema },
  output: { schema: GenerateServiceDescriptionOutputSchema },
  prompt: `You are an expert marketing copywriter for a high-end, luxury barbershop named 'Torelli Agendamentos'. Your goal is to craft a compelling and appealing description for a salon service, designed to attract discerning clients.

Service Name: "{{{serviceName}}}"

{{#if keywords}}
Key selling points/keywords to include: {{#each keywords}}- {{{this}}}
{{/each}}
{{/if}}

{{#if currentDescription}}
Existing description (use this as inspiration or to enhance): "{{{currentDescription}}}"
{{/if}}

Desired length: {{{length}}} (short, medium, or long)

Craft a detailed, enticing description that highlights the premium nature and unique benefits of the "{{{serviceName}}}". Focus on the client experience, the skill of the barber, and the luxurious outcome. The description should be engaging and reflect the high-quality standards of Torelli Agendamentos.

Return only the JSON object containing the generated description.`,
});

const generateServiceDescriptionFlow = ai.defineFlow(
  {
    name: 'generateServiceDescriptionFlow',
    inputSchema: GenerateServiceDescriptionInputSchema,
    outputSchema: GenerateServiceDescriptionOutputSchema,
  },
  async (input) => {
    const { output } = await generateServiceDescriptionPrompt(input);
    return output!;
  }
);
