'use server';

/**
 * @fileOverview Suggests task distribution among team members based on workload and skills.
 *
 * - suggestTaskDistribution - A function that suggests task distribution.
 * - SuggestTaskDistributionInput - The input type for the suggestTaskDistribution function.
 * - SuggestTaskDistributionOutput - The return type for the suggestTaskDistribution function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTaskDistributionInputSchema = z.object({
  tasks: z.array(
    z.object({
      id: z.string().describe('The unique identifier of the task.'),
      title: z.string().describe('The title of the task.'),
      description: z.string().describe('A detailed description of the task.'),
      priority: z.enum(['Low', 'Medium', 'High', 'Critical']).describe('The priority of the task.'),
      estimatedDuration: z.number().describe('The estimated duration of the task in hours.'),
      requiredSkills: z.array(z.string()).describe('List of skills required for the task.'),
    })
  ).describe('The list of tasks to be distributed.'),
  teamMembers: z.array(
    z.object({
      id: z.string().describe('The unique identifier of the team member.'),
      name: z.string().describe('The name of the team member.'),
      availableHoursPerWeek: z.number().describe('The number of hours per week the team member is available.'),
      skills: z.array(z.string()).describe('List of skills the team member possesses.'),
      currentWorkload: z.number().describe('The team member current workload in hours.'),
    })
  ).describe('The list of team members to distribute the tasks among.'),
});
export type SuggestTaskDistributionInput = z.infer<typeof SuggestTaskDistributionInputSchema>;

const SuggestTaskDistributionOutputSchema = z.array(
  z.object({
    taskId: z.string().describe('The ID of the assigned task'),
    teamMemberId: z.string().describe('The ID of the team member assigned to the task'),
    reason: z.string().describe('Explanation of why the task was assigned to this team member.'),
  })
).describe('The suggested task distribution among team members.');
export type SuggestTaskDistributionOutput = z.infer<typeof SuggestTaskDistributionOutputSchema>;

export async function suggestTaskDistribution(input: SuggestTaskDistributionInput): Promise<SuggestTaskDistributionOutput> {
  return suggestTaskDistributionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTaskDistributionPrompt',
  input: { schema: SuggestTaskDistributionInputSchema },
  output: { schema: SuggestTaskDistributionOutputSchema },
  prompt: `You are an AI project manager responsible for suggesting the distribution of tasks among team members.

Given the following tasks:

{{#each tasks}}
Task ID: {{this.id}}
Title: {{this.title}}
Description: {{this.description}}
Priority: {{this.priority}}
Estimated Duration: {{this.estimatedDuration}} hours
Required Skills: {{#each this.requiredSkills}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
{{/each}}

And the following team members:

{{#each teamMembers}}
Team Member ID: {{this.id}}
Name: {{this.name}}
Available Hours Per Week: {{this.availableHoursPerWeek}} hours
Skills: {{#each this.skills}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
Current Workload: {{this.currentWorkload}} hours
{{/each}}

Suggest an optimal task distribution, taking into account workload, skills, and task priorities. Provide a brief reason for each assignment.

Return the output as a JSON array of objects with taskId, teamMemberId, and reason fields.  The output must match the following schema:
${JSON.stringify(SuggestTaskDistributionOutputSchema)}
`,
});

const suggestTaskDistributionFlow = ai.defineFlow(
  {
    name: 'suggestTaskDistributionFlow',
    inputSchema: SuggestTaskDistributionInputSchema,
    outputSchema: SuggestTaskDistributionOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
