'use client';

import { useState } from 'react';
import { tasks as initialTasks } from '@/lib/data';
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
  ChevronDown,
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
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const incompleteTasks = tasks.filter((task) => task.status !== 'done');
  const completedTasks = tasks.filter((task) => task.status === 'done');

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
      setTasks(tasks.filter((task) => task.id !== selectedTask.id));
      setIsAlertDialogOpen(false);
      setSelectedTask(null);
    }
  };

  const handleToggleComplete = (taskToToggle: Task) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskToToggle.id
          ? {
              ...task,
              status: task.status === 'done' ? 'todo' : 'done',
            }
          : task
      )
    );
  };

  const handleSaveTask = (
    taskData: Omit<Task, 'id' | 'ownerId' | 'status'> & { id?: string }
  ) => {
    if (taskData.id) {
      // Edit existing task
      setTasks(
        tasks.map((task) =>
          task.id === taskData.id ? { ...task, ...taskData } : task
        )
      );
    } else {
      // Add new task
      const newTask: Task = {
        ...taskData,
        id: `TASK-${Math.floor(Math.random() * 10000)}`,
        ownerId: 'user-1', // Assuming a logged in user
        status: 'todo',
        tags: taskData.tags || [],
        description: taskData.description || '',
      };
      setTasks([newTask, ...tasks]);
    }
    setIsDialogOpen(false);
    setSelectedTask(null);
  };

  return (
    <div className="space-y-6">
      <TaskToolbar onAddTask={handleAddTask} />
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold mb-2 pl-4">Upcoming</h2>
          <TaskTable
            tasks={incompleteTasks}
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
