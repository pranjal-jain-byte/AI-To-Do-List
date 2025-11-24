'use client';

import { useState } from 'react';
import { useCollection, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MoreHorizontal,
  PlusCircle,
  Pencil,
  Trash2,
  Loader2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Task } from '@/lib/types';
import { TaskDialog } from '@/components/dashboard/task-dialog';
import { DeleteTaskAlert } from '@/components/dashboard/delete-task-alert';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { collection, query, where, doc, serverTimestamp, addDoc } from 'firebase/firestore';
import { updateDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

const priorityVariant = {
  Low: 'secondary',
  Medium: 'outline',
  High: 'default',
  Critical: 'destructive',
} as const;

function TaskToolbar({ onAddTask }: { onAddTask: () => void }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h1 className="text-2xl font-bold font-headline">My Tasks</h1>
      <Button onClick={onAddTask}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Task
      </Button>
    </div>
  );
}

function TaskTable({
  tasks,
  onEdit,
  onDelete,
  onToggle,
}: {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onToggle: (task: Task) => void;
}) {
  if (!tasks || tasks.length === 0) {
    return <p className="text-center text-muted-foreground p-8">No tasks here!</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[40px]"></TableHead>
          <TableHead>Title</TableHead>
          <TableHead className="w-[120px]">Priority</TableHead>
          <TableHead className="w-[180px]">Due Date</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => (
          <TableRow
            key={task.id}
            className={cn(task.status === 'done' && 'text-muted-foreground')}
          >
            <TableCell>
              <Checkbox
                checked={task.status === 'done'}
                onCheckedChange={() => onToggle(task)}
                aria-label="Mark task as complete"
              />
            </TableCell>
            <TableCell
              className={cn(
                'font-semibold',
                task.status === 'done' && 'line-through'
              )}
            >
              {task.title}
            </TableCell>
            <TableCell>
              <Badge variant={priorityVariant[task.priority] || 'default'}>
                {task.priority}
              </Badge>
            </TableCell>
            <TableCell>
              {new Date(task.dueDate).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(task)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(task)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function TasksPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  
  const tasksQuery = useMemoFirebase(() => {
    if (!user?.uid) return null;
    return query(collection(firestore, 'tasks'), where('ownerId', '==', user.uid));
  }, [firestore, user?.uid]);

  const { data: tasks, isLoading } = useCollection<Task>(tasksQuery);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const upcomingTasks = tasks?.filter(task => task.status !== 'done' && new Date(task.dueDate) >= new Date(new Date().setHours(0,0,0,0))) || [];
  const completedTasks = tasks?.filter(task => task.status === 'done') || [];

  const handleAddTask = () => {
    setSelectedTask(null);
    setIsDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsDialogOpen(true);
  };

  const handleDeleteTask = (task: Task) => {
    setSelectedTask(task);
    setIsAlertDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedTask) {
      deleteDocumentNonBlocking(doc(firestore, 'tasks', selectedTask.id));
      setIsAlertDialogOpen(false);
      setSelectedTask(null);
    }
  };

  const handleToggleComplete = (taskToToggle: Task) => {
    const taskRef = doc(firestore, 'tasks', taskToToggle.id);
    const newStatus = taskToToggle.status === 'done' ? 'todo' : 'done';
    
    updateDocumentNonBlocking(taskRef, {
      status: newStatus,
      completedAt: newStatus === 'done' ? serverTimestamp() : null,
      updatedAt: serverTimestamp(),
      version: (taskToToggle.version || 1) + 1
    });
  };

  const handleSaveTask = (
    taskData: Omit<Task, 'id' | 'ownerId' | 'status' | 'version' | 'createdAt' | 'updatedAt' | 'completedAt'> & { id?: string }
  ) => {
    if (!user) return;
    
    if (taskData.id) {
      const taskRef = doc(firestore, 'tasks', taskData.id);
      const existingTask = tasks?.find(t => t.id === taskData.id);
      setDocumentNonBlocking(taskRef, {
        ...taskData,
        version: (existingTask?.version || 1) + 1,
        updatedAt: serverTimestamp(),
      }, { merge: true });

    } else {
      const newTask: Omit<Task, 'id'> = {
        ...taskData,
        ownerId: user.uid,
        status: 'todo',
        version: 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        completedAt: null,
        tags: [],
        description: taskData.description || '',
      };
      addDoc(collection(firestore, 'tasks'), newTask);
    }
    setIsDialogOpen(false);
    setSelectedTask(null);
  };

  return (
    <div className="space-y-6">
      <TaskToolbar onAddTask={handleAddTask} />
       {isLoading && (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
       )}
       {!isLoading && (
        <>
            <Card>
                <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-2 pl-4">Upcoming</h2>
                <TaskTable
                    tasks={upcomingTasks}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                    onToggle={handleToggleComplete}
                />
                </CardContent>
            </Card>
            {completedTasks.length > 0 && (
                <Accordion type="single" collapsible>
                <AccordionItem value="completed">
                    <Card>
                    <AccordionTrigger className="p-6">
                        <h2 className="text-lg font-semibold">
                        Completed ({completedTasks.length})
                        </h2>
                    </AccordionTrigger>
                    <AccordionContent>
                        <CardContent>
                        <TaskTable
                            tasks={completedTasks}
                            onEdit={handleEditTask}
                            onDelete={handleDeleteTask}
                            onToggle={handleToggleComplete}
                        />
                        </CardContent>
                    </AccordionContent>
                    </Card>
                </AccordionItem>
                </Accordion>
            )}
        </>
       )}

      <TaskDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveTask}
        task={selectedTask}
      />

      <DeleteTaskAlert
        isOpen={isAlertDialogOpen}
        onClose={() => setIsAlertDialogOpen(false)}
        onConfirm={confirmDelete}
        task={selectedTask}
      />
    </div>
  );
}
