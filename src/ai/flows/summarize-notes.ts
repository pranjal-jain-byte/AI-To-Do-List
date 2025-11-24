'use server';

/**
 * @fileOverview Implements the SummarizeNotes flow, which allows users to summarize their notes using AI.
 *
 * @function summarizeNotes - Summarizes the content of a note.
 * @typedef {Object} SummarizeNotesInput - The input for the summarizeNotes function, containing the note content.
 * @typedef {Object} SummarizeNotesOutput - The output of the summarizeNotes function, containing the summarized note.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeNotesInputSchema = z.object({
  noteContent: z.string().describe('The content of the note to be summarized.'),
});

export type SummarizeNotesInput = z.infer<typeof SummarizeNotesInputSchema>;

const SummarizeNotesOutputSchema = z.object({
  summary: z.string().describe('The summarized content of the note.'),
});

export type SummarizeNotesOutput = z.infer<typeof SummarizeNotesOutputSchema>;

export async function summarizeNotes(input: SummarizeNotesInput): Promise<SummarizeNotesOutput> {
  return summarizeNotesFlow(input);
}

const summarizeNotesPrompt = ai.definePrompt({
  name: 'summarizeNotesPrompt',
  input: {schema: SummarizeNotesInputSchema},
  output: {schema: SummarizeNotesOutputSchema},
  prompt: `Summarize the following note content in a concise manner:\n\n{{{noteContent}}}`, // Corrected the Handlebars syntax here
});

const summarizeNotesFlow = ai.defineFlow(
  {
    name: 'summarizeNotesFlow',
    inputSchema: SummarizeNotesInputSchema,
    outputSchema: SummarizeNotesOutputSchema,
  },
  async input => {
    const {output} = await summarizeNotesPrompt(input);
    return output!;
  }
);
