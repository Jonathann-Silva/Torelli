'use server';
/**
 * @fileOverview A Genkit flow for summarizing a client's past appointments and preferences.
 *
 * - summarizeClientAppointmentHistory - A function that handles the client appointment history summarization process.
 * - SummarizeClientAppointmentHistoryInput - The input type for the summarizeClientAppointmentHistory function.
 * - SummarizeClientAppointmentHistoryOutput - The return type for the summarizeClientAppointmentHistory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AppointmentHistoryItemSchema = z.object({
  date: z.string().describe('The date of the past appointment.'),
  service: z.string().describe('The service performed during the appointment.'),
  barberNotes: z.string().optional().describe('Any notes left by the barber for this appointment.'),
});

const SummarizeClientAppointmentHistoryInputSchema = z.object({
  clientName: z.string().describe('The name of the client.'),
  appointmentHistory: z.array(AppointmentHistoryItemSchema).describe('A list of past appointments for the client.'),
  clientPreferences: z.string().optional().describe('General preferences or special notes about the client.'),
});
export type SummarizeClientAppointmentHistoryInput = z.infer<typeof SummarizeClientAppointmentHistoryInputSchema>;

const SummarizeClientAppointmentHistoryOutputSchema = z.object({
  summary: z.string().describe('A summary of the client\'s past appointments and preferences.'),
});
export type SummarizeClientAppointmentHistoryOutput = z.infer<typeof SummarizeClientAppointmentHistoryOutputSchema>;

export async function summarizeClientAppointmentHistory(input: SummarizeClientAppointmentHistoryInput): Promise<SummarizeClientAppointmentHistoryOutput> {
  return summarizeClientAppointmentHistoryFlow(input);
}

const summarizeClientPrompt = ai.definePrompt({
  name: 'summarizeClientPrompt',
  input: {schema: SummarizeClientAppointmentHistoryInputSchema},
  output: {schema: SummarizeClientAppointmentHistoryOutputSchema},
  prompt: `You are an AI assistant for a barber. Your task is to provide a concise summary of a client's past appointments and preferences to help the barber prepare for their upcoming session.

Client Name: {{{clientName}}}

Past Appointment History:
{{#each appointmentHistory}}
- Date: {{{date}}}, Service: {{{service}}}{{#if barberNotes}}, Notes: {{{barberNotes}}}{{/if}}
{{/each}}

{{#if clientPreferences}}
Client Preferences/Special Notes: {{{clientPreferences}}}
{{/if}}

Based on the information above, provide a summary focusing on key preferences, recurring services, and any special considerations for the barber to provide a personalized and efficient service. Start directly with the summary, without any introductory phrases.`,
});

const summarizeClientAppointmentHistoryFlow = ai.defineFlow(
  {
    name: 'summarizeClientAppointmentHistoryFlow',
    inputSchema: SummarizeClientAppointmentHistoryInputSchema,
    outputSchema: SummarizeClientAppointmentHistoryOutputSchema,
  },
  async (input) => {
    const {output} = await summarizeClientPrompt(input);
    return output!;
  }
);
