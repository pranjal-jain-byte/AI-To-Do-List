'use server';

/**
 * @fileOverview Extracts tasks from notes and converts them into to-do items.
 *
 * - extractTasksFromNotes - A function that handles the task extraction process.
 * - ExtractTasksFromNotesInput - The input type for the extractTasksFromNotes function.
 * - ExtractTasksFromNotesOutput - The return type for the extractTasksFromNotes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractTasksFromNotesInputSchema = z.object({
  notes: z.string().describe('The notes from which to extract tasks.'),
});
export type ExtractTasksFromNotesInput = z.infer<typeof ExtractTasksFromNotesInputSchema>;

const ExtractTasksFromNotesOutputSchema = z.object({
  tasks: z
    .array(z.string())
    .describe('The extracted tasks from the notes.'),
});
export type ExtractTasksFromNotesOutput = z.infer<typeof ExtractTasksFromNotesOutputSchema>;

export async function extractTasksFromNotes(input: ExtractTasksFromNotesInput): Promise<ExtractTasksFromNotesOutput> {
  return extractTasksFromNotesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractTasksFromNotesPrompt',
  input: {schema: ExtractTasksFromNotesInputSchema},
  output: {schema: ExtractTasksFromNotesOutputSchema},
  prompt: `You are a helpful assistant designed to extract tasks from notes.

  Given the following notes, extract all tasks that need to be done. A task is an action item, usually with a verb.
  Return the tasks as a JSON array of strings.

  Notes: {{{notes}}}`,
});

const extractTasksFromNotesFlow = ai.defineFlow(
  {
    name: 'extractTasksFromNotesFlow',
    inputSchema: ExtractTasksFromNotesInputSchema,
    outputSchema: ExtractTasksFromNotesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
