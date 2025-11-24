import { FieldValue } from "firebase/firestore";

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: FieldValue;
  summary: {
    totalTasks: number;
    completedToday: number;
    overdue: number;
    lastUpdated: FieldValue;
  }
};

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  dueDate: string; // ISO string
  completedAt: FieldValue | null;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  estimatedDuration: number; // in minutes
  tags: string[];
  ownerId: string;
  teamId?: string;
  assignedTo?: string; // userId
  version: number;
  createdAt: FieldValue;
  updatedAt: FieldValue;
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
  members: string[]; // array of user IDs
  createdAt: FieldValue;
};

// Simplified user for non-auth flow
export interface LocalUser {
  uid: string;
  displayName: string;
}
