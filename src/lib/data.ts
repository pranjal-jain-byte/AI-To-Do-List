import { placeholderImages } from '@/lib/placeholder-images';
import type { User, Team, Task, Note } from './types';

const users: User[] = [
  { id: 'user-1', name: 'Sarah Lee', email: 'sarah@example.com', avatarUrl: placeholderImages.find(p => p.id === 'avatar1')?.imageUrl || '' },
  { id: 'user-2', name: 'Mike Chen', email: 'mike@example.com', avatarUrl: placeholderImages.find(p => p.id === 'avatar2')?.imageUrl || '' },
  { id: 'user-3', name: 'Jessica Brown', email: 'jessica@example.com', avatarUrl: placeholderImages.find(p => p.id === 'avatar3')?.imageUrl || '' },
  { id: 'user-4', name: 'David Wilson', email: 'david@example.com', avatarUrl: placeholderImages.find(p => p.id === 'avatar4')?.imageUrl || '' },
  { id: 'user-5', name: 'Emily Jones', email: 'emily@example.com', avatarUrl: placeholderImages.find(p => p.id === 'avatar5')?.imageUrl || '' },
  { id: 'user-6', name: 'Chris Green', email: 'chris@example.com', avatarUrl: placeholderImages.find(p => p.id === 'avatar6')?.imageUrl || '' },
];

export const teams: Team[] = [
  {
    id: 'team-1',
    name: 'Project Phoenix',
    description: 'Developing the next-gen AI-powered productivity suite.',
    members: [users[0], users[1], users[2]],
  },
  {
    id: 'team-2',
    name: 'Marketing Q3 Campaign',
    description: 'Launch campaign for the new product line.',
    members: [users[3], users[4], users[0]],
  },
  {
    id: 'team-3',
    name: 'Website Redesign',
    description: 'Complete overhaul of the company website.',
    members: [users[1], users[5]],
  },
];

export const tasks: Task[] = [
    {
      id: "TASK-8782",
      title: "Develop AI-powered task prioritization feature",
      status: "in_progress",
      priority: "High",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      estimatedDuration: 480,
      tags: ["feature", "AI"],
      ownerId: "user-1",
      teamId: "team-1",
      assignedTo: "user-1"
    },
    {
      id: "TASK-7878",
      title: "Design new user onboarding flow",
      status: "todo",
      priority: "Medium",
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      estimatedDuration: 240,
      tags: ["design", "UX"],
      ownerId: "user-2",
      teamId: "team-1",
      assignedTo: "user-2"
    },
    {
      id: "TASK-4587",
      title: "Fix bug in note synchronization",
      status: "done",
      priority: "Critical",
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      estimatedDuration: 90,
      tags: ["bug", "notes"],
      ownerId: "user-3",
      teamId: "team-1",
      assignedTo: "user-3"
    },
    {
      id: "TASK-3210",
      title: "Create marketing copy for Q3 campaign",
      status: "in_progress",
      priority: "Medium",
      dueDate: new Date().toISOString(),
      estimatedDuration: 180,
      tags: ["marketing"],
      ownerId: "user-4",
      teamId: "team-2",
      assignedTo: "user-4"
    },
    {
        id: "TASK-9845",
        title: "Write documentation for the new API",
        status: "todo",
        priority: "Low",
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        estimatedDuration: 300,
        tags: ["documentation"],
        ownerId: "user-1",
    },
    {
        id: "TASK-6543",
        title: "Plan personal study schedule for Next.js",
        status: "todo",
        priority: "Medium",
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        estimatedDuration: 60,
        tags: ["study", "personal"],
        ownerId: "user-1",
    }
];

export const notes: Note[] = [
    {
        id: "NOTE-1",
        ownerId: "user-1",
        title: "Q3 Brainstorming Session",
        content: "Key takeaways from the meeting:\n- Focus on AI-driven features for the next quarter.\n- Potential new features: AI-generated summaries, smart scheduling, proactive suggestions.\n- Action item: Sarah to create a detailed proposal for the task prioritization feature.\n- Action item: Mike to research competitor AI offerings.",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: "NOTE-2",
        ownerId: "user-1",
        title: "LangChain & LangGraph Research",
        content: "LangGraph seems powerful for building stateful, multi-step AI agents. We can use it to create our 'Plan my day' workflow. It allows for cycles, which is great for retrying steps or asking for user clarification. Tools would be Firebase readers/writers.",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: "NOTE-3",
        ownerId: "user-1",
        title: "Personal Goals",
        content: "1. Finish the advanced TypeScript course.\n2. Read 'Designing Data-Intensive Applications'.\n3. Contribute to an open-source project.",
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    }
]

export const getAuthenticatedUser = (): User => {
    return users[0];
}
