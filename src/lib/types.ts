export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
};

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  dueDate: string; // ISO string
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  estimatedDuration: number; // in minutes
  tags: string[];
  ownerId: string;
  teamId?: string;
  assignedTo?: string; // userId
};

export type Note = {
  id: string;
  ownerId: string;
  title: string;
  content: string;
  createdAt: string; // ISO string
};

export type Team = {
  id: string;
  name: string;
  description: string;
  members: User[];
};
