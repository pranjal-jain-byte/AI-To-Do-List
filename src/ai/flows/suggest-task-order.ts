'use server';

/**
 * @fileOverview AI flow to suggest the order tasks should be performed, taking into account task urgency, deadlines,
 * and estimated duration, to optimize productivity.
 *
 * - suggestTaskOrder - A function that suggests the order of tasks based on urgency, deadlines, and duration.
 * - TaskOrderInput - The input type for the suggestTaskOrder function.
 * - TaskOrderOutput - The return type for the suggestTaskOrder function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TaskSchema = z.object({
  id: z.string(),
  title: z.string().describe('The title of the task.'),
  description: z.string().optional().describe('A description of the task.'),
  dueDate: z.string().optional().describe('The due date of the task in ISO format.'),
  priority: z
    .enum(['Low', 'Medium', 'High', 'Critical'])
    .describe('The priority of the task.'),
  estimatedDuration: z
    .number()
    .optional()
    .describe('The estimated duration of the task in minutes.'),
  tags: z.array(z.string()).optional().describe('Tags or categories for the task.'),
});

const TaskOrderInputSchema = z.object({
  tasks: z.array(TaskSchema).describe('An array of tasks to be ordered.'),
});
export type TaskOrderInput = z.infer<typeof TaskOrderInputSchema>;

const TaskOrderOutputSchema = z.object({
  orderedTasks: z
    .array(z.string())
    .describe('An array of task IDs representing the suggested order.'),
  reasoning: z.string().describe('The AI reasoning for the suggested order.'),
});
export type TaskOrderOutput = z.infer<typeof TaskOrderOutputSchema>;

export async function suggestTaskOrder(input: TaskOrderInput): Promise<TaskOrderOutput> {
  return suggestTaskOrderFlow(input);
}

const suggestTaskOrderPrompt = ai.definePrompt({
  name: 'suggestTaskOrderPrompt',
  input: {schema: TaskOrderInputSchema},
  output: {schema: TaskOrderOutputSchema},
  prompt: `Given the following tasks, suggest an optimal order in which they should be performed to maximize productivity. Consider urgency, importance, deadlines, and estimated duration.

  Tasks:
  {{#each tasks}}
  - ID: {{id}}
    Title: {{title}}
    Description: {{description}}
    Due Date: {{dueDate}}
    Priority: {{priority}}
    Estimated Duration: {{estimatedDuration}} minutes
    Tags: {{tags}}
  {{/each}}

  Respond with a JSON object containing an "orderedTasks" array of task IDs in the suggested order and a "reasoning" field explaining the rationale behind the order.`,
});

const suggestTaskOrderFlow = ai.defineFlow(
  {
    name: 'suggestTaskOrderFlow',
    inputSchema: TaskOrderInputSchema,
    outputSchema: TaskOrderOutputSchema,
  },
  async input => {
    const {output} = await suggestTaskOrderPrompt(input);
    return output!;
  }
);
