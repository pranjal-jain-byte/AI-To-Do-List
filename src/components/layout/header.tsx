'use client';

import React, { useState } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Zap, ChevronRight } from 'lucide-react';
import { UserNav } from './user-nav';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { AskAiDialog } from '@/components/dashboard/ask-ai-dialog';
import { createTaskFromText } from '@/ai/flows/create-task-from-text';
import { useToast } from '@/hooks/use-toast';
import { TaskDialog } from '../dashboard/task-dialog';
import type { Task } from '@/lib/types';
import { useFirestore, useUser } from '@/firebase';
import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';


function Breadcrumbs() {
    const pathname = usePathname();
    const segments = pathname.split('/').filter(Boolean);

    return (
        <nav className="hidden md:flex items-center gap-2 text-sm font-medium text-muted-foreground">
            {segments.map((segment, index) => {
                const href = '/' + segments.slice(0, index + 1).join('/');
                const isLast = index === segments.length - 1;
                return (
                    <React.Fragment key={href}>
                        <Link 
                            href={href} 
                            className={cn(
                                "capitalize hover:text-foreground",
                                isLast && "text-foreground"
                            )}
                        >
                            {segment}
                        </Link>
                        {!isLast && <ChevronRight className="h-4 w-4" />}
                    </React.Fragment>
                );
            })}
        </nav>
    );
}

export default function Header() {
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Partial<Task> | null>(null);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  
  const handleAiSubmit = async (command: string) => {
    try {
        const result = await createTaskFromText({ 
            command,
            context: {
                currentDate: new Date().toISOString()
            }
        });
        
        const partialTask: Partial<Task> = {
            title: result.title,
            dueDate: result.dueDate || new Date().toISOString(),
            priority: result.priority || 'Medium',
        };

        setTaskToEdit(partialTask);
        setIsAiDialogOpen(false);
        setIsTaskDialogOpen(true);

    } catch (error) {
        console.error("AI task creation failed", error);
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: "Could not create task from your command.",
        });
    }
  };

  const handleSaveTask = async (taskData: Omit<Task, 'id' | 'ownerId' | 'status' | 'version' | 'createdAt' | 'updatedAt' | 'completedAt'> & { id?: string }) => {
    if (!user) return;

    if (taskData.id) {
        const taskRef = doc(firestore, 'tasks', taskData.id);
        // Ensure you have the complete existing task data to preserve fields not in the form
        await updateDoc(taskRef, {
            ...taskData,
            updatedAt: serverTimestamp(),
        });
    } else {
        const taskToSave: Omit<Task, 'id'> = {
            title: taskData.title,
            description: taskData.description || '',
            priority: taskData.priority,
            dueDate: taskData.dueDate,
            teamId: taskData.teamId,
            estimatedDuration: taskData.estimatedDuration || 30,
            ownerId: user.uid,
            status: 'todo',
            version: 1,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            completedAt: null,
            tags: [],
        };
        await addDoc(collection(firestore, 'tasks'), taskToSave);
    }
    
    toast({
        title: taskData.id ? "Task updated!" : "Task created!",
        description: `"${taskData.title}" has been saved.`,
    });
    setIsTaskDialogOpen(false);
    setTaskToEdit(null);
  };

  return (
    <>
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
          <SidebarTrigger className="md:hidden" />
          <Breadcrumbs />
          <div className="flex-1" />
          <Button variant="outline" onClick={() => setIsAiDialogOpen(true)}>
              <Zap className="mr-2 h-4 w-4" />
              Ask AI
          </Button>
          <UserNav />
      </header>
      <AskAiDialog
        isOpen={isAiDialogOpen}
        onClose={() => setIsAiDialogOpen(false)}
        onSubmit={handleAiSubmit}
       />
       <TaskDialog
        isOpen={isTaskDialogOpen}
        onClose={() => setIsTaskDialogOpen(false)}
        onSave={handleSaveTask}
        task={taskToEdit}
      />
    </>
  );
}
