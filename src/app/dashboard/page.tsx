import { getAuthenticatedUser, tasks } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { List, CheckCircle2, AlertCircle, Zap, Clock, Users, FileText, CheckSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

const priorityIcons = {
    'High': 'text-red-500',
    'Critical': 'text-red-700',
    'Medium': 'text-yellow-500',
    'Low': 'text-green-500',
}

function TodaysPlan() {
    const todaysTasks = tasks.filter(t => new Date(t.dueDate).toDateString() === new Date().toDateString()).slice(0, 5);
    
    return (
        <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    <span>Today's Plan (AI Ordered)</span>
                </CardTitle>
                <CardDescription>Your AI-optimized schedule for today.
                <Button size="sm" variant="outline" className="ml-4">Re-plan my day</Button>
                </CardDescription>
            </CardHeader>
            <CardContent>
                {todaysTasks.length > 0 ? (
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
    const overdueTasks = tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'done').length;

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                    <List className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{tasks.length}</div>
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
                        {tasks.filter(t => new Date(t.dueDate).toDateString() === new Date().toDateString() && t.status === 'done').length}
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
  const user = getAuthenticatedUser();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Welcome back, {user.name.split(' ')[0]}!</h1>
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
                  <Button variant="outline" size="lg" className="h-24 flex-col gap-2"><CheckSquare/>New Task</Button>
                  <Button variant="outline" size="lg" className="h-24 flex-col gap-2"><FileText/>New Note</Button>
                  <Button variant="outline" size="lg" className="h-24 flex-col gap-2"><Users/>New Team</Button>
                  <Button variant="outline" size="lg" className="h-24 flex-col gap-2"><Zap/>Ask AI</Button>
              </CardContent>
          </Card>
      </div>
    </div>
  );
}
