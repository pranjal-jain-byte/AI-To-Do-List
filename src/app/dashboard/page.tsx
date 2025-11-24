'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { List, CheckCircle2, AlertCircle, Zap, Clock, Users, FileText, CheckSquare, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TaskDialog } from '@/components/dashboard/task-dialog';
import { TeamDialog } from '@/components/dashboard/team-dialog';
import type { Task, Team, User } from '@/lib/types';
import { suggestTaskOrder } from '@/ai/flows/suggest-task-order';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { AskAiDialog } from '@/components/dashboard/ask-ai-dialog';
import { createTaskFromText } from '@/ai/flows/create-task-from-text';
import { useCollection, useDoc, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, serverTimestamp, addDoc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

function TodaysPlan() {
    const { user } = useUser();
    const firestore = useFirestore();
    
    const tasksQuery = useMemoFirebase(() => {
        if (!user?.uid) return null; 
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return query(
            collection(firestore, 'tasks'),
            where('ownerId', '==', user.uid),
            where('status', '!=', 'done'),
            where('dueDate', '>=', today.toISOString()),
            where('dueDate', '<', tomorrow.toISOString())
        );
    }, [firestore, user?.uid]);

    const { data: initialTasks, isLoading } = useCollection<Task>(tasksQuery);
    const [todaysTasks, setTodaysTasks] = useState<Task[]>([]);
    const [isReplanning, setIsReplanning] = useState(false);
    const { toast } = useToast();
    
    useEffect(() => {
        if (initialTasks) {
            setTodaysTasks(initialTasks.slice(0, 5));
        }
    }, [initialTasks]);

    const handleReplan = async () => {
        if (!todaysTasks || todaysTasks.length === 0) return;
        setIsReplanning(true);
        try {
            const result = await suggestTaskOrder({ tasks: todaysTasks });
            const orderedTasks = result.orderedTasks.map(taskId => 
                todaysTasks.find(t => t.id === taskId)
            ).filter((t): t is Task => !!t);
            setTodaysTasks(orderedTasks);
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
    
    return (
        <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    <span>Today's Plan (AI Ordered)</span>
                </CardTitle>
                <CardDescription>Your AI-optimized schedule for today.
                <Button size="sm" variant="outline" className="ml-4" onClick={handleReplan} disabled={isReplanning}>
                    {isReplanning ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null }
                    Re-plan my day
                </Button>
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading && <p>Loading today's plan...</p>}
                {!isLoading && todaysTasks && todaysTasks.length > 0 ? (
                <ul className="space-y-4">
                    {todaysTasks.map((task, index) => (
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
                    <div className="text-center py-8 text-muted-foreground">
                        <p>No tasks due today. Enjoy your day!</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function StatsCards() {
    const { user } = useUser();
    const firestore = useFirestore();

    const userSummaryDoc = useMemoFirebase(() => {
        if (!user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);

    const { data: userSummary, isLoading } = useDoc<User>(userSummaryDoc);
    
    if (isLoading || !userSummary) {
        return (
            <>
                <Card><CardContent className="pt-6"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></CardContent></Card>
                <Card><CardContent className="pt-6"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></CardContent></Card>
                <Card><CardContent className="pt-6"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></CardContent></Card>
            </>
        )
    }

    const summary = userSummary.summary;
    const overdueTasks = summary?.overdue || 0;

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                    <List className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{summary?.totalTasks || 0}</div>
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
                        {summary?.completedToday || 0}
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
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Partial<Task> | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'ownerId' | 'status' | 'version' | 'createdAt' | 'updatedAt' | 'completedAt'> & { id?: string }) => {
    if (!user) return;

    const taskToSave: Omit<Task, 'id'> = {
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
    
    if (taskData.id) {
        const taskRef = doc(firestore, 'tasks', taskData.id);
        setDocumentNonBlocking(taskRef, taskToSave, { merge: true });
    } else {
        const tasksCol = collection(firestore, 'tasks');
        addDoc(tasksCol, taskToSave);
    }
    
    toast({
        title: taskData.id ? "Task updated!" : "Task created!",
        description: `"${taskData.title}" has been saved.`,
    });
    setIsTaskDialogOpen(false);
    setTaskToEdit(null);
  };
  
  const handleSaveTeam = (teamData: Omit<Team, 'id' | 'members' | 'createdAt'>) => {
    if(!user) return;
    
    const newTeam: Omit<Team, 'id'> = {
        ...teamData,
        members: [user.uid],
        createdAt: serverTimestamp(),
    };
    
    addDoc(collection(firestore, 'teams'), newTeam);

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

  // The parent layout now handles the main loading state
  if (!user) {
      return null;
  }

  return (
    <>
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Welcome back, {user.displayName?.split(' ')[0]}!</h1>
        <p className="text-muted-foreground">Here's your productivity snapshot for today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatsCards />
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
          <TodaysPlan />
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
