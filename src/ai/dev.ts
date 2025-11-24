import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-task-order.ts';
import '@/ai/flows/summarize-notes.ts';
import '@/ai/flows/extract-tasks-from-notes.ts';
import '@/ai/flows/generate-team-status-summary.ts';
import '@/ai/flows/suggest-task-distribution.ts';