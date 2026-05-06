'use server';
/**
 * @fileOverview An AI agent that suggests engaging marketing copy and campaign ideas.
 *
 * - generateMarketingContent - A function that handles the marketing content generation process.
 * - GenerateMarketingContentInput - The input type for the generateMarketingContent function.
 * - GenerateMarketingContentOutput - The return type for the generateMarketingContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMarketingContentInputSchema = z.object({
  contentType: z
    .enum(['service', 'promotion', 'event'])
    .describe('The type of content to generate (service, promotion, or event).'),
  name: z.string().describe('The name of the service, promotion, or event.'),
  details: z
    .string()
    .describe(
      'Detailed information about the content, e.g., features of a service, terms of a promotion, or agenda of an event.'
    ),
  targetAudience: z
    .string()
    .optional()
    .describe('Specific demographic or psychographic of the audience (optional).'),
  callToAction: z
    .string()
    .optional()
    .describe('Desired action from the client, e.g., "Book Now", "Learn More", "RSVP" (optional).'),
});
export type GenerateMarketingContentInput = z.infer<
  typeof GenerateMarketingContentInputSchema
>;

const GenerateMarketingContentOutputSchema = z.object({
  copy: z.string().describe('Engaging marketing copy for the content.'),
  campaignIdeas: z.array(z.string()).describe('A list of creative campaign ideas.'),
});
export type GenerateMarketingContentOutput = z.infer<
  typeof GenerateMarketingContentOutputSchema
>;

export async function generateMarketingContent(
  input: GenerateMarketingContentInput
): Promise<GenerateMarketingContentOutput> {
  return generateMarketingContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMarketingContentPrompt',
  input: {schema: GenerateMarketingContentInputSchema},
  output: {schema: GenerateMarketingContentOutputSchema},
  prompt: `You are an expert marketing content creator for "ELITE BLADE", a luxury barbershop. Your goal is to generate engaging marketing copy and creative campaign ideas that attract and retain high-value clients.

The content type is: {{{contentType}}}
Name: {{{name}}}
Details: {{{details}}}

{{#if targetAudience}}
Target Audience: {{{targetAudience}}}
{{/if}}

{{#if callToAction}}
Desired Call to Action: {{{callToAction}}}
{{/if}}

Generate compelling marketing copy and at least 3 creative campaign ideas for the above. Focus on luxury, exclusivity, and the premium experience of Elite Blade. Format the output strictly as JSON, with 'copy' as a string and 'campaignIdeas' as an array of strings.
`,
});

const generateMarketingContentFlow = ai.defineFlow(
  {
    name: 'generateMarketingContentFlow',
    inputSchema: GenerateMarketingContentInputSchema,
    outputSchema: GenerateMarketingContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
