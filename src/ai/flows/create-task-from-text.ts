'use server';

/**
 * @fileOverview Parses a natural language command to create a task.
 *
 * - createTaskFromText - A function that handles the task creation from text process.
 * - CreateTaskFromTextInput - The input type for the createTaskFromText function.
 * - CreateTaskFromTextOutput - The return type for the createTaskFromText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CreateTaskFromTextInputSchema = z.object({
  command: z.string().describe('The natural language command to create a task.'),
  context: z.object({
    currentDate: z.string().describe('The current date in ISO format to resolve relative dates like "today" or "tomorrow".'),
  })
});
export type CreateTaskFromTextInput = z.infer<typeof CreateTaskFromTextInputSchema>;

const CreateTaskFromTextOutputSchema = z.object({
  title: z.string().describe('The extracted title of the task. Should be a concise action.'),
  dueDate: z.string().describe('The extracted due date for the task in ISO 8601 format. If no date is specified, use the current date.').optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).describe('The priority of the task. Default to "Medium" if not specified.').optional(),
});
export type CreateTaskFromTextOutput = z.infer<typeof CreateTaskFromTextOutputSchema>;

export async function createTaskFromText(input: CreateTaskFromTextInput): Promise<CreateTaskFromTextOutput> {
  return createTaskFromTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'createTaskFromTextPrompt',
  input: {schema: CreateTaskFromTextInputSchema},
  output: {schema: CreateTaskFromTextOutputSchema},
  prompt: `You are an AI assistant that creates tasks from natural language.
  The current date is: {{context.currentDate}}
  Parse the following command and extract the task details.
  - The 'title' should be a concise action item.
  - The 'dueDate' should be in ISO 8601 format. If a time is mentioned without a date, assume it's for today. If no date or time is mentioned, use today's date.
  - The 'priority' should be one of 'Low', 'Medium', 'High', 'Critical'. Default to 'Medium' if not specified.

  Command: "{{command}}"

  Return a JSON object with the extracted details.`,
});

const createTaskFromTextFlow = ai.defineFlow(
  {
    name: 'createTaskFromTextFlow',
    inputSchema: CreateTaskFromTextInputSchema,
    outputSchema: CreateTaskFromTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
