'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { List, CheckCircle2, AlertCircle, Zap, Clock, Users, FileText, CheckSquare, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TaskDialog } from '@/components/dashboard/task-dialog';
import { TeamDialog } from '@/components/dashboard/team-dialog';
import type { Task, Team } from '@/lib/types';
import { suggestTaskOrder } from '@/ai/flows/suggest-task-order';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { AskAiDialog } from '@/components/dashboard/ask-ai-dialog';
import { createTaskFromText } from '@/ai/flows/create-task-from-text';
import { useCollection, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, serverTimestamp, addDoc, updateDoc } from 'firebase/firestore';

function TodaysPlan({ tasks, isLoading }: { tasks: Task[], isLoading: boolean }) {
    const [orderedTasks, setOrderedTasks] = useState<Task[]>([]);
    const [isReplanning, setIsReplanning] = useState(false);
    const { toast } = useToast();
    
    const handleReplan = async () => {
        const tasksToReplan = tasks;
        if (!tasksToReplan || tasksToReplan.length === 0) return;

        setIsReplanning(true);
        try {
            const result = await suggestTaskOrder({ tasks: tasksToReplan });
            const reorderedTasks = result.orderedTasks.map(taskId => 
                tasksToReplan.find(t => t.id === taskId)
            ).filter((t): t is Task => !!t);
            setOrderedTasks(reorderedTasks);
            toast({
                title: "Your day has been re-planned!",
                description: result.reasoning,
            });
        } catch (error) {
            console.error("Failed to re-plan day:", error);
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: "Could not get a new plan from AI.",
            });
        } finally {
            setIsReplanning(false);
        }
    };
    
    const displayTasks = orderedTasks.length > 0 ? orderedTasks : tasks;

    return (
        <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    <span>Today's Plan (AI Ordered)</span>
                </CardTitle>
                <CardDescription>Your AI-optimized schedule for today.
                <Button size="sm" variant="outline" className="ml-4" onClick={handleReplan} disabled={isReplanning || isLoading || tasks.length === 0}>
                    {isReplanning ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null }
                    Re-plan my day
                </Button>
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading && (
                    <div className="flex items-center justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        <p className="ml-2 text-muted-foreground">Loading today's plan...</p>
                    </div>
                )}
                {!isLoading && displayTasks && displayTasks.length > 0 ? (
                <ul className="space-y-4">
                    {displayTasks.map((task, index) => (
                        <li key={task.id} className="flex items-start gap-4">
                             <div className="flex flex-col items-center">
                                <span className="text-sm font-bold text-primary">
                                    {new Date(new Date().setHours(9 + index, 0, 0)).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                                </span>
                            </div>
                            <div className="w-px bg-border h-full translate-y-4 -translate-x-2"></div>
                            <div className="flex-1 space-y-1 pb-4 border-b last:border-b-0">
                                <p className="font-medium">{task.title}</p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Badge variant={task.priority === 'High' || task.priority === 'Critical' ? 'destructive' : 'secondary'}>{task.priority}</Badge>
                                    <Clock className="h-3 w-3" /> 
                                    <span>{task.estimatedDuration} min</span>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
                ) : (
                    !isLoading && (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>No tasks due today. Enjoy your day!</p>
                        </div>
                    )
                )}
            </CardContent>
        </Card>
    );
}

function StatsCards({ totalTasks, completedToday, overdueTasks, isLoading }: { totalTasks: number, completedToday: number, overdueTasks: number, isLoading: boolean }) {
    if (isLoading) {
        return (
            <>
                <Card><CardContent className="pt-6 h-28 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></CardContent></Card>
                <Card><CardContent className="pt-6 h-28 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></CardContent></Card>
                <Card><CardContent className="pt-6 h-28 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></CardContent></Card>
            </>
        );
    }

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                    <List className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalTasks}</div>
                    <p className="text-xs text-muted-foreground">Across all projects</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {completedToday}
                    </div>
                    <p className="text-xs text-muted-foreground">Great progress!</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${overdueTasks > 0 ? 'text-destructive' : ''}`}>{overdueTasks}</div>
                    <p className="text-xs text-muted-foreground">Tasks needing attention</p>
                </CardContent>
            </Card>
        </>
    );
}


export default function DashboardPage() {
  const { user } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Partial<Task> | null>(null);
  const { toast } = useToast();

  const tasksQuery = useMemoFirebase(() => {
    if (!user?.uid) return null;
    return query(collection(firestore, 'tasks'), where('ownerId', '==', user.uid));
  }, [firestore, user?.uid]);

  const { data: tasks, isLoading: isLoadingTasks } = useCollection<Task>(tasksQuery);

  const stats = useMemo(() => {
    if (!tasks) {
      return { totalTasks: 0, completedToday: 0, overdueTasks: 0 };
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const completedToday = tasks.filter(task => {
        if (!task.completedAt) return false;
        // Firestore serverTimestamp can be a Date object or a Timestamp object
        const completedDate = (task.completedAt as any).toDate ? (task.completedAt as any).toDate() : new Date(task.completedAt);
        return completedDate >= today;
    }).length;

    const overdueTasks = tasks.filter(task => 
        task.status !== 'done' && new Date(task.dueDate) < today
    ).length;

    return {
        totalTasks: tasks.length,
        completedToday,
        overdueTasks,
    };
  }, [tasks]);

  const todaysTasks = useMemo(() => {
    if (!tasks) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return tasks
        .filter(task => {
            const dueDate = new Date(task.dueDate);
            return task.status !== 'done' && dueDate >= today && dueDate < tomorrow;
        })
        .slice(0, 5);
  }, [tasks]);


  const handleSaveTask = async (taskData: Omit<Task, 'id' | 'ownerId' | 'status' | 'version' | 'createdAt' | 'updatedAt' | 'completedAt'> & { id?: string }) => {
    if (!user) return;

    if (taskData.id) {
        const taskRef = doc(firestore, 'tasks', taskData.id);
        const existingTask = tasks?.find(t => t.id === taskData.id);
        await updateDoc(taskRef, {
          ...taskData,
          ownerId: user.uid, // Ensure ownerId is always present
          version: (existingTask?.version || 1) + 1,
          updatedAt: serverTimestamp(),
        });
    } else {
         const taskToSave = {
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
        await addDoc(collection(firestore, 'tasks'), taskToSave);
    }
    
    toast({
        title: taskData.id ? "Task updated!" : "Task created!",
        description: `"${taskData.title}" has been saved.`,
    });
    setIsTaskDialogOpen(false);
    setTaskToEdit(null);
  };
  
  const handleSaveTeam = async (teamData: Omit<Team, 'id' | 'members' | 'createdAt'>) => {
    if(!user) return;
    
    const newTeam: Omit<Team, 'id'> = {
        ...teamData,
        members: [user.uid],
        createdAt: serverTimestamp(),
    };
    
    await addDoc(collection(firestore, 'teams'), newTeam);

     toast({
        title: "Team created!",
        description: `The "${teamData.name}" team has been created.`,
    });
    setIsTeamDialogOpen(false);
  };

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

  const openNewTaskDialog = () => {
    setTaskToEdit(null);
    setIsTaskDialogOpen(true);
  }

  return (
    <>
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Welcome back, {user?.displayName?.split(' ')[0]}!</h1>
        <p className="text-muted-foreground">Here's your productivity snapshot for today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatsCards 
            totalTasks={stats.totalTasks}
            completedToday={stats.completedToday}
            overdueTasks={stats.overdueTasks}
            isLoading={isLoadingTasks}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
          <TodaysPlan tasks={todaysTasks} isLoading={isLoadingTasks} />
          <Card className="col-span-1 lg:col-span-1">
              <CardHeader>
                  <CardTitle>Quick Access</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                  <Button variant="outline" size="lg" className="h-24 flex-col gap-2" onClick={openNewTaskDialog}><CheckSquare/>New Task</Button>
                  <Button variant="outline" size="lg" className="h-24 flex-col gap-2" onClick={() => router.push('/dashboard/notes')}><FileText/>New Note</Button>
                  <Button variant="outline" size="lg" className="h-24 flex-col gap-2" onClick={() => setIsTeamDialogOpen(true)}><Users/>New Team</Button>
                  <Button variant="outline" size="lg" className="h-24 flex-col gap-2" onClick={() => setIsAiDialogOpen(true)}><Zap/>Ask AI</Button>
              </CardContent>
          </Card>
      </div>
    </div>
    <TaskDialog
        isOpen={isTaskDialogOpen}
        onClose={() => setIsTaskDialogOpen(false)}
        onSave={handleSaveTask}
        task={taskToEdit}
      />
      <TeamDialog
        isOpen={isTeamDialogOpen}
        onClose={() => setIsTeamDialogOpen(false)}
        onSave={handleSaveTeam}
      />
      <AskAiDialog
        isOpen={isAiDialogOpen}
        onClose={() => setIsAiDialogOpen(false)}
        onSubmit={handleAiSubmit}
       />
    </>
  );
}
