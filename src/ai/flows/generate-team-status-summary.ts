'use server';

/**
 * @fileOverview Generates a status summary for a team project, including completed tasks, pending tasks, and assignments.
 *
 * - generateTeamStatusSummary - A function that generates the team status summary.
 * - GenerateTeamStatusSummaryInput - The input type for the generateTeamStatusSummary function.
 * - GenerateTeamStatusSummaryOutput - The return type for the generateTeamStatusSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTeamStatusSummaryInputSchema = z.object({
  projectId: z.string().describe('The ID of the team project.'),
});
export type GenerateTeamStatusSummaryInput = z.infer<typeof GenerateTeamStatusSummaryInputSchema>;

const GenerateTeamStatusSummaryOutputSchema = z.object({
  summary: z.string().describe('A summary of the team project status.'),
});
export type GenerateTeamStatusSummaryOutput = z.infer<typeof GenerateTeamStatusSummaryOutputSchema>;

export async function generateTeamStatusSummary(
  input: GenerateTeamStatusSummaryInput
): Promise<GenerateTeamStatusSummaryOutput> {
  return generateTeamStatusSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTeamStatusSummaryPrompt',
  input: {schema: GenerateTeamStatusSummaryInputSchema},
  output: {schema: GenerateTeamStatusSummaryOutputSchema},
  prompt: `You are an AI assistant helping to manage team projects. Generate a concise status summary for project with ID {{{projectId}}}. The summary should include:

*   Completed tasks
*   Pending tasks
*   Task assignments to team members.

Keep the summary brief and informative.`,
});

const generateTeamStatusSummaryFlow = ai.defineFlow(
  {
    name: 'generateTeamStatusSummaryFlow',
    inputSchema: GenerateTeamStatusSummaryInputSchema,
    outputSchema: GenerateTeamStatusSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
